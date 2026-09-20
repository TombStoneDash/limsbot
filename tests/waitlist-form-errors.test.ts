import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { waitlistOutcome, waitlistErrorMessage } from "../src/lib/waitlist-submit";

describe("waitlist submission outcomes", () => {
  it("only successful responses count as joined", () => {
    expect(waitlistOutcome({ ok: true, status: 200 })).toBe("joined");
    expect(waitlistErrorMessage("joined")).toBe("");
  });

  it("explains invalid name or email responses", () => {
    expect(waitlistOutcome({ ok: false, status: 400 })).toBe("invalid");
    expect(waitlistErrorMessage("invalid")).toBe("Please check your name and email.");
  });

  it("reports network errors and other HTTP failures without claiming success", () => {
    expect(waitlistOutcome("network-error")).toBe("failed");
    for (const status of [401, 403, 404, 429, 500, 503]) {
      expect(waitlistOutcome({ ok: false, status })).toBe("failed");
    }
    expect(waitlistErrorMessage("failed")).toBe(
      "We could not reach the server. Please try again, or email info@lims.bot."
    );
  });

  it("error copy only uses the allowed contact address", () => {
    const copy = (["invalid", "failed"] as const).map((outcome) =>
      waitlistErrorMessage(outcome)
    ).join(" ");
    const addresses = copy.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
    expect(addresses).toEqual(["info@lims.bot"]);
  });
});

describe("both waitlist forms", () => {
  const source = readFileSync(path.resolve(__dirname, "../src/app/waitlist-forms.tsx"), "utf-8");
  const forms = source.split(/export function /).slice(1);

  it("checks both forms", () => {
    expect(forms).toHaveLength(2);
  });

  for (const form of forms) {
    const name = form.slice(0, form.indexOf("("));

    it(`${name} renders an alert below the button and clears it on retry`, () => {
      expect(form).toMatch(/<\/button>\s*\{errorMessage && <p role="alert"/);
      expect(form).toMatch(/e\.preventDefault\(\);\s*setErrorMessage\(""\);/);
      expect(form).toContain('if (outcome === "joined")');
      expect(form).not.toMatch(/\.reset\(/);
    });

    it(`${name} never marks a caught error as submitted`, () => {
      const catchBody = form.match(/catch\s*\{([\s\S]*?)\}\s*finally/);
      expect(catchBody).not.toBeNull();
      expect(catchBody![1]).not.toMatch(/setSubmitted\(true\)/);
      expect(catchBody![1]).toContain('waitlistOutcome("network-error")');
    });

    it(`${name} gives every input a label matching its placeholder`, () => {
      const inputs = [...form.matchAll(/<input\b[^>]*\/>/g)];
      expect(inputs).toHaveLength(4);
      for (const [input] of inputs) {
        const placeholder = input.match(/placeholder="([^"]+)"/)?.[1];
        expect(placeholder).toBeTruthy();
        expect(input).toContain(`aria-label="${placeholder}"`);
      }
    });
  }
});
