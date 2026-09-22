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
    try {
      expect(forbiddenFetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    }
  });

  function postJson(body: unknown) {
    return postRaw(JSON.stringify(body));
  }

  function postRaw(body: string) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }));
  }

  it("rejects malformed JSON", async () => {
    const response = await postRaw("{");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON" });
  });

  it.each([
    { body: null },
    { body: 42 },
    { body: 0 },
    { body: true },
    { body: false },
    { body: "field_sample" },
    { body: "" },
    { body: [] },
    { body: [{ workflow: "field_sample" }] },
  ])("rejects a non-object body: $body", async ({ body }) => {
    const response = await postJson(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Request body must be a non-null JSON object",
    });
  });

  it.each([
    {},
    { workflow: null },
    { workflow: "" },
    { workflow: "unsupported" },
    { workflow: 42 },
    { workflow: true },
    { workflow: ["field_sample"] },
    { workflow: {} },
  ])("rejects a missing or invalid workflow: %j", async (body) => {
    const response = await postJson(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing or invalid 'workflow'" });
  });

  it.each([
    { userMessage: null },
    { userMessage: 42 },
    { userMessage: 0 },
    { userMessage: true },
    { userMessage: false },
    { userMessage: {} },
    { userMessage: [] },
    { userMessage: ["note"] },
  ])("rejects supplied non-string notes: $userMessage", async (notes) => {
    const response = await postJson({ workflow: "field_sample", ...notes });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "'userMessage' must be a string when supplied",
    });
  });

  it.each([
    "field_sample",
    "chain_of_custody",
    "instrument_maintenance",
    "reagent_lot",
    "asset_scan",
    "pilot_summary",
  ])("accepts omitted notes for %s and preserves human review", async (workflow) => {
    const response = await postJson({ workflow });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      draftTitle: expect.any(String),
      draftRecord: expect.any(String),
      structuredFields: expect.any(Object),
      mode: "template",
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
  });

  it.each([{}, { userMessage: "" }])("uses default notes for %j", async (notes) => {
    const response = await postJson({ workflow: "field_sample", ...notes });
    expect(response.status).toBe(200);
    expect((await response.json()).draftRecord).toContain(
      "Operator note: Routine field collection. Conditions nominal.\n"
    );
  });

  it.each(["Collected beside the north gate.", "x".repeat(1000) + "TRUNCATE_ME"])(
    "preserves string notes up to 1,000 characters (%#)",
    async (userMessage) => {
      const response = await postJson({ workflow: "field_sample", userMessage });
      expect(response.status).toBe(200);
      const draft = await response.json();
      const note = draft.draftRecord.split("\n").find((line: string) =>
        line.startsWith("Operator note: ")
      );
      expect(note).toBe(`Operator note: ${userMessage.slice(0, 1000)}`);
      expect(draft.draftRecord).not.toContain("TRUNCATE_ME");
    }
  );
});
