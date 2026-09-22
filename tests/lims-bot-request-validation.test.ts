import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/lims-bot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("LIMS BOT request validation", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected fetch")));
  });

  afterEach(() => {
    try {
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });

  async function expectBadRequest(body: unknown, error: string) {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
  }

  it("rejects malformed JSON", async () => {
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON" });
  });

  it.each([null, 42, 0, true, false, "field_sample", "", [], [{}]])(
    "rejects a non-object body: %j",
    async (body) => {
      await expectBadRequest(body, "Request body must be a non-null, non-array object");
    }
  );

  it.each([undefined, null, "", "unknown", "toString", 42, true, [], {}])(
    "rejects a missing or invalid workflow: %j",
    async (workflow) => {
      await expectBadRequest({ workflow }, "Missing or invalid 'workflow'");
    }
  );

  it.each([null, 42, 0, true, false, [], {}])(
    "rejects a non-string userMessage: %j",
    async (userMessage) => {
      await expectBadRequest(
        { workflow: "field_sample", userMessage },
        "'userMessage' must be a string when supplied"
      );
    }
  );

  it.each([null, 42, 0, true, false, "", "context", [], [{}]])(
    "rejects a non-object context: %j",
    async (context) => {
      await expectBadRequest(
        { workflow: "field_sample", context },
        "'context' must be a non-null, non-array object when supplied"
      );
    }
  );

  it.each([
    "field_sample", "chain_of_custody", "instrument_maintenance",
    "reagent_lot", "asset_scan", "pilot_summary",
  ])("accepts %s with omitted optional fields", async (workflow) => {
    const response = await POST(request({ workflow }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      draftTitle: expect.any(String),
      draftRecord: expect.any(String),
      structuredFields: expect.any(Object),
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
      mode: "template",
    });
  });

  it("accepts an empty note and context with existing defaults", async () => {
    const response = await POST(request({
      workflow: "field_sample", userMessage: "", context: {},
    }));
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.mode).toBe("template");
    expect(result.structuredFields.sample_id).toBe("Field Collection 001");
    expect(result.draftRecord).toContain("Operator note: Routine field collection. Conditions nominal.\n");
  });

  it.each([12, 1000, 1001])("preserves or truncates a %i-character note", async (length) => {
    const note = "x".repeat(length);
    const response = await POST(request({
      workflow: "field_sample",
      userMessage: note,
      context: { sample: "Sample 123", extra: { nested: true } },
    }));
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.mode).toBe("template");
    expect(result.draftTitle).toBe("Field Sample Documentation — Sample 123");
    expect(result.structuredFields.sample_id).toBe("Sample 123");
    expect(result.draftRecord).toContain(`Operator note: ${note.slice(0, 1000)}\n`);
  });
});
