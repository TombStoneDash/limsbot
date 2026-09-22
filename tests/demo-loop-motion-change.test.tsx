// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DemoLoopVideo from "../src/app/demo-loop/demo-loop-video";

let container: HTMLDivElement;
let root: Root | undefined;
const play = vi.fn().mockResolvedValue(undefined);
const pause = vi.fn();

function motion(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: initial,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (type === "change") listeners.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: (event: MediaQueryListEvent) => void) => {
      if (type === "change") listeners.delete(listener);
    }),
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(query));
  return {
    query,
    listeners,
    async change(matches: boolean) {
      query.matches = matches;
      await act(async () => {
        const event = new Event("change") as MediaQueryListEvent;
        Object.defineProperty(event, "matches", { value: matches });
        for (const listener of listeners) listener(event);
      });
    },
  };
}

async function render() {
  await act(async () => root!.render(<DemoLoopVideo />));
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("demo loop motion preference changes", () => {
  it("pauses on enable and leaves playback under manual control on disable", async () => {
    const preference = motion(false);
    await render();
    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();
    expect(container.querySelector("video")!.controls).toBe(true);

    await preference.change(true);
    expect(pause).toHaveBeenCalledTimes(1);
    await preference.change(false);
    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("does not autoplay with initial reduced motion or when it is later disabled", async () => {
    const preference = motion(true);
    await render();
    expect(play).not.toHaveBeenCalled();
    await preference.change(false);
    expect(play).not.toHaveBeenCalled();
    await preference.change(true);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("removes the change listener on unmount", async () => {
    const preference = motion(false);
    await render();
    expect(preference.listeners.size).toBe(1);
    expect(preference.query.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    await act(async () => root!.unmount());
    root = undefined;
    expect(preference.query.removeEventListener).toHaveBeenCalledWith(
      "change", preference.query.addEventListener.mock.calls[0][1],
    );
    expect(preference.listeners.size).toBe(0);
    await preference.change(true);
    expect(pause).not.toHaveBeenCalled();
  });

  it.each(["addEventListener", "removeEventListener"])("tolerates unavailable %s", async (method) => {
    const preference = motion(false);
    Reflect.deleteProperty(preference.query, method);
    await render();
    expect(play).toHaveBeenCalledTimes(1);
    await act(async () => root!.unmount());
    root = undefined;
  });
});
