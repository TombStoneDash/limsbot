// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DemoLoopVideo from "../src/app/demo-loop/demo-loop-video";

let container: HTMLDivElement;
let root: Root | undefined;
const play = vi.fn().mockResolvedValue(undefined);
const requestFullscreen = vi.fn().mockResolvedValue(undefined);

function motion(reduced: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: reduced }));
}

async function render() {
  await act(async () => root!.render(<DemoLoopVideo />));
}

async function key(key: string, options: KeyboardEventInit = {}, target: EventTarget = window) {
  await act(async () => {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...options }));
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  // jsdom does not implement the fullscreen API.
  Object.defineProperty(HTMLVideoElement.prototype, "requestFullscreen", {
    configurable: true, writable: true, value: requestFullscreen,
  });
  motion(false);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  container.remove();
  Reflect.deleteProperty(HTMLVideoElement.prototype, "requestFullscreen");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("demo loop video", () => {
  it("plays once when motion is allowed, without an autoplay attribute", async () => {
    await render();
    expect(play).toHaveBeenCalledTimes(1);
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    const video = container.querySelector("video")!;
    expect(video.hasAttribute("autoplay")).toBe(false);
    expect(video.getAttribute("aria-label")).toBe("LIMS BOX 84-second product demo (loop)");
  });

  it("leaves the poster paused for reduced motion", async () => {
    motion(true);
    await render();
    expect(play).not.toHaveBeenCalled();
    expect(container.querySelector("video")!.getAttribute("poster")).toBe("/images/branded-newcase.jpg");
  });

  it("handles browsers without matchMedia", async () => {
    vi.stubGlobal("matchMedia", undefined);
    await render();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("enters fullscreen through the visible button", async () => {
    await render();
    const button = container.querySelector("button")!;
    expect(button.textContent).toBe("Full screen");
    expect(button.type).toBe("button");
    expect(button.className).toContain("min-h-[44px]");
    await act(async () => button.click());
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("handles f and F and removes the listener on unmount", async () => {
    await render();
    await key("f");
    await key("F");
    expect(requestFullscreen).toHaveBeenCalledTimes(2);
    await act(async () => root!.unmount());
    root = undefined;
    await key("f");
    expect(requestFullscreen).toHaveBeenCalledTimes(2);
  });

  it.each(["ctrlKey", "metaKey", "altKey"])("ignores %s shortcuts", async (modifier) => {
    await render();
    await key("f", { [modifier]: true });
    expect(requestFullscreen).not.toHaveBeenCalled();
  });

  it.each(["input", "textarea", "select", "editable"])("ignores typing in %s", async (tag) => {
    await render();
    const field = document.createElement(tag === "editable" ? "div" : tag);
    if (tag === "editable") field.setAttribute("contenteditable", "true");
    document.body.append(field);
    try {
      await key("f", {}, field);
      expect(requestFullscreen).not.toHaveBeenCalled();
    } finally {
      field.remove();
    }
  });

  it("exits existing fullscreen on f", async () => {
    await render();
    const exit = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: container.querySelector("video") });
    Object.defineProperty(document, "exitFullscreen", { configurable: true, value: exit });
    try {
      await key("f");
      expect(exit).toHaveBeenCalledTimes(1);
      expect(requestFullscreen).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(document, "fullscreenElement");
      Reflect.deleteProperty(document, "exitFullscreen");
    }
  });

  it.each(["webkitEnterFullscreen", "webkitRequestFullscreen"])("falls back to %s", async (method) => {
    await render();
    Reflect.deleteProperty(HTMLVideoElement.prototype, "requestFullscreen");
    const fallback = vi.fn();
    Object.defineProperty(container.querySelector("video"), method, { value: fallback });
    await key("f");
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it("ignores rejected playback and fullscreen requests", async () => {
    play.mockRejectedValueOnce(new Error("Autoplay denied"));
    requestFullscreen.mockRejectedValueOnce(new Error("Fullscreen denied"));
    await render();
    await key("f");
    expect(play).toHaveBeenCalledTimes(1);
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });
});

it("keeps the page server rendered with accurate, readable instructions", () => {
  const page = readFileSync("src/app/demo-loop/page.tsx", "utf8");
  expect(page).not.toContain("toggle controls");
  expect(page).toContain("pause or play");
  expect(page).toContain("export const metadata");
  expect(page).not.toContain('"use client"');
  expect(page).not.toContain("text-[#F8F9FA]/40");
});
