// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

const draft = {
  draftTitle: "Mock collection record",
  draftRecord: "Collected mock sample.\nOperator review required.",
  structuredFields: {},
  requiresHumanApproval: true,
  safetyNote: "Mock data only.",
  suggestedNextAction: "Review the draft.",
  mode: "template",
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function button(label: string) {
  const match = Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.includes(label));
  expect(match, `button: ${label}`).toBeDefined();
  return match!;
}

async function click(label: string) {
  await act(async () => button(label).click());
}

function draftStatus() {
  const status = container.querySelector<HTMLParagraphElement>('p[role="status"].sr-only');
  expect(status).not.toBeNull();
  return status!;
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => draft });
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<LimsBotPage />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("LIMS Bot demo accessibility", () => {
  it("keeps the plain-language announcement and request contract in source", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/app/lims-bot/page.tsx"),
      "utf8",
    );
    expect(source).not.toContain("API error:");
    expect(source).toContain("The demo is busy. Please wait a moment and try again.");
    expect(source).toContain("The demo could not create a draft just now. Please try again.");
    expect(source).toContain("We could not reach the demo. Check your connection and try again.");
    expect(source).toContain('role="alert"');
    expect(source).toContain('role="status"');
    expect(source).toContain("aria-busy={loading}");
    expect(source).toContain('fetch("/api/lims-bot"');
    expect(source).toMatch(/body:\s*JSON\.stringify\(\{\s*workflow,\s*userMessage,\s*context,?\s*\}\)/s);
  });

  it.each([
    [500, "The demo could not create a draft just now. Please try again."],
    [429, "The demo is busy. Please wait a moment and try again."],
  ])("announces HTTP %i without exposing the status code", async (status, message) => {
    fetchMock.mockResolvedValueOnce({ ok: false, status });
    await click("Generate draft");
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(message);
    expect(document.body.textContent).not.toContain(String(status));
  });

  it("announces a connection failure and clears it after a successful retry", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await click("Generate draft");
    expect(container.querySelector('[role="alert"]')?.textContent)
      .toBe("We could not reach the demo. Check your connection and try again.");
    expect(draftStatus().textContent).toBe("");

    await click("Generate draft");
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(draftStatus().textContent).toBe("Draft ready for review.");
  });

  it("marks generation busy and disabled while the request is pending", async () => {
    let resolve!: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    await click("Generate draft");
    const loadingButton = button("Drafting…");
    expect(loadingButton.getAttribute("aria-busy")).toBe("true");
    expect(loadingButton.disabled).toBe(true);

    await act(async () => resolve({ ok: true, json: async () => draft }));
    expect(button("Generate draft").getAttribute("aria-busy")).toBe("false");
  });

  it("keeps one draft status node and clears it after rejection", async () => {
    const status = draftStatus();
    expect(status.textContent).toBe("");
    await click("Generate draft");
    expect(draftStatus()).toBe(status);
    expect(status.textContent).toBe("Draft ready for review.");
    await click("Reject");
    expect(draftStatus()).toBe(status);
    expect(status.textContent).toBe("");
  });

  it("exposes the selected workflow and asset with aria-pressed", async () => {
    expect(button("Field sample documentation").getAttribute("aria-pressed")).toBe("true");
    expect(button("Chain-of-custody event").getAttribute("aria-pressed")).toBe("false");
    expect(button("Sciclone G3").getAttribute("aria-pressed")).toBe("true");
    expect(button("Bench centrifuge").getAttribute("aria-pressed")).toBe("false");

    await click("Chain-of-custody event");
    await click("Bench centrifuge");
    expect(button("Field sample documentation").getAttribute("aria-pressed")).toBe("false");
    expect(button("Chain-of-custody event").getAttribute("aria-pressed")).toBe("true");
    expect(button("Sciclone G3").getAttribute("aria-pressed")).toBe("false");
    expect(button("Bench centrifuge").getAttribute("aria-pressed")).toBe("true");
  });
});
