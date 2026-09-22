import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

const workflows = [
  "field_sample", "chain_of_custody", "instrument_maintenance",
  "reagent_lot", "asset_scan", "pilot_summary",
];
const labelFields = ["asset", "assetName", "lot", "sample", "operator"];
const approvalFields = {
  requiresHumanApproval: true,
  safetyNote: "AI draft only. Human review required before committing.",
  suggestedNextAction: "Approve, edit, or reject this draft.",
  mode: "template",
};

describe("LIMS BOT context validation", () => {
  const forbiddenFetch = vi.fn(() => {
    throw new Error("External requests are forbidden in this test");
  });

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "");
    forbiddenFetch.mockClear();
    vi.stubGlobal("fetch", forbiddenFetch);
  });

  afterEach(() => {
    try {
      expect(forbiddenFetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    }
  });

  function postJson(body: Record<string, unknown>) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
  }

  describe.each(workflows)("%s", (workflow) => {
    it.each([null, true, false, 0, 42, "", "context", [], ["sample"]])(
      "rejects malformed context %j", async (context) => {
        const response = await postJson({ workflow, context });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: workflow === "pilot_summary"
            ? "'context' must be a non-null JSON object for pilot_summary"
            : "'context' must be a non-null JSON object when supplied",
        });
      }
    );

    describe.each(labelFields)("context.%s", (field) => {
      it.each([null, true, false, 0, 42, {}, { label: "sample" }, [], ["sample"]])(
        "rejects non-string label %j", async (value) => {
          const response = await postJson({ workflow, context: { [field]: value } });
          expect(response.status).toBe(400);
          expect(await response.json()).toEqual({
            error: `'context.${field}' must be a string when supplied`,
          });
        }
      );
    });

    it.each([
      {},
      { context: {} },
      { context: { asset: "", assetName: "", lot: "", sample: "", operator: "" } },
      { context: { asset: "Asset 1", assetName: "Alias", lot: "Lot 1", sample: "Sample 1", operator: "Operator 1" } },
      { context: { extra: { nested: [1, null] } } },
    ])("accepts valid context and preserves approval fields: %j", async (body) => {
      const response = await postJson({ workflow, ...body });
      expect(response.status).toBe(200);
      const draft = await response.json();
      expect(draft).toMatchObject(approvalFields);
      expect(Object.values(draft.structuredFields).every((value) =>
        ["string", "number", "boolean"].includes(typeof value)
      )).toBe(true);
    });
  });

  it("returns a client error for the throwing sample.toString reproduction", async () => {
    const response = await postJson({
      workflow: "field_sample", context: { sample: { toString: null } },
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "'context.sample' must be a string when supplied",
    });
  });

  it.each([
    { workflow: "field_sample", context: { sample: "Sample α" }, text: "Sample ID: Sample α\n", structured: { sample_id: "Sample α" } },
    { workflow: "chain_of_custody", context: { sample: "Sample 2" }, text: "Sample: Sample 2\n", structured: { sample_id: "Sample 2" } },
    { workflow: "asset_scan", context: { asset: "Asset 1", assetName: "Alias" }, text: "Scanned asset: Asset 1\n", structured: { asset_label: "Asset 1" } },
    { workflow: "asset_scan", context: { assetName: "Alias" }, text: "Scanned asset: Alias\n", structured: { asset_label: "Alias" } },
    { workflow: "asset_scan", context: { asset: "", assetName: "Alias" }, text: "Scanned asset: Alias\n", structured: { asset_label: "Alias" } },
    { workflow: "instrument_maintenance", context: { asset: "Instrument 1", operator: "Operator 1" }, text: "Operator: Operator 1\n", structured: { asset_label: "Instrument 1" } },
    { workflow: "reagent_lot", context: { lot: "Custom lot" }, text: "Reagent: Custom lot\n", structured: { lot: "LOT-2026-001" } },
    { workflow: "field_sample", context: { sample: " " }, text: "Sample ID:  \n", structured: { sample_id: " " } },
  ])("preserves supplied strings: $workflow $context", async ({ workflow, context, text, structured }) => {
    const response = await postJson({ workflow, context });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({ ...approvalFields, structuredFields: structured });
    expect(draft.draftRecord).toContain(text);
  });

  it.each([
    { workflow: "field_sample", text: "Sample ID: Field Collection 001\n" },
    { workflow: "chain_of_custody", text: "Sample: Field Collection 001\n" },
    { workflow: "asset_scan", text: "Scanned asset: Sciclone G3 NGSx Workstation\n" },
    { workflow: "instrument_maintenance", text: "Asset: Sciclone G3 NGSx Workstation\n" },
    { workflow: "instrument_maintenance", text: "Operator: Pending operator sign-off\n" },
    { workflow: "reagent_lot", text: "Reagent: Buffer A · Lot LOT-2026-001 · Exp 2026-08-15\n" },
  ])("preserves omitted and empty label fallbacks: $text", async ({ workflow, text }) => {
    for (const body of [{}, { context: {} }, {
      context: { asset: "", assetName: "", lot: "", sample: "", operator: "" },
    }]) {
      const response = await postJson({ workflow, ...body });
      expect(response.status).toBe(200);
      expect((await response.json()).draftRecord).toContain(text);
    }
  });

  it.each(workflows.filter((workflow) => workflow !== "pilot_summary"))(
    "does not validate extra keys as pilot counts for %s", async (workflow) => {
      const response = await postJson({
        workflow, context: { approvedCount: { toString: null }, rejectedCount: ["invalid"], extra: null },
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject(approvalFields);
    }
  );
});
