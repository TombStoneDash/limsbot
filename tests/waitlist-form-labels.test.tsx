// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WaitlistCompact, Waitlist } from "../src/app/waitlist-forms";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("waitlist email labels", () => {
  it.each([
    ["WaitlistCompact", WaitlistCompact],
    ["Waitlist", Waitlist],
  ] as const)("%s gives the email field a descriptive accessible name", async (_, Component) => {
    await act(async () => root.render(<Component />));

    const email = container.querySelector('input[type="email"]');
    expect(email).not.toBeNull();
    expect(email!.getAttribute("aria-label")).toBe("Email address");
    expect(email!.getAttribute("aria-label")).not.toBe("your@email.com");
  });
});
