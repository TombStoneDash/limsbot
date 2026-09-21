// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAccessPage from "../src/app/early-access/page";

const source = readFileSync(path.resolve(__dirname, "../src/app/early-access/page.tsx"), "utf-8");
const values = {
  labName: "Test Lab", labSize: "1-5", instruments: "HPLC",
  currentLims: "None/Excel", painPoint: "Manual entry", name: "Test User",
  email: "applicant@example.com", phone: "555-123-4567",
};

describe("early access form source", () => {
  it("uses shared outcomes, alerts below the button, and clears errors on retry", () => {
    expect(source).toMatch(/import\s*\{[^}]*waitlistOutcome[^}]*waitlistErrorMessage[^}]*\}\s*from "\.\.\/\.\.\/lib\/waitlist-submit"/);
    expect(source).toMatch(/<\/button>\s*\{errorMessage && <p role="alert"/);
    expect(source).toMatch(/e\.preventDefault\(\);\s*setErrorMessage\(""\);/);
    expect(source).toContain('if (outcome === "joined")');
    expect(source).not.toMatch(/\.reset\(/);
  });

  it("never reports success from a catch block", () => {
    const start = source.indexOf("{", source.indexOf("catch"));
    expect(start).toBeGreaterThan(-1);
    let depth = 1;
    let end = start + 1;
    for (; end < source.length && depth; end++) {
      if (source[end] === "{") depth++;
      if (source[end] === "}") depth--;
    }
    expect(depth).toBe(0);
    const catchBody = source.slice(start + 1, end - 1);
    expect(catchBody).not.toContain("setSubmitted(true)");
    expect(catchBody).toContain('waitlistOutcome("network-error")');
    expect(source.match(/setSubmitted\(true\)/g)).toHaveLength(1);
  });

  it("preserves the endpoint and all request fields", () => {
    expect(source).toContain('fetch("/api/early-access"');
    for (const field of Object.keys(values)) {
      expect(source).toContain(`${field}: data.get("${field}")`);
    }
  });

  it("only includes the allowed email address in page copy", () => {
    const copy = source.slice(source.indexOf("return ("));
    const addresses = copy.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
    expect(new Set(addresses)).toEqual(new Set(["info@lims.bot"]));
  });
});

describe("early access form interactions", () => {
  let container: HTMLDivElement;
  let root: Root;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(createElement(EarlyAccessPage)));
    for (const [name, value] of Object.entries(values)) {
      const control = container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
      control.value = value;
    }
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function submit() {
    await act(async () => {
      container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
  }

  it.each(["network", 400, 429, 500])("shows an alert and preserves every value on %s failure", async (failure) => {
    if (failure === "network") fetchMock.mockRejectedValueOnce(new Error("Offline"));
    else fetchMock.mockResolvedValueOnce({ ok: false, status: failure });
    await submit();
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      failure === 400 ? "Please check your name and email." :
        "We could not reach the server. Please try again, or email info@lims.bot."
    );
    expect(container.textContent).not.toContain("Application Received");
    for (const [name, value] of Object.entries(values)) {
      expect(container.querySelector<HTMLInputElement>(`[name="${name}"]`)!.value).toBe(value);
    }
    expect(container.querySelector("button")!.disabled).toBe(false);
  });

  it("shows success only for a successful response and sends every field", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
    await submit();
    expect(container.textContent).toContain("Application Received");
    expect(container.querySelector('[role="alert"]')).toBeNull();
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/early-access");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toEqual(values);
  });

  it("clears a previous error and marks the button busy during retry", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await submit();
    let resolve!: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    await submit();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector("button")!.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector("button")!.disabled).toBe(true);
    await act(async () => resolve({ ok: false, status: 500 }));
    expect(container.querySelector("button")!.getAttribute("aria-busy")).toBe("false");
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("gives every form control an accessible name matching its visible caption", () => {
    const controls = container.querySelectorAll("input, select, textarea");
    expect(controls).toHaveLength(8);
    for (const control of controls) {
      expect(control.getAttribute("aria-label")).toBe(control.parentElement!.querySelector("label")!.textContent);
    }
  });
});
