// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const demoFile = (name: string) =>
  readFileSync(path.resolve(__dirname, "../public/demo/lims-bot", name), "utf-8");
const topics = [
  "CLIA basics", "QC workflow", "chain of custody", "audit trail",
  "specimen lifecycle", "SENAITE", "HL7 v2", "ASTM E1394",
];

function submit(question: string) {
  document.querySelector<HTMLInputElement>("#chat-input")!.value = question;
  document.querySelector<HTMLFormElement>("#chat-form")!.requestSubmit();
  return document.querySelector("#chat-log")!.lastElementChild!.querySelector(".bubble")!;
}

async function expectCompleted(bubble: Element) {
  await vi.waitFor(() => {
    expect(bubble.querySelector(".badge")?.textContent).toContain("Human verification required");
  });
}

function expectUnsourced(bubble: Element) {
  expect(bubble.textContent).not.toContain("Source:");
  expect(bubble.textContent).not.toContain("Access date:");
  expect(bubble.querySelector(".source")).toBeNull();
}

describe("demo chat response shell", () => {
  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    window.eval(demoFile("canned-router.js"));
    window.eval(demoFile("chat.js"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("reports a rejected fetch without attributing a source", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network unavailable")));
    const bubble = submit("what is clia");
    await expectCompleted(bubble);
    expect(bubble.textContent).toContain("That reference could not be loaded. Please try again.");
    expectUnsourced(bubble);
  });

  it("offers eight working topic buttons for an unknown question without a source", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "# Reference" });
    vi.stubGlobal("fetch", fetchMock);
    const bubble = submit("pizza");
    await expectCompleted(bubble);
    expect(bubble.textContent).toContain("I don't have a vetted answer for that.");
    expect(bubble.textContent).toContain("Try asking about:");
    expectUnsourced(bubble);
    expect(fetchMock).not.toHaveBeenCalled();
    const buttons = [...bubble.querySelectorAll("button")];
    expect(buttons.map(button => button.textContent)).toEqual(topics);
    for (const button of buttons) {
      button.click();
      const log = document.querySelector("#chat-log")!;
      expect(log.lastElementChild!.previousElementSibling!.textContent).toContain(button.textContent);
      await expectCompleted(log.lastElementChild!.querySelector(".bubble")!);
    }
    expect(fetchMock).toHaveBeenCalledTimes(8);
  });

  it("cites a successfully loaded reference and escapes the query and reference text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "# CLIA basics\n\n<script>alert('reference')</script>",
    }));
    const bubble = submit("what is clia <img src=x onerror=alert('query')>");
    await expectCompleted(bubble);
    expect(bubble.textContent).toContain("Source: canned/clia_basics.md");
    expect(bubble.textContent).toContain("Access date:");
    expect(bubble.textContent).toContain("<script>alert('reference')</script>");
    expect(document.querySelector("#chat-log img, #chat-log script")).toBeNull();
  });

  it("also leaves unsuccessful HTTP responses unsourced", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const bubble = submit("what is clia");
    await expectCompleted(bubble);
    expect(bubble.textContent).toContain("could not be loaded");
    expectUnsourced(bubble);
  });
});
