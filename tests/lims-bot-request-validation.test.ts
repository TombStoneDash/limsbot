import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

const fetchMock = vi.fn();

function request(body: unknown) {
  return new NextRequest("http://localhost/api/lims-bot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "");
  fetchMock.mockReset();
  fetchMock.mockRejectedValue(new Error("Unexpected outbound request"));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("LIMS BOT request validation", () => {
  const invalidBodies: [string, unknown, string][] = [
    ...[null, 42, 0, true, false, "message", "", [], [{}]].map(
      (body): [string, unknown, string] => [
        `body ${JSON.stringify(body)}`, body, "Expected a JSON object",
      ],
    ),
    ...[undefined, null, "", "unknown", 42, true, [], {}].map(
      (workflow): [string, unknown, string] => [
        `workflow ${JSON.stringify(workflow)}`,
        { workflow },
        "Missing or invalid 'workflow'",
      ],
    ),
    ...[null, 42, 0, true, false, [], {}].map(
      (userMessage): [string, unknown, string] => [
        `message ${JSON.stringify(userMessage)}`,
        { workflow: "field_sample", userMessage },
        "Invalid 'userMessage': expected a string",
      ],
    ),
    ...[null, 42, 0, true, false, "text", "", [], [{}]].map(
      (context): [string, unknown, string] => [
        `context ${JSON.stringify(context)}`,
        { workflow: "field_sample", context },
        "Invalid 'context': expected an object",
      ],
    ),
  ];

  it.each(invalidBodies)("rejects %s before live drafting", async (_label, body, error) => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-placeholder");
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON before live drafting", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-placeholder");
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"workflow":',
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid JSON" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "field_sample", "chain_of_custody", "instrument_maintenance",
    "reagent_lot", "asset_scan", "pilot_summary",
  ])("preserves %s templates with omitted optional fields", async (workflow) => {
    const response = await POST(request({ workflow }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      mode: "template",
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    expect(draft.draftTitle).toEqual(expect.any(String));
    expect(draft.draftRecord).toEqual(expect.any(String));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    {}, { userMessage: "" }, { context: {} }, { userMessage: "", context: {} },
  ])("preserves field sample defaults for %j", async (optionalFields) => {
    const response = await POST(request({ workflow: "field_sample", ...optionalFields }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.draftTitle).toBe("Field Sample Documentation — Field Collection 001");
    expect(draft.draftRecord).toContain("Operator note: Routine field collection. Conditions nominal.");
    expect(draft.structuredFields.operator_signoff).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses explicit message and context fields", async () => {
    const response = await POST(request({
      workflow: "field_sample",
      userMessage: "Collected near inlet.",
      context: { sample: "Sample 123", extra: { arbitrary: true } },
    }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.draftTitle).toBe("Field Sample Documentation — Sample 123");
    expect(draft.draftRecord).toContain("Operator note: Collected near inlet.");
    expect(draft.structuredFields.sample_id).toBe("Sample 123");
    expect(draft.requiresHumanApproval).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("truncates messages to 1000 characters", async () => {
    const response = await POST(request({
      workflow: "field_sample", userMessage: "x".repeat(1000) + "discarded",
    }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.draftRecord).toContain(`Operator note: ${"x".repeat(1000)}\n`);
    expect(draft.draftRecord).not.toContain("discarded");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
