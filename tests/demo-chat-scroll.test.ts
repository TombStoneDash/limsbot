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
    complete: (text: string) => resolve({ ok: true, text: async () => text }),
  };
}

function submit(question: string) {
  document.querySelector<HTMLInputElement>("#chat-input")!.value = question;
  document.querySelector<HTMLFormElement>("#chat-form")!.requestSubmit();
  return document.querySelector("#chat-log")!.lastElementChild!.querySelector(".bubble")!;
}

async function completed(bubble: Element) {
  await vi.waitFor(() => expect(bubble.querySelector(".badge")).not.toBeNull());
}

describe("demo chat completion scrolling", () => {
  let log: HTMLElement;
  let scrollWrites: number[];
  const bottom = () => log.scrollHeight - log.clientHeight;
  const longAnswer = "# Reference\n\n" + "A detailed reference paragraph. ".repeat(100);

  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    log = document.querySelector<HTMLElement>("#chat-log")!;
    let position = 0;
    scrollWrites = [];
    // jsdom has no layout: approximate wrapped text and block heights dynamically.
    Object.defineProperties(log, {
      clientHeight: { get: () => 200 },
      scrollHeight: {
        get: () => Math.max(200, [...log.querySelectorAll(".bubble")].reduce(
          (height, bubble) => height + 40 + Math.ceil((bubble.textContent?.length ?? 0) / 40) * 20
            + bubble.querySelectorAll("p, li, h2, h3").length * 20,
          0,
        )),
      },
      scrollTop: {
        get: () => position,
        set: (value: number) => {
          position = Math.max(0, Math.min(value, bottom()));
          scrollWrites.push(position);
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

  it.each([0, 1.5, 2])("follows an expanded answer when %s pixels from the bottom", async gap => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn(() => request.promise));
    const bubble = submit("CLIA basics");
    expect(bubble.textContent).toContain("Loading local reference...");
    expect(bottom()).toBeGreaterThan(gap);
    log.scrollTop = bottom() - gap;
    const pendingHeight = log.scrollHeight;
    scrollWrites.length = 0;
    request.complete(longAnswer);
    await completed(bubble);
    expect(log.scrollHeight).toBeGreaterThan(pendingHeight);
    expect(log.scrollTop).toBe(bottom());
    expect(scrollWrites).toEqual([bottom()]);
  });

  it("preserves the position of a reader who scrolls up while waiting", async () => {
    const request = deferredFetch();
    vi.stubGlobal("fetch", vi.fn(() => request.promise));
    const bubble = submit("CLIA basics");
    log.scrollTop = bottom() - 50;
    const readingPosition = log.scrollTop;
    const pendingHeight = log.scrollHeight;
    scrollWrites.length = 0;
    request.complete(longAnswer);
    await completed(bubble);
    expect(log.scrollHeight).toBeGreaterThan(pendingHeight);
    expect(log.scrollTop).toBe(readingPosition);
    expect(scrollWrites).toEqual([]);
  });

  it("follows unknown-topic suggestion expansion without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const bubble = submit("pizza");
    const pendingHeight = log.scrollHeight;
    expect(log.scrollTop).toBe(bottom());
    scrollWrites.length = 0;
    await completed(bubble);
    expect(bubble.querySelectorAll("button[data-question]")).toHaveLength(8);
    expect(log.scrollHeight).toBeGreaterThan(pendingHeight);
    expect(log.scrollTop).toBe(bottom());
    expect(scrollWrites).toEqual([bottom()]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps out-of-order replies in their own bubbles and rechecks the reader position", async () => {
    const first = deferredFetch();
    const second = deferredFetch();
    vi.stubGlobal("fetch", vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const firstBubble = submit("CLIA basics");
    const secondBubble = submit("QC workflow");
    const pendingHeight = log.scrollHeight;
    second.complete("# Second reply\n\n" + longAnswer);
    await completed(secondBubble);
    expect(firstBubble.textContent).toContain("Loading local reference...");
    expect(secondBubble.textContent).toContain("Second reply");
    expect(secondBubble.querySelector(".source")?.textContent).toContain("canned/qc_workflow.md");
    expect(log.scrollHeight).toBeGreaterThan(pendingHeight);
    expect(log.scrollTop).toBe(bottom());

    log.scrollTop = bottom() - 100;
    const readingPosition = log.scrollTop;
    scrollWrites.length = 0;
    first.complete("# First reply\n\n" + longAnswer);
    await completed(firstBubble);
    expect(firstBubble.textContent).toContain("First reply");
    expect(firstBubble.querySelector(".source")?.textContent).toContain("canned/clia_basics.md");
    expect(secondBubble.textContent).toContain("Second reply");
    expect(secondBubble.textContent).not.toContain("First reply");
    expect(log.scrollTop).toBe(readingPosition);
    expect(scrollWrites).toEqual([]);
  });
});
