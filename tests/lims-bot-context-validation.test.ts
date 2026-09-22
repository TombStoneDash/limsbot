import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

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

  function postJson(body: unknown) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
  }

  async function accepted(workflow: string, fields: Record<string, unknown>) {
    const response = await postJson({ workflow, ...fields });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: expect.any(String),
      draftRecord: expect.any(String),
      structuredFields: expect.any(Object),
      mode: "template",
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    return draft;
  }

  it.each([null, [], ["sample"], "", "sample", 0, 42, true, false])(
    "rejects non-object context: %j",
    async (context) => {
      const response = await postJson({ workflow: "field_sample", context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "'context' must be a non-null JSON object when supplied",
      });
    }
  );

  describe.each(["asset", "assetName", "sample", "lot", "operator", "assetType"])(
    "text field %s",
    (field) => {
      it.each([null, {}, [], ["text"], 0, 42, true, false])(
        "rejects malformed value: %j",
        async (value) => {
          const response = await postJson({
            workflow: "field_sample", context: { [field]: value },
          });
          expect(response.status).toBe(400);
          expect(await response.json()).toEqual({
            error: `'context.${field}' must be a string when supplied`,
          });
        }
      );

      it.each(["", "Custom label"])("accepts a string: %j", async (value) => {
        await accepted("field_sample", { context: { [field]: value } });
      });
    }
  );

  describe.each(["approvedCount", "rejectedCount"])("count field %s", (field) => {
    it.each(["2", -1, 1.5, Number.MAX_SAFE_INTEGER + 1, null, {}, [], true, false])(
      "rejects malformed value: %j",
      async (value) => {
        const response = await postJson({
          workflow: "pilot_summary",
          context: { approvedCount: 2, rejectedCount: 1, [field]: value },
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: `'context.${field}' must be a non-negative safe integer when supplied`,
        });
      }
    );

    it.each([0, 2, Number.MAX_SAFE_INTEGER])("accepts a safe count: %j", async (value) => {
      const draft = await accepted("pilot_summary", { context: { [field]: value } });
      expect(draft.structuredFields.drafts_total).toBe(value);
    });
  });

  it.each([{}, { context: {} }, { context: { sample: "" } }])(
    "preserves default sample for %j",
    async (fields) => {
      const draft = await accepted("field_sample", fields);
      expect(draft.draftTitle).toBe("Field Sample Documentation — Field Collection 001");
      expect(draft.structuredFields.sample_id).toBe("Field Collection 001");
    }
  );

  it.each([{}, { context: {} }])("defaults omitted counts to zero for %j", async (fields) => {
    const draft = await accepted("pilot_summary", fields);
    expect(draft.structuredFields).toMatchObject({
      drafts_approved: 0, drafts_rejected: 0, drafts_total: 0,
    });
  });

  it("accepts partial context and unrelated properties", async () => {
    const draft = await accepted("field_sample", {
      context: { sample: "Sample 123", extra: { nested: [null, 1] } },
    });
    expect(draft.draftTitle).toBe("Field Sample Documentation — Sample 123");
    expect(draft.structuredFields.sample_id).toBe("Sample 123");
  });

  it("preserves assetName fallback and operator defaults with partial context", async () => {
    const draft = await accepted("instrument_maintenance", {
      context: { assetName: "Custom instrument" },
    });
    expect(draft.structuredFields.asset_label).toBe("Custom instrument");
    expect(draft.draftRecord).toContain("Operator: Pending operator sign-off\n");
  });

  it("adds valid summary counts to three", async () => {
    const draft = await accepted("pilot_summary", {
      context: { approvedCount: 2, rejectedCount: 1 },
    });
    expect(draft.structuredFields).toMatchObject({
      drafts_approved: 2, drafts_rejected: 1, drafts_total: 3,
    });
    expect(draft.draftRecord).toContain("Total drafts reviewed: 3\n");
    expect(draft.draftRecord).toContain("Approval rate: 67%\n");
  });
});
