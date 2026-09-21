// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/lims-bot/route";

describe("reagent lot template expiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T23:59:59Z"));
    vi.stubEnv("OPENAI_API_KEY", "test-placeholder-not-a-credential");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function draft(lot?: string) {
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "reagent_lot", context: lot === undefined ? {} : { lot } }),
    }));
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    const result = await response.json();
    expect(result.mode).toBe("template");
    expect(result.requiresHumanApproval).toBe(true);
    expect(result.safetyNote).toBe("AI draft only. Human review required before committing.");
    expect(result.draftRecord).toContain("Status: Drafted — pending human approval.");
    return result;
  }

  it.each([
    ["future", "2026-08-10T23:59:59Z", 5],
    ["same day", "2026-08-15T23:59:59Z", 0],
    ["expired", "2026-08-16T00:00:00Z", -1],
    ["already expired default", "2026-09-21T12:00:00Z", -37],
    ["UTC day across an offset", "2026-08-14T23:30:00-07:00", 0],
  ])("calculates the default lot for %s", async (_, now, days) => {
    vi.setSystemTime(new Date(now));
    const result = await draft();
    expect(result.structuredFields.expiry).toBe("2026-08-15");
    expect(result.draftRecord).toContain("Exp 2026-08-15");
    expect(result.draftRecord).toContain(`Days to expiry: ${days} (`);
    expect(result.draftRecord.includes("expired;")).toBe(Number(days) < 0);
  });

  it.each([
    ["2026-08-20", "2026-08-10T23:59:59Z", 10],
    ["2028-02-29", "2028-02-28T12:00:00Z", 1],
    ["2026-03-09", "2026-03-08T01:00:00Z", 1],
  ])("uses the custom lot expiry %s", async (expiry, now, days) => {
    vi.setSystemTime(new Date(now));
    const lot = `Custom reagent · Lot CUSTOM-002 · Exp ${expiry}`;
    const result = await draft(lot);
    expect(result.draftRecord).toContain(`Reagent: ${lot}\n`);
    expect(result.structuredFields.expiry).toBe(expiry);
    expect(result.draftRecord).toContain(`Days to expiry: ${days} (`);
  });

  it.each([
    "Custom lot without expiry",
    "Custom lot · Exp 2026-02-29",
    "Custom lot · Exp 2026-02-30",
    "Custom lot · Exp 2026-04-31",
    "Custom lot · Exp 2026-13-01",
    "Custom lot · Exp 2026-00-15",
    "Custom lot · Exp 2026-08-00",
    "Custom lot · Exp 2026-8-15",
    "Custom lot · Exp invalid",
    "Custom lot · Exp 2026-08-15 extra text",
  ])("requests confirmation for %s", async (lot) => {
    const result = await draft(lot);
    expect(result.structuredFields.expiry).toBe("Expiry needs confirmation");
    expect(result.draftRecord).toContain("Days to expiry: Expiry needs confirmation.\n");
    expect(result.draftRecord).not.toMatch(/Days to expiry: -?\d/);
  });
});
