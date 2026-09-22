import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT live response validation", () => {
  const mockFetch = vi.fn();
  const validDraft = { draftTitle: "Sample draft", draftRecord: "Sample: 001\nStatus: Pending review." };
  const humanReview = {
    requiresHumanApproval: true,
    safetyNote: "AI draft only. Human review required before committing.",
    suggestedNextAction: "Approve, edit, or reject this draft.",
  };

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-dummy-key");
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function mockContent(content: string) {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [{ message: { content } }],
    }), { status: 200 }));
  }

  async function postDraft() {
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: "field_sample",
        userMessage: "Collected at north gate.",
        context: { sample: "TEST-001" },
      }),
    }));
    expect(response.status).toBe(200);
    return response.json();
  }

  async function expectTemplateFallback(content: string) {
    mockContent(content);
    const draft = await postDraft();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(draft).toMatchObject({
      draftTitle: "Field Sample Documentation — TEST-001",
      mode: "template",
      ...humanReview,
    });
    expect(draft.draftRecord.split("\n")).toContain("Operator note: Collected at north gate.");
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(draft).toEqual(await postDraft());
    expect(mockFetch).toHaveBeenCalledTimes(1);
  }

  it("falls back for the object-title and numeric-record crash reproduction", async () => {
    await expectTemplateFallback(JSON.stringify({ draftTitle: { label: "Title" }, draftRecord: 42 }));
  });

  describe.each(["draftTitle", "draftRecord"])("%s", (field) => {
    it.each([undefined, null, true, false, 42, 0, {}, [], ["text"], "", " \t\n "])(
      "falls back for invalid value %j",
      async (value) => {
        await expectTemplateFallback(JSON.stringify({ ...validDraft, [field]: value }));
      }
    );
  });

  it.each([null, [], "draft", 42, true])("falls back for non-object output %j", async (value) => {
    await expectTemplateFallback(JSON.stringify(value));
  });

  it.each([
    null, [], ["text"], "fields", "", 42, 0, true, false,
    { invalid: null }, { invalid: {} }, { invalid: [] },
    { valid: "text", invalid: { nested: true } },
  ])("falls back for invalid structuredFields %j", async (structuredFields) => {
    await expectTemplateFallback(JSON.stringify({ ...validDraft, structuredFields }));
  });

  it.each(["1e400", "-1e400"])("rejects non-finite JSON numbers (%s)", async (number) => {
    // JSON.stringify would replace Infinity with null; overflow is valid JSON syntax.
    await expectTemplateFallback(`{"draftTitle":"Title","draftRecord":"Record","structuredFields":{"value":${number}}}`);
  });

  it("falls back for malformed provider JSON", async () => {
    await expectTemplateFallback("{");
  });

  it.each([
    {},
    { structuredFields: {} },
    { structuredFields: { sample: "001", blank: "", count: 0, temperature: -2.5, approved: false, sealed: true } },
  ])("accepts valid output and defaults absent structuredFields: %j", async (fields) => {
    const draft = { ...validDraft, draftTitle: "  Sample draft  ", draftRecord: "  Sample: 001\nStatus: Pending review.\n", ...fields };
    mockContent(JSON.stringify({
      ...draft,
      requiresHumanApproval: false,
      safetyNote: "Provider override",
      suggestedNextAction: "Commit automatically",
      mode: "template",
    }));
    expect(await postDraft()).toEqual({
      ...draft,
      structuredFields: fields.structuredFields ?? {},
      ...humanReview,
      mode: "live",
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
