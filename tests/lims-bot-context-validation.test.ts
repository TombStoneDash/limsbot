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

  async function accepted(fields: Record<string, unknown>) {
    const response = await postJson({ workflow: "field_sample", ...fields });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: expect.any(String),
      draftRecord: expect.any(String),
      structuredFields: expect.any(Object),
      mode: "template",
      requiresHumanApproval: true,
    });
    return draft;
  }

  it.each([null, [], ["sample"], "sample", 0, 42, true, false])(
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
            workflow: "field_sample",
            context: { [field]: value },
          });
          expect(response.status).toBe(400);
          expect(await response.json()).toEqual({
            error: `'context.${field}' must be a string when supplied`,
          });
        }
      );

      it.each(["", "Custom label"])("accepts a string: %j", async (value) => {
        await accepted({ context: { [field]: value } });
      });
    }
  );

  it.each([{}, { context: {} }, { context: { sample: "" } }])(
    "preserves default sample for %j",
    async (fields) => {
      const draft = await accepted(fields);
      expect(draft.draftTitle).toBe("Field Sample Documentation — Field Collection 001");
      expect(draft.structuredFields.sample_id).toBe("Field Collection 001");
    }
  );

  it("accepts partial context and unrelated properties", async () => {
    const draft = await accepted({
      context: { sample: "Sample 123", extra: { nested: [null, 1] } },
    });
    expect(draft.draftTitle).toBe("Field Sample Documentation — Sample 123");
    expect(draft.structuredFields.sample_id).toBe("Sample 123");
  });
});
