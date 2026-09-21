// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, createElement, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => createElement("a", props),
}));

const failure = "The demo could not create a draft just now. Please try again.";
const busy = "The demo is busy. Please wait a moment and try again.";
const connection = "We could not reach the demo. Check your connection and try again.";
const source = readFileSync(path.resolve(__dirname, "../src/app/lims-bot/page.tsx"), "utf-8");

describe("demo accessibility source contract", () => {
  it("provides accessible feedback and named inputs", () => {
    expect(source).not.toContain("API error:");
    for (const text of [failure, busy, connection, 'role="alert"', 'role="status"',
      'aria-label="Operator note (optional)"', 'aria-label="Draft record (editable)"',
      'aria-busy={loading}']) {
      expect(source).toContain(text);
    }
    expect(source).toMatch(/role="alert" className="[^"]*text-sm text-\[#FFB4A2\]/);
  });

  it("preserves the demo request contract", () => {
    expect(source).toContain('fetch("/api/lims-bot"');
    expect(source).toMatch(/body: JSON\.stringify\(\{\s*workflow,\s*userMessage,\s*context,\s*\}\)/);
  });
});

describe("demo accessibility interactions", () => {
  let container: HTMLDivElement;
  let root: Root;
  let fetchMock: ReturnType<typeof vi.fn>;
  const draft = {
    draftTitle: "Mock record", draftRecord: "Mock sample for review.",
    structuredFields: {}, requiresHumanApproval: true, safetyNote: "Mock data only.",
    suggestedNextAction: "Review the draft.", mode: "template",
  };

  function button(label: string) {
    const result = Array.from(container.querySelectorAll("button"))
      .find((node) => node.textContent?.includes(label));
    expect(result).toBeDefined();
    return result!;
  }

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(createElement(LimsBotPage)));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it.each([[500, failure], [429, busy]])("announces HTTP %s failures without exposing codes", async (status, message) => {
    fetchMock.mockResolvedValueOnce({ ok: false, status });
    await act(async () => button("Generate draft").click());
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(message);
    expect(document.body.textContent).not.toContain(String(status));
    expect(button("Generate draft").getAttribute("aria-busy")).toBe("false");
    expect(container.querySelector('[role="status"]')?.textContent?.trim()).toBe("");
  });

  it("announces connection failures and clears them on successful retry", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await act(async () => button("Generate draft").click());
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(connection);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => draft });
    await act(async () => button("Generate draft").click());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector('[role="status"]')?.textContent).toBe("Draft ready for review.");
  });

  it("exposes loading and updates an existing status region when the draft arrives", async () => {
    let resolve!: (response: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const status = container.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(container.querySelector('textarea[aria-label="Operator note (optional)"]')).not.toBeNull();
    await act(async () => button("Generate draft").click());
    expect(button("Drafting…").getAttribute("aria-busy")).toBe("true");
    expect(button("Drafting…").disabled).toBe(true);
    await act(async () => resolve({ ok: true, json: async () => draft }));
    expect(container.querySelector('[role="status"]')).toBe(status);
    expect(status?.textContent).toBe("Draft ready for review.");
    expect(container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Draft record (editable)"]')?.value).toBe(draft.draftRecord);
    expect(button("Generate draft").getAttribute("aria-busy")).toBe("false");
    await act(async () => button("Reject").click());
    expect(status?.textContent?.trim()).toBe("");
  });

  it("exposes the current workflow and asset selections", async () => {
    expect(button("Field sample documentation").getAttribute("aria-pressed")).toBe("true");
    expect(button("Sciclone G3").getAttribute("aria-pressed")).toBe("true");
    await act(async () => button("Chain-of-custody event").click());
    await act(async () => button("Bench centrifuge").click());
    expect(button("Field sample documentation").getAttribute("aria-pressed")).toBe("false");
    expect(button("Chain-of-custody event").getAttribute("aria-pressed")).toBe("true");
    expect(button("Sciclone G3").getAttribute("aria-pressed")).toBe("false");
    expect(button("Bench centrifuge").getAttribute("aria-pressed")).toBe("true");
  });
});
