import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT maintenance findings", () => {
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

  it.each([
    { name: "failure note", userMessage: "Leak observed; instrument failed inspection." },
    { name: "ordinary note", userMessage: "Routine maintenance requested." },
    { name: "omitted note", userMessage: undefined },
    { name: "verbatim whitespace and multiline note", userMessage: "  Check pump.\nRecord observations.  " },
    { name: "note exceeding the length limit", userMessage: "x".repeat(1000) + "TRUNCATE_ME" },
  ])("keeps findings unverified with $name", async ({ userMessage }) => {
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "instrument_maintenance", userMessage }),
    }));

    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      mode: "template",
      structuredFields: { findings_status: "unverified" },
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    expect(draft.structuredFields).not.toHaveProperty("findings_clear");
    expect(draft.draftRecord).toContain(
      `Task: ${userMessage?.slice(0, 1000) ?? "Weekly inspection"}\nPerformed: `
    );
    expect(draft.draftRecord).toContain("Findings: Pending operator verification.\n");
    expect(draft.draftRecord).not.toMatch(
      /No anomalies observed|Surfaces wiped|Fluid levels nominal|inspection (?:passed|successful)/i
    );
    expect(draft.draftRecord).not.toContain("TRUNCATE_ME");
    expect(draft.draftRecord).toContain("Status: Drafted by LIMS BOT — pending human approval.");
  });
});
