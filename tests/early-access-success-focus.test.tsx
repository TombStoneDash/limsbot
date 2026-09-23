// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAccessPage from "../src/app/early-access/page";

const values = {
  labName: "Example Lab",
  labSize: "5-15",
  instruments: "HPLC",
  currentLims: "None/Excel",
  painPoint: "Manual data entry",
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "555-123-4567",
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function confirmation() {
  return container.querySelector<HTMLHeadingElement>("h2[tabindex='-1']");
}

async function submit() {
  const form = container.querySelector("form")!;
  for (const [name, value] of Object.entries(values)) {
    form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!.value = value;
  }
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  button.focus();
  expect(document.activeElement).toBe(button);
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  return button;
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

describe("early access success focus", () => {
  it("preserves initial focus and focuses confirmation only after deferred success", async () => {
    const initialFocus = document.activeElement;
    await act(async () => root.render(<EarlyAccessPage />));
    expect(document.activeElement).toBe(initialFocus);
    expect(confirmation()).toBeNull();

    let resolve!: (response: { ok: boolean; status: number }) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    const button = await submit();

    expect(button.disabled).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(confirmation()).toBeNull();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/early-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    await act(async () => resolve({ ok: true, status: 200 }));
    const heading = confirmation();
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe("Application Received");
    expect(heading!.tabIndex).toBe(-1);
    expect(document.activeElement).toBe(heading);
    expect(container.querySelector("form")).toBeNull();

    const link = heading!.parentElement!.querySelector<HTMLAnchorElement>('a[href="mailto:info@lims.bot"]')!;
    link.focus();
    expect(document.activeElement).toBe(link);
    await act(async () => root.render(<EarlyAccessPage />));
    expect(document.activeElement).toBe(link);
    expect(confirmation()).toBe(heading);
  });

  it.each([400, 500, "network"] as const)("preserves submit focus after %s failure", async (failure) => {
    await act(async () => root.render(<EarlyAccessPage />));
    if (failure === "network") {
      fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    } else {
      fetchMock.mockResolvedValueOnce({ ok: false, status: failure });
    }

    const button = await submit();
    expect(document.activeElement).toBe(button);
    expect(button.disabled).toBe(false);
    expect(confirmation()).toBeNull();
    expect(container.textContent).not.toContain("Application Received");
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "We could not submit your application. Please try again."
    );
    for (const [name, value] of Object.entries(values)) {
      expect(container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!.value).toBe(value);
    }
  });
});
