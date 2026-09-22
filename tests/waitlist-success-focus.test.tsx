// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { act } from "react";
import ts from "typescript";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as waitlistSubmit from "../src/lib/waitlist-submit";

// Compile the real component and resolve its app alias locally, without a
// Vitest config change or a mock of the submission outcome helpers.
const require = createRequire(import.meta.url);
const source = readFileSync(path.resolve(__dirname, "../src/app/waitlist-forms.tsx"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  fileName: "waitlist-forms.tsx",
});
const componentModule = { exports: {} };
new Function("require", "exports", outputText)(
  (id: string) => id === "@/lib/waitlist-submit" ? waitlistSubmit : require(id),
  componentModule.exports,
);
const { Waitlist, WaitlistCompact } = componentModule.exports as typeof import("../src/app/waitlist-forms");

const values = {
  name: "Jane Smith",
  email: "jane@example.com",
  organization: "Example Lab",
  role: "Researcher",
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function confirmation(scope: ParentNode = container) {
  return scope.querySelector<HTMLHeadingElement>("h3[tabindex='-1']");
}

async function submit(scope: ParentNode = container) {
  const form = scope.querySelector("form")!;
  for (const [name, value] of Object.entries(values)) {
    form.querySelector<HTMLInputElement>(`[name="${name}"]`)!.value = value;
  }
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  button.focus();
  expect(document.activeElement).toBe(button);
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  return button;
}

function expectFocusedConfirmation(scope: ParentNode = container) {
  const heading = confirmation(scope);
  expect(heading).not.toBeNull();
  expect(heading!.textContent).toBe("✓ You're on the list.");
  expect(heading!.tabIndex).toBe(-1);
  expect(document.activeElement).toBe(heading);
  expect(scope.querySelector("form")).toBeNull();
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe.each([
  ["WaitlistCompact", WaitlistCompact],
  ["Waitlist", Waitlist],
] as const)("%s success focus", (_name, Component) => {
  it("moves focus only after a successful response renders the confirmation", async () => {
    const initialFocus = document.activeElement;
    await act(async () => root.render(<Component />));
    expect(document.activeElement).toBe(initialFocus);
    expect(confirmation()).toBeNull();

    let resolve!: (response: { ok: boolean; status: number }) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const button = await submit();

    expect(button.disabled).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(confirmation()).toBeNull();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    await act(async () => resolve({ ok: true, status: 200 }));
    expectFocusedConfirmation();

    // Subsequent renders must not steal focus back from the contact link.
    const link = container.querySelector<HTMLAnchorElement>('a[href="mailto:info@lims.bot"]')!;
    link.focus();
    await act(async () => root.render(<Component />));
    expect(document.activeElement).toBe(link);
  });

  it.each([400, 500, "network"] as const)("keeps focus on the submit button after %s failure", async (failure) => {
    await act(async () => root.render(<Component />));
    if (failure === "network") {
      fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    } else {
      fetchMock.mockResolvedValueOnce({ ok: false, status: failure });
    }

    const button = await submit();
    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    expect(confirmation()).toBeNull();
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      failure === 400
        ? "Please check your name and email."
        : "We could not reach the server. Please try again, or email info@lims.bot."
    );
    for (const [name, value] of Object.entries(values)) {
      expect(container.querySelector<HTMLInputElement>(`[name="${name}"]`)!.value).toBe(value);
    }
  });
});

it.each([
  ["waitlist-top", "waitlist"],
  ["waitlist", "waitlist-top"],
])("focuses only the submitting form when %s succeeds before %s", async (firstId, secondId) => {
  const initialFocus = document.activeElement;
  await act(async () => root.render(<><WaitlistCompact /><Waitlist /></>));
  expect(document.activeElement).toBe(initialFocus);

  const first = container.querySelector(`#${firstId}`)!;
  const second = container.querySelector(`#${secondId}`)!;
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
  await submit(first);
  expectFocusedConfirmation(first);
  expect(confirmation(second)).toBeNull();
  expect(second.querySelector("form")).not.toBeNull();

  let resolve!: (response: { ok: boolean; status: number }) => void;
  fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
  const secondButton = await submit(second);
  expect(document.activeElement).toBe(secondButton);
  expect(confirmation(second)).toBeNull();

  await act(async () => resolve({ ok: true, status: 200 }));
  expectFocusedConfirmation(second);
  expect(confirmation(first)).not.toBe(confirmation(second));
});
