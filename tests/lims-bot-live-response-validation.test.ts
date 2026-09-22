import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT live response validation", () => {
  const mockFetch = vi.fn();
  const validDraft = {
    draftTitle: " Field sample draft ",
    draftRecord: "Sample ID: SAMPLE-123\nStatus: Pending human approval.\n",
    structuredFields: { sample_id: "SAMPLE-123", storage_c: 4, operator_signoff: false },
  };
  const humanReview = {
    requiresHumanApproval: true,
    safetyNote: "AI draft only. Human review required before committing.",
    suggestedNextAction: "Approve, edit, or reject this draft.",
  };

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "dummy-test-key");
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function draftFrom(content: string) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content } }] }),
    });
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "field_sample" }),
    }));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject(humanReview);
    return draft;
  }

  async function expectFallback(content: string) {
    const draft = await draftFrom(content);
    expect(draft).toMatchObject({
      mode: "template",
      draftTitle: "Field Sample Documentation — Field Collection 001",
      structuredFields: { sample_id: "Field Collection 001", operator_signoff: false },
    });
    expect(draft.draftRecord.split("\n")).toContain("Sample ID: Field Collection 001");
    expect(draft.draftRecord).toContain("Status: Drafted by LIMS BOT — pending human approval.");
  }

  it.each(["null", "[]", "42", "true", '"draft"', "{"])(
    "falls back for invalid top-level output: %s",
    expectFallback
  );

  describe.each(["draftTitle", "draftRecord"])("%s", (field) => {
    it.each([
      { value: {} },
      { value: ["draft"] },
      { value: 42 },
      { value: true },
      { value: null },
      { value: "" },
      { value: " \t\n " },
      { value: undefined },
    ])("falls back for invalid or missing draft field: $value", async ({ value }) => {
      await expectFallback(JSON.stringify({ ...validDraft, [field]: value }));
    });
  });

  it.each([
    { value: null },
    { value: [] },
    { value: ["field"] },
    { value: "fields" },
    { value: 42 },
    { value: false },
    { value: { nested: {} } },
    { value: { nested: [] } },
    { value: { missing: null } },
  ])("falls back for invalid structuredFields: $value", async ({ value }) => {
    await expectFallback(JSON.stringify({ ...validDraft, structuredFields: value }));
  });

  it.each(["1e400", "-1e400"])("rejects non-finite structured numbers: %s", async (number) => {
    await expectFallback(
      `{"draftTitle":"Draft","draftRecord":"Record","structuredFields":{"value":${number}}}`
    );
  });

  it("preserves valid live output and enforces server-controlled human review", async () => {
    const draft = await draftFrom(JSON.stringify({
      ...validDraft,
      requiresHumanApproval: false,
      safetyNote: "Already approved",
      suggestedNextAction: "Commit automatically",
      mode: "template",
    }));
    expect(draft).toEqual({ ...validDraft, ...humanReview, mode: "live" });
  });

  it.each([
    {},
    { structuredFields: {} },
    { structuredFields: { empty: "", zero: 0, negative: -1.5, approved: true } },
  ])("accepts omitted, empty, or scalar structuredFields: %j", async (fields) => {
    const { draftTitle, draftRecord } = validDraft;
    const draft = await draftFrom(JSON.stringify({ draftTitle, draftRecord, ...fields }));
    expect(draft).toEqual({
      draftTitle,
      draftRecord,
      structuredFields: fields.structuredFields ?? {},
      ...humanReview,
      mode: "live",
    });
  });
});
