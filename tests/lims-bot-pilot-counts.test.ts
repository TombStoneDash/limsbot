import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT pilot counters and context validation", () => {
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

  function postJson(body: Record<string, unknown>) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "pilot_summary", ...body }),
    }));
  }

  it.each([
    { body: {}, approved: 0, rejected: 0, percentage: 0 },
    { body: { context: {} }, approved: 0, rejected: 0, percentage: 0 },
    { body: { context: { approvedCount: 0, rejectedCount: 0 } }, approved: 0, rejected: 0, percentage: 0 },
    { body: { context: { approvedCount: 3 } }, approved: 3, rejected: 0, percentage: 100 },
    { body: { context: { rejectedCount: 3 } }, approved: 0, rejected: 3, percentage: 0 },
    { body: { context: { approvedCount: 2, rejectedCount: 1 } }, approved: 2, rejected: 1, percentage: 67 },
    { body: { context: { approvedCount: 1, rejectedCount: 2 } }, approved: 1, rejected: 2, percentage: 33 },
    { body: { context: { approvedCount: 1, rejectedCount: 7 } }, approved: 1, rejected: 7, percentage: 13 },
    { body: { context: { approvedCount: Number.MAX_SAFE_INTEGER } }, approved: Number.MAX_SAFE_INTEGER, rejected: 0, percentage: 100 },
    { body: { context: { approvedCount: 1, rejectedCount: Number.MAX_SAFE_INTEGER - 1 } }, approved: 1, rejected: Number.MAX_SAFE_INTEGER - 1, percentage: 0 },
  ])("accepts valid counters and preserves the summary (%#)", async ({ body, approved, rejected, percentage }) => {
    const response = await postJson(body);
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: expect.stringMatching(/^Pilot Summary — Demo Session /),
      structuredFields: {
        drafts_approved: approved,
        drafts_rejected: rejected,
        drafts_total: approved + rejected,
        data_source: "demo-mock-only",
      },
      mode: "template",
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    expect(draft.draftRecord).toContain(`Drafts approved: ${approved}\n`);
    expect(draft.draftRecord).toContain(`Drafts rejected: ${rejected}\n`);
    expect(draft.draftRecord).toContain(`Total drafts reviewed: ${approved + rejected}\n`);
    expect(draft.draftRecord).toContain(`Approval rate: ${percentage}%\n`);
    expect(draft.draftRecord).toContain("Status: Drafted — pending human approval.");
  });

  describe.each(["approvedCount", "rejectedCount"])("context.%s", (field) => {
    it.each([
      { value: "2" }, { value: "0" }, { value: null },
      { value: true }, { value: false }, { value: [] }, { value: [2] },
      { value: {} }, { value: { count: 2 } },
      { value: -1 }, { value: 0.5 }, { value: -0.5 },
      { value: Number.MAX_SAFE_INTEGER + 1 },
    ])("rejects malformed count $value", async ({ value }) => {
      const response = await postJson({
        context: { approvedCount: 1, rejectedCount: 1, [field]: value },
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: `'context.${field}' must be a nonnegative safe integer when supplied`,
      });
    });
  });

  it.each([
    { approvedCount: Number.MAX_SAFE_INTEGER, rejectedCount: 1 },
    { approvedCount: 1, rejectedCount: Number.MAX_SAFE_INTEGER },
    { approvedCount: Number.MAX_SAFE_INTEGER, rejectedCount: Number.MAX_SAFE_INTEGER },
  ])("rejects an unsafe combined total: %j", async (context) => {
    const response = await postJson({ context });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "'context.approvedCount' + 'context.rejectedCount' must be a safe integer",
    });
  });

  describe.each([
    "pilot_summary", "field_sample", "chain_of_custody",
    "instrument_maintenance", "reagent_lot", "asset_scan",
  ])("%s context", (workflow) => {
    it.each([
      { context: null }, { context: true }, { context: false },
      { context: 0 }, { context: 2 }, { context: "" }, { context: "note" },
      { context: [] }, { context: [{ approvedCount: 2 }] },
    ])("rejects a supplied non-object context: $context", async ({ context }) => {
      const response = await postJson({ workflow, context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "'context' must be a non-null JSON object when supplied",
      });
    });
  });

  it("does not apply pilot counter validation to other workflows", async () => {
    const response = await postJson({
      workflow: "field_sample", context: { approvedCount: "2", rejectedCount: null },
    });
    expect(response.status).toBe(200);
  });
});
