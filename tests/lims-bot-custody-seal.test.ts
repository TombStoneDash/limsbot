import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lims-bot/route";

describe("LIMS BOT custody seal", () => {
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
    { name: "broken-seal note", userMessage: "Seal is broken; damage observed on receipt." },
    { name: "routine note", userMessage: "Routine custody transfer requested." },
    { name: "omitted note", userMessage: undefined },
  ])("keeps seal condition unverified with $name", async ({ userMessage }) => {
    const sample = "Custody Sample 604";
    const response = await POST(new NextRequest("http://localhost/api/lims-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: "chain_of_custody", userMessage, context: { sample } }),
    }));

    expect(response.status).toBe(200);
    const draft = await response.json();
    expect(draft).toMatchObject({
      draftTitle: `Chain-of-Custody Event — ${sample}`,
      mode: "template",
      structuredFields: {
        event_type: "custody_transfer",
        sample_id: sample,
        seal_status: "unverified",
        requires_receiver_ack: true,
      },
      requiresHumanApproval: true,
      safetyNote: "AI draft only. Human review required before committing.",
      suggestedNextAction: "Approve, edit, or reject this draft.",
    });
    expect(draft.structuredFields).not.toHaveProperty("seal_intact");
    expect(draft.draftRecord).toContain(`Sample: ${sample}\n`);
    expect(draft.draftRecord).toContain("Seal status: Pending operator verification.\n");
    expect(draft.draftRecord).not.toMatch(/Seal status: Intact|operator-attested/i);
    expect(draft.draftRecord).toContain(`Operator note: ${userMessage ?? "Standard handoff."}\n`);
    expect(draft.draftRecord).toContain("To: Receiving lab (pending verification)\n");
    expect(draft.draftRecord).toContain("Status: Drafted — awaiting receiving-side acknowledgement.");
  });
});
