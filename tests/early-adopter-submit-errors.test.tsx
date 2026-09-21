// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAdopterPage from "../src/app/early-adopter/page";

const values = {
  labName: "Example Lab",
  labType: "Environmental",
  contactName: "Jane Smith",
  email: "jane@example.com",
  testVolume: "100-500",
  painPoint: "Manual data entry",
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function button() {
  return container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
}

function expectRetainedValues() {
  expect(container.querySelector("form")).not.toBeNull();
  for (const [name, value] of Object.entries(values)) {
    expect(container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!.value).toBe(value);
  }
}

async function submit() {
  await act(async () => {
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<EarlyAdopterPage />));
  for (const [name, value] of Object.entries(values)) {
    container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!.value = value;
  }
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("early adopter submission", () => {
  it.each(["network", 400, 500] as const)("retains the application and restores the button after %s failure", async (failure) => {
    if (failure === "network") {
      fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    } else {
      fetchMock.mockResolvedValueOnce({ ok: false, status: failure });
    }

    expect(container.querySelector('[role="alert"]')).toBeNull();
    await submit();

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/early-adopter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    expectRetainedValues();
    expect(container.textContent).not.toContain("Application Received");
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(/could not submit.*try again/i);
    expect(button().disabled).toBe(false);
    expect(button().textContent).toBe("Apply for the Pilot →");
  });

  it("shows confirmation only after an OK response and preserves the request contract", async () => {
    let resolve!: (response: { ok: boolean; status: number }) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));

    await submit();
    expect(button().disabled).toBe(true);
    expect(button().textContent).toBe("Submitting...");
    expect(container.textContent).not.toContain("Application Received");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/early-adopter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    await act(async () => resolve({ ok: true, status: 200 }));
    expect(container.textContent).toContain("Application Received");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("clears the error while retrying and confirms a successful retry with retained values", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await submit();
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expectRetainedValues();
    expect(button().disabled).toBe(false);

    let resolve!: (response: { ok: boolean }) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    await submit();

    expect(container.querySelector('[role="alert"]')).toBeNull();
    expectRetainedValues();
    expect(button().disabled).toBe(true);
    expect(button().textContent).toBe("Submitting...");
    expect(container.textContent).not.toContain("Application Received");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(values);

    await act(async () => resolve({ ok: true }));
    expect(container.textContent).toContain("Application Received");
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
