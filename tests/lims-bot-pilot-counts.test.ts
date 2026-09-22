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

  function postJson(body: Record<string, unknown>) {
    return POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "pilot_summary", ...body }),
    }));
  }

  it("rejects the numeric-string concatenation reproduction", async () => {
    const response = await postJson({ context: { approvedCount: "2", rejectedCount: 1 } });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "'context.approvedCount' must be a nonnegative safe integer when supplied",
    });
  });

  describe.each(["approvedCount", "rejectedCount"])("%s", (field) => {
    it.each([null, true, false, "2", "", -1, 0.5, Number.MAX_SAFE_INTEGER + 1, [], {}])(
      "rejects invalid count %j",
      async (value) => {
        const response = await postJson({ context: { [field]: value } });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: `'context.${field}' must be a nonnegative safe integer when supplied`,
        });
      }
    );
  });

  it.each([null, true, false, 0, 2, "", "counts", [], [2, 1]])(
    "rejects invalid context %j",
    async (context) => {
      const response = await postJson({ context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "'context' must be a non-null JSON object for pilot_summary",
      });
    }
  );

  it.each([
    { approvedCount: Number.MAX_SAFE_INTEGER, rejectedCount: 1 },
    { approvedCount: 1, rejectedCount: Number.MAX_SAFE_INTEGER },
    { approvedCount: Number.MAX_SAFE_INTEGER, rejectedCount: Number.MAX_SAFE_INTEGER },
  ])("rejects an unsafe sum: %j", async (context) => {
    const response = await postJson({ context });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "The sum of 'context.approvedCount' and 'context.rejectedCount' must be a safe integer",
    });
  });

  it.each([
    { body: {}, approved: 0, rejected: 0, rate: 0 },
    { body: { context: {} }, approved: 0, rejected: 0, rate: 0 },
    { body: { context: { approvedCount: 2 } }, approved: 2, rejected: 0, rate: 100 },
    { body: { context: { rejectedCount: 1 } }, approved: 0, rejected: 1, rate: 0 },
    { body: { context: { approvedCount: 0, rejectedCount: 0 } }, approved: 0, rejected: 0, rate: 0 },
    { body: { context: { approvedCount: 2, rejectedCount: 1 } }, approved: 2, rejected: 1, rate: 67 },
    { body: { context: { approvedCount: 1, rejectedCount: 2 } }, approved: 1, rejected: 2, rate: 33 },
    { body: { context: { approvedCount: Number.MAX_SAFE_INTEGER - 1, rejectedCount: 1 } }, approved: Number.MAX_SAFE_INTEGER - 1, rejected: 1, rate: 100 },
  ])("preserves valid totals and safety fields: $body", async ({ body, approved, rejected, rate }) => {
    const response = await postJson({ ...body, userMessage: "Session reviewed." });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: expect.stringContaining("Pilot Summary — Demo Session "),
      structuredFields: {
        drafts_approved: approved,
        drafts_rejected: rejected,
        drafts_total: approved + rejected,
        data_source: "demo-mock-only",
      },
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
      mode: "template",
    });
    expect(draft.draftRecord).toContain(`Drafts approved: ${approved}\nDrafts rejected: ${rejected}\nTotal drafts reviewed: ${approved + rejected}\nApproval rate: ${rate}%\n`);
    expect(draft.draftRecord).toContain("Operator note: Session reviewed.\n");
    expect(draft.draftRecord).toContain("Note: All drafts in this demo are mock data. No production records were created.\nStatus: Drafted — pending human approval.");
  });

  it.each(["field_sample", "chain_of_custody", "instrument_maintenance", "reagent_lot", "asset_scan"])(
    "does not validate pilot counts for %s",
    async (workflow) => {
      const response = await postJson({ workflow, context: { approvedCount: "2", rejectedCount: -1 } });
      expect(response.status).toBe(200);
    }
  );
});
