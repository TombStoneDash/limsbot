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

  describe.each(["approvedCount", "rejectedCount"])("%s validation", (field) => {
    it.each(["2", "0", "", true, false, null, -1, 0.5, Number.MAX_SAFE_INTEGER + 1, [], {}])(
      "rejects invalid count %j",
      async (count) => {
        const response = await postJson({
          workflow: "pilot_summary",
          context: { approvedCount: 2, rejectedCount: 1, [field]: count },
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: `'context.${field}' must be a nonnegative safe integer`,
        });
      }
    );
  });

  it.each([null, [], [2, 1], "", "counts", 0, 2, true, false])(
    "rejects malformed context %j",
    async (context) => {
      const response = await postJson({ workflow: "pilot_summary", context });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "'context' must be a non-null JSON object for pilot_summary",
      });
    }
  );

  it.each([
    { approvedCount: Number.MAX_SAFE_INTEGER, rejectedCount: 1 },
    { approvedCount: 1, rejectedCount: Number.MAX_SAFE_INTEGER },
  ])("rejects an unsafe combined total %j", async (context) => {
    const response = await postJson({ workflow: "pilot_summary", context });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Combined approvedCount and rejectedCount total must be a safe integer",
    });
  });

  it.each([
    { values: {}, approved: 0, rejected: 0, total: 0, rate: 0 },
    { values: { context: {} }, approved: 0, rejected: 0, total: 0, rate: 0 },
    { values: { context: { approvedCount: 2 } }, approved: 2, rejected: 0, total: 2, rate: 100 },
    { values: { context: { rejectedCount: 1 } }, approved: 0, rejected: 1, total: 1, rate: 0 },
    { values: { context: { approvedCount: 0, rejectedCount: 0 } }, approved: 0, rejected: 0, total: 0, rate: 0 },
    { values: { context: { approvedCount: 2, rejectedCount: 1 } }, approved: 2, rejected: 1, total: 3, rate: 67 },
    { values: { context: { approvedCount: 1, rejectedCount: 3 } }, approved: 1, rejected: 3, total: 4, rate: 25 },
    { values: { context: { approvedCount: Number.MAX_SAFE_INTEGER } }, approved: Number.MAX_SAFE_INTEGER, rejected: 0, total: Number.MAX_SAFE_INTEGER, rate: 100 },
    { values: { context: { approvedCount: 1, rejectedCount: Number.MAX_SAFE_INTEGER - 1 } }, approved: 1, rejected: Number.MAX_SAFE_INTEGER - 1, total: Number.MAX_SAFE_INTEGER, rate: 0 },
  ])("preserves valid summary fields and review markers: $values", async ({ values, approved, rejected, total, rate }) => {
    const response = await postJson({ workflow: "pilot_summary", ...values });
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: expect.stringContaining("Pilot Summary — Demo Session "),
      structuredFields: {
        drafts_approved: approved,
        drafts_rejected: rejected,
        drafts_total: total,
        data_source: "demo-mock-only",
      },
      mode: "template",
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    expect(draft.draftRecord).toContain(`Drafts approved: ${approved}\n`);
    expect(draft.draftRecord).toContain(`Drafts rejected: ${rejected}\n`);
    expect(draft.draftRecord).toContain(`Total drafts reviewed: ${total}\n`);
    expect(draft.draftRecord).toContain(`Approval rate: ${rate}%\n`);
    expect(draft.draftRecord).toContain("Operator note: End-of-session review.\n");
    expect(draft.draftRecord).toContain("Status: Drafted — pending human approval.");
  });

  it.each(["field_sample", "chain_of_custody", "instrument_maintenance", "reagent_lot", "asset_scan"])(
    "does not apply summary validation to %s",
    async (workflow) => {
      for (const context of [null, [], "context", { approvedCount: "2", rejectedCount: -1 }]) {
        const response = await postJson({ workflow, context });
        expect(response.status).toBe(200);
        expect((await response.json()).mode).toBe("template");
      }
    }
  );
});
