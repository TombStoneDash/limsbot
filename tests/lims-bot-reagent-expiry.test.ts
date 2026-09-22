import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT mock reagent expiry", () => {
  const forbiddenFetch = vi.fn(() => {
    throw new Error("External requests are forbidden in this test");
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("OPENAI_API_KEY", "");
    forbiddenFetch.mockClear();
    vi.stubGlobal("fetch", forbiddenFetch);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function draftAt(now: string) {
    vi.setSystemTime(new Date(now));
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "reagent_lot" }),
    }));
    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: "Reagent Lot Check — Buffer A · Lot LOT-2026-001 · Exp 2026-08-15",
      structuredFields: {
        reagent: "Buffer A",
        lot: "LOT-2026-001",
        expiry: "2026-08-15",
        storage_c: 4,
        condition_ok: true,
      },
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
      mode: "template",
    });
    expect(draft.draftRecord).toContain("Reagent: Buffer A · Lot LOT-2026-001 · Exp 2026-08-15\n");
    expect(draft.draftRecord).toContain("Status: Drafted — pending human approval.");
    expect(forbiddenFetch).not.toHaveBeenCalled();
    return draft.draftRecord as string;
  }

  it.each([
    ["2026-08-14T12:00:00Z", "Days to expiry: 1 (calculated from lot expiry vs today)."],
    ["2026-08-15T12:00:00Z", "Lot expires today."],
    ["2026-08-16T12:00:00Z", "Days since expiry: 1."],
  ])("reports the expiry status on %s", async (now, expected) => {
    const record = await draftAt(now);
    expect(record.split("\n")[4]).toBe(expected);
  });

  it("uses the same UTC calendar day at its start and end", async () => {
    const start = await draftAt("2026-08-14T00:00:00.000Z");
    const end = await draftAt("2026-08-14T23:59:59.999Z");
    const expected = "Days to expiry: 1 (calculated from lot expiry vs today).";
    expect(start.split("\n")[4]).toBe(expected);
    expect(end.split("\n")[4]).toBe(expected);
  });
});
