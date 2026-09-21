import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "../src/app/api/lims-bot/route";

vi.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) },
}));

const fetchStub = vi.fn();

function postRaw(body: string) {
  return POST(new Request("http://localhost/api/lims-bot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }) as NextRequest);
}

function post(body: unknown) {
  return postRaw(JSON.stringify(body));
}

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "test-only-key");
  fetchStub.mockReset();
  fetchStub.mockRejectedValue(new Error("Provider calls are disabled in this test"));
  vi.stubGlobal("fetch", fetchStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("LIMS BOT top-level request validation", () => {
  it("rejects malformed JSON", async () => {
    const response = await postRaw('{"workflow":');
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON" });
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it.each([null, [], ["field_sample"], "field_sample", 42, true])(
    "rejects a non-object body: %j", async (body) => {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Request body must be a non-null, non-array object",
      });
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it.each([{}, { workflow: "unknown" }, { workflow: "" }, { workflow: null },
    { workflow: 42 }, { workflow: true }, { workflow: [] }, { workflow: {} }])(
    "rejects a missing or invalid workflow: %j", async (body) => {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Missing or invalid 'workflow'" });
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it.each([null, 42, 0, false, true, [], {}])(
    "rejects an invalid userMessage: %j", async (userMessage) => {
      const response = await post({ workflow: "field_sample", userMessage });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "'userMessage' must be a string" });
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it.each([null, [], ["sample"], "", "sample", 42, 0, false, true])(
    "rejects an invalid context: %j", async (context) => {
      const response = await post({ workflow: "field_sample", context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "'context' must be a non-null, non-array object",
      });
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it.each(["field_sample", "chain_of_custody", "instrument_maintenance",
    "reagent_lot", "asset_scan", "pilot_summary"])(
    "accepts %s with omitted optional fields", async (workflow) => {
      vi.stubEnv("OPENAI_API_KEY", "");
      const response = await post({ workflow });
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
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it.each([{}, { userMessage: "", context: {} }])(
    "preserves template defaults for %j", async (optionalFields) => {
      vi.stubEnv("OPENAI_API_KEY", "");
      const response = await post({ workflow: "field_sample", ...optionalFields });
      expect(response.status).toBe(200);
      const draft = await response.json();
      expect(draft.draftTitle).toBe("Field Sample Documentation — Field Collection 001");
      expect(draft.draftRecord).toContain("Operator note: Routine field collection. Conditions nominal.");
      expect(fetchStub).not.toHaveBeenCalled();
    },
  );

  it("truncates valid messages in template fallback and preserves context", async () => {
    const response = await post({
      workflow: "field_sample", userMessage: "x".repeat(1000) + "TRUNCATED",
      context: { sample: "Sample 123", extra: { nested: [1, null] } },
    });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.mode).toBe("template");
    expect(draft.structuredFields.sample_id).toBe("Sample 123");
    expect(draft.draftRecord).toContain(`Operator note: ${"x".repeat(1000)}\n`);
    expect(draft.draftRecord).not.toContain("TRUNCATED");
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it("passes truncated messages and context to the stubbed live provider", async () => {
    fetchStub.mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify({
      draftTitle: "Live title", draftRecord: "Live record", structuredFields: { sample: "123" },
    }) } }] }));
    const response = await post({
      workflow: "field_sample", userMessage: "x".repeat(1000) + "TRUNCATED",
      context: { sample: "123" },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      draftTitle: "Live title", draftRecord: "Live record", structuredFields: { sample: "123" },
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.", mode: "live",
    });
    expect(fetchStub).toHaveBeenCalledTimes(1);
    const request = JSON.parse(fetchStub.mock.calls[0][1].body);
    expect(request.messages[1].content).toContain(`Operator note: ${"x".repeat(1000)}\n`);
    expect(request.messages[1].content).toContain('Context: {"sample":"123"}');
    expect(request.messages[1].content).not.toContain("TRUNCATED");
  });
});
