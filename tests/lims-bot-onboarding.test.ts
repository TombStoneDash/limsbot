import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PAGE_SOURCE = readFileSync(
  path.resolve(__dirname, "..", "src", "app", "lims-bot", "page.tsx"),
  "utf-8"
);
const NORMALIZED_SOURCE = PAGE_SOURCE.replace(/\s+/g, " ");

describe("LIMS BOT first-time onboarding", () => {
  it("documents the existing safe demo journey in a compact four-step flow", () => {
    const steps = [
      "Set up the mock scenario",
      "Generate a documentation draft",
      "Review and make the human decision",
      "Verify the demo audit event",
    ];

    for (const step of steps) {
      expect(PAGE_SOURCE).toContain(step);
    }

    expect(NORMALIZED_SOURCE).toContain(
      "Choose a workflow and asset, then try the optional mock scan."
    );
    expect(NORMALIZED_SOURCE).toContain(
      "Inspect or edit the draft, then explicitly approve or reject it."
    );
  });

  it("derives visible and accessible progress cues from scan, draft, and audit state", () => {
    expect(PAGE_SOURCE).toMatch(
      /const onboardingComplete = audit\.length > 0;/
    );
    expect(PAGE_SOURCE).toMatch(
      /onboardingComplete[\s\S]*\? ONBOARDING_STEPS\.length[\s\S]*: draft[\s\S]*\? 3[\s\S]*: scanned[\s\S]*\? 2[\s\S]*: 1;/
    );
    expect(PAGE_SOURCE).toContain('role="progressbar"');
    expect(PAGE_SOURCE).toContain('aria-live="polite"');
    expect(PAGE_SOURCE).toContain('aria-current={isCurrent ? "step" : undefined}');
    expect(PAGE_SOURCE).toContain("steps complete");
    expect(PAGE_SOURCE).toContain("Current step");
  });

  it("states the mock-data and human-approval boundaries without implying a live write", () => {
    expect(NORMALIZED_SOURCE).toContain("This demo uses mock data only.");
    expect(NORMALIZED_SOURCE).toContain(
      "Generated output is a draft: a person must review and explicitly approve or reject it."
    );
    expect(NORMALIZED_SOURCE).toContain(
      "Nothing is written to a live LIMS or production record."
    );
  });
});
