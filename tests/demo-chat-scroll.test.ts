// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const demoFile = (name: string) =>
  readFileSync(path.resolve(__dirname, "../public/demo/lims-bot", name), "utf-8");

function deferredFetch() {
  let resolve!: (response: { ok: boolean; text: () => Promise<string> }) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<{ ok: boolean; text: () => Promise<string> }>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    succeed: (text: string) => resolve({ ok: true, text: async () => text }),
    reject,
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

describe("demo chat reply completion scrolling", () => {
  let log: HTMLElement;

  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    log = document.querySelector<HTMLElement>("#chat-log")!;
    const initialBadges = log.querySelectorAll(".badge").length;
    let scrollTop = 0;
    // jsdom has no layout: each completed reply adds 900px to this transcript.
    // Clamp scrollTop like a browser, so assigning scrollHeight reaches the bottom.
    Object.defineProperties(log, {
      clientHeight: { configurable: true, get: () => 400 },
      scrollHeight: {
        configurable: true,
        get: () => 500 + 900 * (log.querySelectorAll(".badge").length - initialBadges),
      },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => { scrollTop = Math.max(0, Math.min(value, log.scrollHeight - log.clientHeight)); },
      },
    });
    window.eval(demoFile("canned-router.js"));
    window.eval(demoFile("chat.js"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it.each([0, 24])("follows a longer successful reply from %ipx above the bottom", async gap => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));
    const bubble = submit("what is clia");
    expect(log.scrollTop).toBe(100);
    log.scrollTop -= gap;
    request.succeed("# CLIA basics\n\n" + "Long reference paragraph. ".repeat(100));
    await expectCompleted(bubble);
    expect(bubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
    expect(log.scrollHeight).toBe(1400);
    expect(log.scrollTop).toBe(1000);
  });

  it("follows an error fallback completion", async () => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));
    const bubble = submit("what is clia");
    expect(log.scrollTop).toBe(100);
    request.reject(new Error("Network unavailable"));
    await expectCompleted(bubble);
    expect(bubble.textContent).toContain("That reference could not be loaded. Please try again.");
    expect(bubble.querySelector(".source")).toBeNull();
    expect(log.scrollTop).toBe(1000);
  });

  it.each([25, 80])("preserves the position after scrolling up %ipx during loading", async gap => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(request.promise));
    const bubble = submit("what is clia");
    expect(log.scrollTop).toBe(100);
    log.scrollTop = 100 - gap;
    request.succeed("# CLIA basics\n\nA longer reference.");
    await expectCompleted(bubble);
    expect(log.scrollHeight).toBe(1400);
    expect(log.scrollTop).toBe(100 - gap);
  });

  it("updates each request's bubble out of order and rechecks the reader's position", async () => {
    const first = deferredFetch();
    const second = deferredFetch();
    vi.stubGlobal("fetch", vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const firstBubble = submit("what is clia");
    const secondBubble = submit("QC workflow");
    second.succeed("# Second reply: QC");
    await expectCompleted(secondBubble);
    expect(firstBubble.textContent).toContain("Loading local reference...");
    expect(secondBubble.querySelector(".source")?.textContent).toContain("canned/qc_workflow.md");
    expect(log.scrollTop).toBe(1000);

    log.scrollTop = 300;
    first.succeed("# First reply: CLIA");
    await expectCompleted(firstBubble);
    expect(firstBubble.textContent).toContain("First reply: CLIA");
    expect(firstBubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
    expect(secondBubble.textContent).toContain("Second reply: QC");
    expect(secondBubble.textContent).not.toContain("First reply: CLIA");
    expect(log.scrollHeight).toBe(2300);
    expect(log.scrollTop).toBe(300);
  });
});
