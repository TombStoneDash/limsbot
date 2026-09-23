import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT reagent inspection", () => {
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
    { name: "omitted note", userMessage: undefined },
    { name: "ordinary note", userMessage: "Routine lot check requested." },
    { name: "contradictory note", userMessage: "Seal broken; precipitate visible; cooler at 20 C." },
  ])("keeps inspection and storage unverified with $name", async ({ userMessage }) => {
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
      storage_status: "unverified",
      condition_status: "unverified",
    });
    expect(draft.draftRecord).toBe(
      "Reagent: Buffer A · Lot LOT-2026-001 · Exp 2026-08-15\n" +
      "Drafted: 2026-08-14 12:00:00 UTC\n" +
      "Visual inspection: Pending operator verification.\n" +
      "Storage: Pending operator verification.\n" +
      "Days to expiry: 1 (calculated from lot expiry vs today).\n" +
      `Operator note: ${userMessage ?? "Routine lot verification."}\n` +
      "Status: Drafted — pending human approval."
    );
  });
});
