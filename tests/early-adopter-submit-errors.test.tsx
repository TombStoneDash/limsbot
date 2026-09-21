// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAdopterPage from "../src/app/early-adopter/page";

const application = {
  labName: "Example Test Lab",
  labType: "Environmental",
  contactName: "Jane Example",
  email: "jane@example.com",
  testVolume: "100-500",
  painPoint: "Tracking samples across multiple systems.",
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function button() {
  return container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
}

function expectRetainedValues() {
  expect(container.querySelector("form")).not.toBeNull();
  for (const [name, value] of Object.entries(application)) {
    expect(container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)?.value).toBe(value);
  }
}

async function startAttempt() {
  let resolve!: (response: { ok: boolean; status: number }) => void;
  let reject!: (error: Error) => void;
  fetchMock.mockReturnValueOnce(new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  }));
  await act(async () => button().click());
  expect(button().disabled).toBe(true);
  expect(button().textContent).toBe("Submitting...");
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.textContent).not.toContain("Application Received");
  expectRetainedValues();
  expect(fetchMock).toHaveBeenLastCalledWith("/api/early-adopter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  });
  return { resolve, reject };
}

function expectFailure(kind: "network" | "HTTP") {
  expectRetainedValues();
  expect(container.textContent).not.toContain("Application Received");
  const alert = container.querySelector('[role="alert"]');
  expect(alert).not.toBeNull();
  expect(alert?.textContent).toMatch(kind === "network" ? /network|connect/i : /submit|server/i);
  expect(alert?.textContent).toMatch(/try again|retry/i);
  expect(button().disabled).toBe(false);
  expect(button().textContent).toBe("Apply for the Pilot →");
}

function expectSuccess() {
  expect(container.textContent).toContain("Application Received");
  expect(container.textContent).toContain("We'll review your application and reach out within 48 hours.");
  expect(container.querySelector("form")).toBeNull();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.textContent).not.toContain("Submitting...");
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<EarlyAdopterPage />));
  await act(async () => {
    for (const [name, value] of Object.entries(application)) {
      const field = container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("early adopter application submission", () => {
  it("keeps entered fields and restores the button after a network rejection", async () => {
    const attempt = await startAttempt();
    await act(async () => attempt.reject(new TypeError("Failed to fetch")));
    expectFailure("network");
  });

  it.each([400, 500])("shows retry feedback and restores the button after HTTP %s", async (status) => {
    const attempt = await startAttempt();
    await act(async () => attempt.resolve({ ok: false, status }));
    expectFailure("HTTP");
  });

  it("shows the unchanged confirmation only after a successful response", async () => {
    const attempt = await startAttempt();
    await act(async () => attempt.resolve({ ok: true, status: 200 }));
    expectSuccess();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(["network", 400, 500])("clears stale feedback and succeeds on retry after %s failure", async (failure) => {
    const first = await startAttempt();
    await act(async () => {
      if (failure === "network") first.reject(new TypeError("Failed to fetch"));
      else first.resolve({ ok: false, status: failure as number });
    });
    expectFailure(failure === "network" ? "network" : "HTTP");
    const retry = await startAttempt();
    await act(async () => retry.resolve({ ok: true, status: 200 }));
    expectSuccess();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
