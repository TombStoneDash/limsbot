import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

const workflows = [
  "field_sample", "chain_of_custody", "instrument_maintenance",
  "reagent_lot", "asset_scan", "pilot_summary",
];
const textFields = ["asset", "assetName", "lot", "sample", "operator"];

function postJson(body: Record<string, unknown>) {
  return POST(new NextRequest("http://localhost/api/lims-bot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

describe("LIMS BOT context validation", () => {
  const providerFetch = vi.fn();

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-key");
    providerFetch.mockReset();
    providerFetch.mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", providerFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe.each(workflows)("%s", (workflow) => {
    it.each([null, [], ["sample"], "", "sample", 0, 42, true, false])(
      "rejects invalid context %j before calling the provider",
      async (context) => {
        const response = await postJson({ workflow, context });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: `'context' must be a non-null JSON object for ${workflow}`,
        });
        expect(providerFetch).not.toHaveBeenCalled();
      }
    );

    describe.each(textFields)("context.%s", (field) => {
      it.each([null, {}, { id: "sample" }, [], ["sample"], 0, 42, true, false])(
        "rejects non-string value %j before calling the provider",
        async (value) => {
          const response = await postJson({ workflow, context: { [field]: value } });
          expect(response.status).toBe(400);
          expect(await response.json()).toEqual({
            error: `'context.${field}' must be a string when supplied`,
          });
          expect(providerFetch).not.toHaveBeenCalled();
        }
      );

      it.each(["", "Identifier 123"])("accepts string %j with other fields omitted", async (value) => {
        const response = await postJson({ workflow, context: { [field]: value } });
        expect(response.status).toBe(200);
        expect(providerFetch).toHaveBeenCalledTimes(1);
        const draft = await response.json();
        expect(draft.mode).toBe("template");
        expect(Object.values(draft.structuredFields).every((entry) =>
          ["string", "number", "boolean"].includes(typeof entry)
        )).toBe(true);
      });
    });

    it.each([
      {},
      { context: {} },
      { context: { unrelated: { nested: true }, another: null } },
    ])("accepts omitted fields and unrelated keys: %j", async (body) => {
      const response = await postJson({ workflow, ...body });
      expect(response.status).toBe(200);
      expect(providerFetch).toHaveBeenCalledTimes(1);
    });

    it("preserves empty-string fallbacks", async () => {
      vi.useFakeTimers();
      try {
        vi.setSystemTime(new Date("2026-09-22T12:00:00Z"));
        const baseline = await postJson({ workflow });
        const response = await postJson({
          workflow,
          context: Object.fromEntries(textFields.map((field) => [field, ""])),
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(await baseline.json());
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it.each([
    { workflow: "field_sample", context: { sample: "Sample 123" }, text: "Sample ID: Sample 123", fields: { sample_id: "Sample 123" } },
    { workflow: "chain_of_custody", context: { sample: "Sample 123" }, text: "Sample: Sample 123", fields: { sample_id: "Sample 123" } },
    { workflow: "instrument_maintenance", context: { asset: "Asset 123", operator: "Operator 123" }, text: "Operator: Operator 123", fields: { asset_label: "Asset 123" } },
    { workflow: "asset_scan", context: { asset: "", assetName: "Asset name 123" }, text: "Scanned asset: Asset name 123", fields: { asset_label: "Asset name 123" } },
    { workflow: "reagent_lot", context: { lot: "Lot 123" }, text: "Reagent: Lot 123", fields: {} },
  ])("preserves supplied text in $workflow drafts", async ({ workflow, context, text, fields }) => {
    const response = await postJson({ workflow, context });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.draftRecord).toContain(text);
    expect(draft.structuredFields).toMatchObject(fields);
  });
});
