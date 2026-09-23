// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const demoFile = (name: string) =>
  readFileSync(path.resolve(__dirname, "../public/demo/lims-bot", name), "utf-8");

function deferredFetch() {
  let resolve!: (response: { ok: boolean; text: () => Promise<string> }) => void;
  const promise = new Promise<{ ok: boolean; text: () => Promise<string> }>(done => {
    resolve = done;
  });
  return {
    promise,
    complete: (title: string) => resolve({
      ok: true,
      text: async () => `# ${title}\n\n${"Expanded local reference. ".repeat(80)}`,
    }),
  };
}

function submit(question: string) {
  document.querySelector<HTMLInputElement>("#chat-input")!.value = question;
  document.querySelector<HTMLFormElement>("#chat-form")!.requestSubmit();
  return document.querySelector("#chat-log")!.lastElementChild!.querySelector(".bubble")!;
}

async function expectCompleted(bubble: Element, title: string) {
  await vi.waitFor(() => expect(bubble.querySelector("h2")?.textContent).toBe(title));
}

describe("demo chat completion scrolling", () => {
  let log: HTMLElement;

  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    log = document.querySelector<HTMLElement>("#chat-log")!;
    let scrollTop = 0;
    // jsdom has no layout: each completed reference expands the transcript by 400px.
    Object.defineProperties(log, {
      clientHeight: { get: () => 100 },
      scrollHeight: { get: () => 200 + log.querySelectorAll(".source").length * 400 },
      scrollTop: {
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = Math.max(0, Math.min(value, log.scrollHeight - log.clientHeight));
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

  it.each([0, 20])("follows an expanded answer when %ipx from the bottom", async distance => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));
    const bubble = submit("CLIA basics");
    expect(log.scrollTop).toBe(100);
    log.scrollTop -= distance;

    request.complete("CLIA reference");
    await expectCompleted(bubble, "CLIA reference");
    expect(log.scrollHeight).toBe(600);
    expect(log.scrollTop).toBe(500);
  });

  it("preserves the reader's position after scrolling upward while waiting", async () => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));
    const bubble = submit("CLIA basics");
    expect(log.scrollTop).toBe(100);
    log.scrollTop = 40;

    request.complete("CLIA reference");
    await expectCompleted(bubble, "CLIA reference");
    expect(log.scrollHeight).toBe(600);
    expect(log.scrollTop).toBe(40);
  });

  it.each([false, true])("keeps out-of-order replies independent (scroll up: %s)", async scrollUp => {
    const first = deferredFetch();
    const second = deferredFetch();
    vi.stubGlobal("fetch", vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const firstBubble = submit("CLIA basics");
    const secondBubble = submit("QC workflow");

    second.complete("QC reference");
    await expectCompleted(secondBubble, "QC reference");
    expect(firstBubble.textContent).toContain("Loading local reference...");
    expect(secondBubble.querySelector(".source")?.textContent).toContain("canned/qc_workflow.md");
    expect(log.scrollTop).toBe(500);
    if (scrollUp) log.scrollTop = 40;

    first.complete("CLIA reference");
    await expectCompleted(firstBubble, "CLIA reference");
    expect(firstBubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
    expect(secondBubble.querySelector("h2")?.textContent).toBe("QC reference");
    expect(log.scrollHeight).toBe(1000);
    expect(log.scrollTop).toBe(scrollUp ? 40 : 900);
  });
});
