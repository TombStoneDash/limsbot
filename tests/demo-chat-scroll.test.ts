// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const demoFile = (name: string) =>
  readFileSync(path.resolve(__dirname, "../public/demo/lims-bot", name), "utf-8");

function deferredResponse() {
  let resolve!: (response: { ok: boolean; text: () => Promise<string> }) => void;
  const promise = new Promise<{ ok: boolean; text: () => Promise<string> }>(done => {
    resolve = done;
  });
  return {
    promise,
    complete: (markdown: string) => resolve({ ok: true, text: async () => markdown }),
  };
}

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

describe("demo chat completion scrolling", () => {
  let log: HTMLElement;
  let scrollWrites: number[];

  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    log = document.querySelector<HTMLElement>("#chat-log")!;
    scrollWrites = [];
    let top = 0;
    Object.defineProperties(log, {
      // jsdom has no layout: each completed reference models a taller bubble.
      scrollHeight: { configurable: true, get: () =>
        600 + log.children.length * 40 + log.querySelectorAll(".bot .badge").length * 600 },
      clientHeight: { configurable: true, get: () => 300 },
      scrollTop: {
        configurable: true,
        get: () => top,
        set: (value: number) => {
          scrollWrites.push(value);
          top = Math.max(0, Math.min(value, log.scrollHeight - log.clientHeight));
        },
      },
    });
    window.eval(demoFile("canned-router.js"));
    window.eval(demoFile("chat.js"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it.each([0, 3])("follows a longer reply when %i pixels from the bottom", async gap => {
    const response = deferredResponse();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(response.promise));
    const bubble = submit("what is clia");
    expect(scrollWrites).toHaveLength(2);
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);
    const pendingHeight = log.scrollHeight;
    log.scrollTop -= gap;
    scrollWrites.length = 0;

    response.complete("# CLIA basics\n\n" + "A longer reference answer. ".repeat(100));
    await expectCompleted(bubble);

    expect(log.scrollHeight).toBeGreaterThan(pendingHeight);
    expect(scrollWrites).toEqual([log.scrollHeight]);
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);
    expect(bubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
  });

  it.each([5, 200])("preserves the position after scrolling upward %i pixels while waiting", async gap => {
    const response = deferredResponse();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(response.promise));
    const bubble = submit("what is clia");
    log.scrollTop -= gap;
    const readerPosition = log.scrollTop;
    scrollWrites.length = 0;

    response.complete("# CLIA basics\n\n" + "Long reference. ".repeat(100));
    await expectCompleted(bubble);

    expect(scrollWrites).toEqual([]);
    expect(log.scrollTop).toBe(readerPosition);
  });

  it("keeps out-of-order replies associated and checks the current position for each completion", async () => {
    const first = deferredResponse();
    const second = deferredResponse();
    vi.stubGlobal("fetch", vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const firstBubble = submit("what is clia");
    const secondBubble = submit("QC workflow");
    scrollWrites.length = 0;

    second.complete("# QC answer\n\n" + "Quality control. ".repeat(100));
    await expectCompleted(secondBubble);
    expect(firstBubble.textContent).toContain("Loading local reference...");
    expect(secondBubble.textContent).toContain("QC answer");
    expect(secondBubble.querySelector(".source")?.textContent).toContain("canned/qc_workflow.md");
    expect(scrollWrites).toEqual([log.scrollHeight]);
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);

    log.scrollTop -= 150;
    const readerPosition = log.scrollTop;
    scrollWrites.length = 0;
    first.complete("# CLIA answer\n\n<script>unsafe()</script>");
    await expectCompleted(firstBubble);
    expect(firstBubble.textContent).toContain("CLIA answer");
    expect(firstBubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
    expect(firstBubble.textContent).toContain("<script>unsafe()</script>");
    expect(firstBubble.querySelector("script")).toBeNull();
    expect(secondBubble.textContent).toContain("QC answer");
    expect(secondBubble.textContent).not.toContain("CLIA answer");
    expect(scrollWrites).toEqual([]);
    expect(log.scrollTop).toBe(readerPosition);
  });
});
