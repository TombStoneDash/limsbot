// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const demoFile = (name: string) =>
  readFileSync(path.resolve(__dirname, "../public/demo/lims-bot", name), "utf-8");

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function reference(title: string) {
  return { ok: true, text: async () => `# ${title}` };
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

describe("demo chat completed-response scrolling", () => {
  let log: HTMLElement;

  beforeEach(() => {
    const page = new DOMParser().parseFromString(demoFile("index.html"), "text/html");
    document.body.replaceChildren(
      document.importNode(page.querySelector("#chat-log")!, true),
      document.importNode(page.querySelector("#chat-form")!, true),
    );
    log = document.querySelector<HTMLElement>("#chat-log")!;
    let scrollTop = 0;
    // Simulate an overflowing transcript, with 400px of growth per completed reply.
    // Clamp writes like a browser so appendMessage's scrollHeight assignment reaches bottom.
    Object.defineProperties(log, {
      clientHeight: { configurable: true, get: () => 300 },
      scrollHeight: {
        configurable: true,
        get: () => 800 + log.children.length * 50 + log.querySelectorAll(".badge").length * 400,
      },
      scrollTop: {
        configurable: true,
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

  it.each([
    ["reference", "CLIA basics", 0],
    ["reference", "CLIA basics", 2],
    ["suggestions", "pizza", 0],
    ["suggestions", "pizza", 2],
    ["failure", "CLIA basics", 0],
    ["failure", "CLIA basics", 2],
  ])("follows growing %s for %s when %ipx from bottom", async (kind, query, gap) => {
    vi.stubGlobal("fetch", kind === "failure"
      ? vi.fn().mockRejectedValue(new Error("Network unavailable"))
      : vi.fn().mockResolvedValue(reference("Completed reference")));
    const bubble = submit(query);
    const pendingHeight = log.scrollHeight;
    log.scrollTop -= gap;

    await expectCompleted(bubble);

    expect(log.scrollHeight).toBe(pendingHeight + 400);
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);
  });

  it.each(["reference", "failure"])("preserves an upward scroll during a deferred %s fetch", async kind => {
    const response = deferred<ReturnType<typeof reference>>();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(response.promise));
    const bubble = submit("CLIA basics");
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);
    log.scrollTop -= 150;
    const readerPosition = log.scrollTop;

    if (kind === "failure") response.reject(new Error("Network unavailable"));
    else response.resolve(reference("Completed reference"));
    await expectCompleted(bubble);

    expect(log.scrollTop).toBe(readerPosition);
  });

  it("preserves an upward scroll before unknown-topic suggestions complete", async () => {
    const bubble = submit("pizza");
    log.scrollTop -= 150;
    const readerPosition = log.scrollTop;

    await expectCompleted(bubble);

    expect(log.scrollTop).toBe(readerPosition);
  });

  it.each([false, true])("updates overlapping replies independently with upward scrolling: %s", async scrollUp => {
    const first = deferred<ReturnType<typeof reference>>();
    const second = deferred<ReturnType<typeof reference>>();
    vi.stubGlobal("fetch", vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const firstBubble = submit("CLIA basics");
    const secondBubble = submit("QC workflow");

    second.resolve(reference("Second answer"));
    await expectCompleted(secondBubble);
    expect(firstBubble.textContent).toContain("Loading local reference...");
    expect(secondBubble.textContent).toContain("Second answer");
    expect(log.scrollTop).toBe(log.scrollHeight - log.clientHeight);

    if (scrollUp) log.scrollTop -= 150;
    const readerPosition = log.scrollTop;
    first.resolve(reference("First answer"));
    await expectCompleted(firstBubble);

    expect(firstBubble.textContent).toContain("First answer");
    expect(firstBubble.textContent).toContain("Source: canned/clia_basics.md");
    expect(secondBubble.textContent).toContain("Second answer");
    expect(secondBubble.textContent).toContain("Source: canned/qc_workflow.md");
    expect(log.scrollTop).toBe(scrollUp ? readerPosition : log.scrollHeight - log.clientHeight);
  });
});
