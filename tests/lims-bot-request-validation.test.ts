import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT request validation", () => {
  const forbiddenFetch = vi.fn(() => {
    throw new Error("External requests are forbidden in this test");
  });

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "");
    forbiddenFetch.mockClear();
    vi.stubGlobal("fetch", forbiddenFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    expect(forbiddenFetch).not.toHaveBeenCalled();
  });

  function request(body: unknown) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
  }

  it.each([null, [], ["field_sample"], "field_sample", "", 42, 0, true, false])(
    "rejects non-object body %j",
    async (body) => {
      const response = await request(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Request body must be a JSON object" });
    }
  );

  it.each([undefined, null, "", "unknown", 42, [], {}])(
    "rejects missing or invalid workflow %j",
    async (workflow) => {
      const response = await request({ workflow });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Missing or invalid 'workflow'" });
    }
  );

  it.each([null, 42, 0, true, false, [], {}])(
    "rejects invalid userMessage %j",
    async (userMessage) => {
      const response = await request({ workflow: "field_sample", userMessage });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "'userMessage' must be a string" });
    }
  );

  it.each([null, [], ["sample"], "sample", "", 42, 0, true, false])(
    "rejects invalid context %j",
    async (context) => {
      const response = await request({ workflow: "field_sample", context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "'context' must be a JSON object" });
    }
  );

  it.each([
    { workflow: "field_sample" },
    { workflow: "field_sample", userMessage: "" },
    { workflow: "field_sample", context: {} },
  ])("preserves optional-field defaults for %j", async (body) => {
    const response = await request(body);
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: "Field Sample Documentation — Field Collection 001",
      structuredFields: { sample_id: "Field Collection 001" },
      mode: "template",
    });
    expect(draft.draftRecord).toContain("Operator note: Routine field collection. Conditions nominal.\n");
  });

  it("preserves a valid template request", async () => {
    const response = await request({
      workflow: "field_sample",
      userMessage: "Collected beside the river.",
      context: { sample: "River 002" },
    });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: "Field Sample Documentation — River 002",
      structuredFields: {
        sample_id: "River 002",
        container: "50_mL_conical",
        storage_c: 4,
        collection_method: "field_collection",
        operator_signoff: false,
      },
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
      mode: "template",
    });
    expect(draft.draftRecord).toContain("Operator note: Collected beside the river.\n");
  });

  it("truncates userMessage to 1000 characters", async () => {
    const response = await request({
      workflow: "field_sample",
      userMessage: "a".repeat(1000) + "TRUNCATED",
    });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.draftRecord).toContain(`Operator note: ${"a".repeat(1000)}\n`);
    expect(draft.draftRecord).not.toContain("TRUNCATED");
  });
});
