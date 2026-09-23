import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT reagent findings", () => {
  const forbiddenFetch = vi.fn(() => {
    throw new Error("External requests are forbidden in this test");
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-14T12:00:00Z"));
    vi.stubEnv("OPENAI_API_KEY", "");
    forbiddenFetch.mockClear();
    vi.stubGlobal("fetch", forbiddenFetch);
  });

  afterEach(() => {
    try {
      expect(forbiddenFetch).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    }
  });

  it.each([
    { name: "adverse note", userMessage: "Seal broken, precipitate visible, refrigerator at 20 C" },
    { name: "ordinary note", userMessage: "Routine lot verification requested." },
    { name: "omitted note", userMessage: undefined },
  ])("keeps conditions unverified with $name", async ({ userMessage }) => {
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "reagent_lot", userMessage }),
    }));

    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: "Reagent Lot Check — Buffer A · Lot LOT-2026-001 · Exp 2026-08-15",
      mode: "template",
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    expect(draft.structuredFields).toEqual({
      reagent: "Buffer A",
      lot: "LOT-2026-001",
      expiry: "2026-08-15",
      condition_status: "unverified",
    });
    expect(draft.structuredFields).not.toHaveProperty("condition_ok");
    expect(draft.structuredFields).not.toHaveProperty("storage_c");
    expect(draft.draftRecord).toBe([
      "Reagent: Buffer A · Lot LOT-2026-001 · Exp 2026-08-15",
      "Drafted: 2026-08-14 12:00:00 UTC",
      "Visual inspection: Pending operator verification.",
      "Actual storage conditions: Pending operator verification.",
      "Days to expiry: 1 (calculated from lot expiry vs today).",
      `Operator note: ${userMessage ?? "Routine lot verification."}`,
      "Status: Drafted — pending human approval.",
    ].join("\n"));
  });
});
