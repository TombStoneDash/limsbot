import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT live response validation", () => {
  const providerFetch = vi.fn();
  const validDraft = {
    draftTitle: " Field sample draft ",
    draftRecord: "Sample: TEST-001\nStatus: Drafted by LIMS BOT — pending human approval.\n",
  };
  const safetyFields = {
    requiresHumanApproval: true,
    safetyNote: "AI draft only. Human review required before committing.",
    suggestedNextAction: "Approve, edit, or reject this draft.",
  };
  const providerSafetyOverrides = {
    requiresHumanApproval: false,
    safetyNote: "Already approved.",
    suggestedNextAction: "Commit immediately.",
    mode: "provider",
  };

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "dummy-test-key");
    providerFetch.mockReset();
    vi.stubGlobal("fetch", providerFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function postProviderContent(content: string) {
    providerFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [{ message: { content } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "field_sample", context: { sample: "TEST-001" } }),
    }));
    expect(providerFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    return response.json();
  }

  async function expectFallback(content: string) {
    const draft = await postProviderContent(content);
    expect(draft).toMatchObject({
      ...safetyFields,
      mode: "template",
      draftTitle: "Field Sample Documentation — TEST-001",
      structuredFields: { sample_id: "TEST-001", operator_signoff: false },
    });
    expect(draft.draftRecord.split("\n")).toContain("Sample ID: TEST-001");
    expect(draft.draftRecord).toContain("Status: Drafted by LIMS BOT — pending human approval.");
  }

  it.each([null, [], [validDraft], 42, true, "draft"])(
    "falls back for non-object provider content: %j", async (content) => {
      await expectFallback(JSON.stringify(content));
    }
  );

  describe.each(["draftTitle", "draftRecord"])("%s", (field) => {
    it.each([undefined, null, {}, { text: "draft" }, [], ["draft"], 42, 0, true, false, "", " \n\t "])(
      "falls back for missing, non-string, or blank content: %j", async (value) => {
        await expectFallback(JSON.stringify({
          ...validDraft, ...providerSafetyOverrides, [field]: value,
        }));
      }
    );
  });

  it.each([null, [], ["field"], "field", "", 42, 0, true, false, { value: null }, { value: {} }, { value: [] }])(
    "falls back for invalid structuredFields: %j", async (structuredFields) => {
      await expectFallback(JSON.stringify({
        ...validDraft, ...providerSafetyOverrides, structuredFields,
      }));
    }
  );

  it.each(["1e400", "-1e400"])("rejects non-finite field values: %s", async (value) => {
    // JSON.stringify would turn Infinity into null; exercise numeric overflow in JSON.parse.
    await expectFallback(`{"draftTitle":"Draft","draftRecord":"Record","structuredFields":{"value":${value}}}`);
  });

  it("falls back for malformed provider JSON", async () => {
    await expectFallback("{");
  });

  it.each([
    undefined,
    {},
    { sample: "TEST-001", blank: "", temperature: -2.5, count: 0, maximum: Number.MAX_VALUE, approved: false, sealed: true },
  ])("preserves valid live content and server-owned safety fields: %j", async (structuredFields) => {
    const draft = await postProviderContent(JSON.stringify({
      ...validDraft, ...providerSafetyOverrides, structuredFields,
    }));
    expect(draft).toEqual({
      ...validDraft,
      structuredFields: structuredFields ?? {},
      ...safetyFields,
      mode: "live",
    });
    expect(draft.draftRecord.split("\n")).toContain("Sample: TEST-001");
  });
});
