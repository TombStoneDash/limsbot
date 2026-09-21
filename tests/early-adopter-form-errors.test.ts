// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAdopterPage from "../src/app/early-adopter/page";

const values = {
  labName: "Acme Testing",
  labType: "Environmental",
  contactName: "Jane Smith",
  email: "info@lims.bot",
  testVolume: "100-500",
  painPoint: "Paper records take too long",
};
const failureMessage = "We could not reach the server. Please try again, or email info@lims.bot.";

describe("early adopter form source", () => {
  const source = readFileSync(path.resolve(__dirname, "../src/app/early-adopter/page.tsx"), "utf-8");

  it("uses the shared outcomes and clears the alert on retry", () => {
    expect(source).toMatch(/import \{ waitlistOutcome, waitlistErrorMessage \} from "\.\.\/\.\.\/lib\/waitlist-submit"/);
    expect(source).toMatch(/<\/button>\s*\{errorMessage && <p role="alert"/);
    expect(source).toMatch(/e\.preventDefault\(\);\s*setErrorMessage\(""\);/);
    expect(source).toContain('if (outcome === "joined")');
    expect(source).not.toMatch(/\.reset\(/);
  });

  it("never reports a caught failure as submitted", () => {
    const catchBody = source.match(/catch\s*\{([\s\S]*?)\}\s*finally/);
    expect(catchBody).not.toBeNull();
    expect(catchBody![1]).not.toContain("setSubmitted(true)");
    expect(catchBody![1]).toContain('waitlistOutcome("network-error")');
    expect(source.match(/setSubmitted\(true\)/g)).toHaveLength(1);
  });

  it("preserves the endpoint and all request fields", () => {
    expect(source).toContain('fetch("/api/early-adopter"');
    for (const field of Object.keys(values)) {
      expect(source).toContain(`${field}: data.get("${field}")`);
    }
  });

  it("only includes the allowed email address in copy", () => {
    expect([...new Set(source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi))])
      .toEqual(["info@lims.bot"]);
  });
});

describe("early adopter submission interactions", () => {
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
    await act(async () => root.render(createElement(EarlyAdopterPage)));
    for (const [name, value] of Object.entries(values)) {
      const field = container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
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
    expect(container.querySelector('[role="alert"]')?.textContent)
      .toBe(failure === 400 ? "Please check your name and email." : failureMessage);
    expect(container.textContent).not.toContain("Application Received");
    for (const [name, value] of Object.entries(values)) {
      expect(container.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value).toBe(value);
    }
    expect(container.querySelector("button")!.disabled).toBe(false);
    expect(container.querySelector("button")!.getAttribute("aria-busy")).toBe("false");
  });

  it("shows success only after a successful response and sends the original payload", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
    await submit();
    expect(container.textContent).toContain("Application Received");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/early-adopter");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toEqual(values);
  });

  it("clears the previous alert and marks the button busy while retrying", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await submit();
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    let resolve!: (response: { ok: boolean; status: number }) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    await submit();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector("button")!.disabled).toBe(true);
    expect(container.querySelector("button")!.getAttribute("aria-busy")).toBe("true");
    expect(container.textContent).not.toContain("Application Received");
    await act(async () => resolve({ ok: true, status: 200 }));
    expect(container.textContent).toContain("Application Received");
  });

  it("gives every form control an accessible name matching its visible caption", () => {
    const fields = container.querySelectorAll("input, select, textarea");
    expect(fields).toHaveLength(6);
    for (const field of fields) {
      expect(field.getAttribute("aria-label")).toBe(field.parentElement!.querySelector("label")!.textContent);
    }
  });
});
