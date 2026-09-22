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

  function postJson(body: string) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }));
  }

  async function expectBadRequest(body: string, error: string) {
    const response = await postJson(body);
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({ error });
  }

  it.each([null, 42, "field_sample", true, [], [{}]])(
    "rejects a non-object body: %j", async (body) => {
      await expectBadRequest(JSON.stringify(body), "Request body must be a JSON object");
    }
  );

  it.each([null, 42, 0, true, false, [], {}])(
    "rejects a non-string userMessage: %j", async (userMessage) => {
      await expectBadRequest(
        JSON.stringify({ workflow: "field_sample", userMessage }),
        "'userMessage' must be a string"
      );
    }
  );

  it.each([null, 42, 0, "sample", "", true, false, [], [{}]])(
    "rejects a non-object context: %j", async (context) => {
      await expectBadRequest(
        JSON.stringify({ workflow: "field_sample", context }),
        "'context' must be a JSON object"
      );
    }
  );

  it.each([undefined, null, "", "unknown", 42, true, [], {}])(
    "rejects a missing or invalid workflow: %j", async (workflow) => {
      await expectBadRequest(
        JSON.stringify({ workflow }), "Missing or invalid 'workflow'"
      );
    }
  );

  it("rejects malformed JSON", async () => {
    await expectBadRequest('{"workflow":', "Invalid JSON");
  });

  it("returns the template and approval fields with optional fields omitted", async () => {
    const response = await postJson(JSON.stringify({ workflow: "field_sample" }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: "Field Sample Documentation — Field Collection 001",
      structuredFields: {
        sample_id: "Field Collection 001",
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
    expect(draft.draftRecord).toContain("Operator note: Routine field collection. Conditions nominal.\n");
    expect(draft.draftRecord).toContain("Status: Drafted by LIMS BOT — pending human approval.");
  });

  it("accepts an empty message and object context", async () => {
    const response = await postJson(JSON.stringify({
      workflow: "field_sample", userMessage: "", context: {},
    }));
    expect(response.status).toBe(200);
    expect((await response.json()).draftRecord).toContain(
      "Operator note: Routine field collection. Conditions nominal.\n"
    );
  });

  it("preserves context and truncates messages to 1,000 characters", async () => {
    const message = "x".repeat(1000);
    const response = await postJson(JSON.stringify({
      workflow: "field_sample",
      userMessage: `${message}TRUNCATED`,
      context: { sample: "Sample 123" },
    }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft.structuredFields.sample_id).toBe("Sample 123");
    expect(draft.draftRecord).toContain(`Operator note: ${message}\n`);
    expect(draft.draftRecord).not.toContain("TRUNCATED");
  });
});
