// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const demoFile = (name: string) =>
  readFileSync(path.resolve(__dirname, "../public/demo/lims-bot", name), "utf-8");

function deferredReference() {
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

  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    log = document.querySelector<HTMLElement>("#chat-log")!;
    const initialBadges = log.querySelectorAll(".message.bot .badge").length;
    let scrollTop = 0;
    Object.defineProperties(log, {
      // Simulate layout expansion synchronously when a completed bubble is rendered.
      scrollHeight: {
        get: () => 1000 + (log.querySelectorAll(".message.bot .badge").length - initialBadges) * 600,
      },
      clientHeight: { get: () => 400 },
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

  it.each([0, 24])("follows an expanded answer when the reader is %i pixels from the bottom", async gap => {
    const reference = deferredReference();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(reference.promise));
    const bubble = submit("what is clia");
    expect(bubble.textContent).toContain("Loading local reference...");
    log.scrollTop -= gap;
    const placeholderHeight = log.scrollHeight;

    reference.complete("# CLIA basics\n\n" + "Long reference text. ".repeat(100));
    await expectCompleted(bubble);

    expect(log.scrollHeight).toBeGreaterThan(placeholderHeight);
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);
    expect(bubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
  });

  it("preserves the position of a reader who scrolls up during loading", async () => {
    const reference = deferredReference();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(reference.promise));
    const bubble = submit("what is clia");
    expect(log.scrollTop).toBe(600);
    log.scrollTop = 150;

    reference.complete("# CLIA basics\n\n" + "Long reference text. ".repeat(100));
    await expectCompleted(bubble);

    expect(log.scrollHeight).toBe(1600);
    expect(log.scrollTop).toBe(150);
  });

  it("updates each response's own placeholder when requests finish out of order", async () => {
    const first = deferredReference();
    const second = deferredReference();
    vi.stubGlobal("fetch", vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const firstBubble = submit("what is clia");
    const secondBubble = submit("quality control");

    second.complete("# QC workflow\n\nSecond answer");
    await expectCompleted(secondBubble);
    expect(firstBubble.textContent).toContain("Loading local reference...");
    expect(secondBubble.querySelector("h2")?.textContent).toBe("QC workflow");
    expect(secondBubble.querySelector(".source")?.textContent).toContain("canned/qc_workflow.md");
    expect(log.scrollTop).toBe(1200);

    log.scrollTop = 200;
    first.complete("# CLIA basics\n\nFirst answer");
    await expectCompleted(firstBubble);
    expect(firstBubble.querySelector("h2")?.textContent).toBe("CLIA basics");
    expect(firstBubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
    expect(secondBubble.querySelector("h2")?.textContent).toBe("QC workflow");
    expect(log.scrollHeight).toBe(2200);
    expect(log.scrollTop).toBe(200);
  });
});
