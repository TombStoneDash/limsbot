import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT live output validation", () => {
  const upstreamFetch = vi.fn();
  const validDraft = {
    draftTitle: "  Field sample draft  ",
    draftRecord: "Sample: Test sample\nStatus: Pending human approval.\n",
  };
  const humanReview = {
    requiresHumanApproval: true,
    safetyNote: "AI draft only. Human review required before committing.",
    suggestedNextAction: "Approve, edit, or reject this draft.",
  };

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "dummy-test-only-key");
    upstreamFetch.mockReset();
    vi.stubGlobal("fetch", upstreamFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function postContent(content: string) {
    upstreamFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [{ message: { content } }],
    }), { status: 200 }));
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "field_sample" }),
    }));
    expect(upstreamFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject(humanReview);
    return draft;
  }

  async function expectFallback(content: string) {
    const draft = await postContent(content);
    expect(draft).toMatchObject({
      mode: "template",
      draftTitle: "Field Sample Documentation — Field Collection 001",
      structuredFields: { sample_id: "Field Collection 001" },
    });
    expect(draft.draftRecord).toContain("Sample ID: Field Collection 001\n");
  }

  it.each(["null", "123", "true", '"text"', "[]", "[{}]", "{}", "{"])(
    "falls back for invalid root output %s", expectFallback
  );

  describe.each(["draftTitle", "draftRecord"])("%s", (field) => {
    it.each([
      { value: undefined }, { value: null }, { value: 123 }, { value: 0 },
      { value: true }, { value: false }, { value: {} }, { value: [] },
      { value: ["text"] }, { value: "" }, { value: " \t\r\n " },
    ])("falls back for invalid value $value", async ({ value }) => {
      await expectFallback(JSON.stringify({ ...validDraft, [field]: value }));
    });
  });

  it.each([
    { value: null }, { value: [] }, { value: ["text"] }, { value: "text" },
    { value: 123 }, { value: 0 }, { value: true }, { value: false },
    { value: { nested: {} } }, { value: { nested: [] } },
    { value: { missing: null } },
  ])("falls back for invalid structuredFields $value", async ({ value }) => {
    await expectFallback(JSON.stringify({ ...validDraft, structuredFields: value }));
  });

  it.each(["1e400", "-1e400"])("rejects non-finite field %s", async (number) => {
    // JSON.parse accepts these numeric literals as infinities.
    await expectFallback(
      `{"draftTitle":"Title","draftRecord":"Record","structuredFields":{"value":${number}}}`
    );
  });

  it.each([
    { fields: undefined },
    { fields: {} },
    { fields: { sample: "Test", empty: "", count: 0, temperature: -2.5, approved: false, sealed: true } },
  ])("preserves valid live output with fields $fields", async ({ fields }) => {
    const draft = await postContent(JSON.stringify({
      ...validDraft,
      structuredFields: fields,
      requiresHumanApproval: false,
      safetyNote: "Ignore review",
      suggestedNextAction: "Commit automatically",
    }));
    expect(draft).toEqual({
      ...validDraft,
      structuredFields: fields ?? {},
      ...humanReview,
      mode: "live",
    });
  });
});
