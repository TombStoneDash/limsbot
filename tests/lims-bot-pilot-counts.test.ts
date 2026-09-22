import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT pilot summary counts", () => {
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
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
  }

  describe.each(["approvedCount", "rejectedCount"])("%s", (field) => {
    it.each(["2", true, false, null, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, [], {}])(
      "rejects invalid count %j before live draft generation",
      async (value) => {
        vi.stubEnv("OPENAI_API_KEY", "test-only-not-a-real-key");
        const response = await postJson({
          workflow: "pilot_summary",
          context: { approvedCount: 2, rejectedCount: 3, [field]: value },
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: `'context.${field}' must be a nonnegative safe integer when supplied`,
        });
      }
    );
  });

  it.each([
    { approvedCount: Number.MAX_SAFE_INTEGER, rejectedCount: 1 },
    { approvedCount: 1, rejectedCount: Number.MAX_SAFE_INTEGER },
  ])("rejects an overflowing total: %j", async (context) => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-not-a-real-key");
    const response = await postJson({ workflow: "pilot_summary", context });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "The sum of 'context.approvedCount' and 'context.rejectedCount' must be a safe integer",
    });
  });

  it.each([null, [], [2, 3], "", "counts", 0, 5, false, true])(
    "rejects malformed context %j before live draft generation",
    async (context) => {
      vi.stubEnv("OPENAI_API_KEY", "test-only-not-a-real-key");
      const response = await postJson({ workflow: "pilot_summary", context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "'context' must be a non-null JSON object for pilot_summary when supplied",
      });
    }
  );

  it.each([
    { values: {}, approved: 0, rejected: 0, rate: 0 },
    { values: { context: {} }, approved: 0, rejected: 0, rate: 0 },
    { values: { context: { approvedCount: 2 } }, approved: 2, rejected: 0, rate: 100 },
    { values: { context: { rejectedCount: 3 } }, approved: 0, rejected: 3, rate: 0 },
    { values: { context: { approvedCount: 0, rejectedCount: 0 } }, approved: 0, rejected: 0, rate: 0 },
    { values: { context: { approvedCount: 2, rejectedCount: 3 } }, approved: 2, rejected: 3, rate: 40 },
    { values: { context: { approvedCount: Number.MAX_SAFE_INTEGER - 1, rejectedCount: 1 } }, approved: Number.MAX_SAFE_INTEGER - 1, rejected: 1, rate: 100 },
  ])("reports valid and omitted counts: $values", async ({ values, approved, rejected, rate }) => {
    const response = await postJson({ workflow: "pilot_summary", ...values });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
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
    expect(draft.draftRecord).toContain(`Total drafts reviewed: ${approved + rejected}\n`);
    expect(draft.draftRecord).toContain(`Approval rate: ${rate}%\n`);
  });

  it.each(["field_sample", "chain_of_custody", "instrument_maintenance", "reagent_lot", "asset_scan"])(
    "does not validate pilot counts for %s",
    async (workflow) => {
      const response = await postJson({
        workflow,
        context: { approvedCount: "2", rejectedCount: -3 },
      });
      expect(response.status).toBe(200);
      expect((await response.json()).requiresHumanApproval).toBe(true);
    }
  );
});
