// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

const draft = {
  draftTitle: "Mock collection record",
  draftRecord: "Collected mock sample.\nOperator review required.",
  structuredFields: {},
  requiresHumanApproval: true,
  safetyNote: "Mock data only.",
  suggestedNextAction: "Review the draft.",
  mode: "template",
};

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function card() {
  const section = container.querySelector('[aria-labelledby="demo-onboarding-title"]');
  expect(section).not.toBeNull();
  return section!;
}

function expectProgress(completed: number, currentTitle?: string) {
  const progress = card().querySelector('[role="progressbar"]')!;
  expect(progress.getAttribute("aria-valuenow")).toBe(String(completed));
  expect(progress.getAttribute("aria-valuetext")).toBe(`${completed} of 4 steps complete`);
  expect((progress.firstElementChild as HTMLElement).style.width).toBe(`${completed * 25}%`);
  const current = card().querySelectorAll('[aria-current="step"]');
  expect(current).toHaveLength(currentTitle ? 1 : 0);
  if (currentTitle) expect(current[0].textContent).toContain(currentTitle);
  expect(Array.from(card().querySelectorAll("li"))
    .filter((step) => step.textContent?.endsWith("Complete"))).toHaveLength(completed);
}

function button(label: string) {
  const match = Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.includes(label));
  expect(match, `button: ${label}`).toBeDefined();
  return match!;
}

async function click(label: string) {
  await act(async () => button(label).click());
}

async function edit(textarea: HTMLTextAreaElement, value: string) {
  await act(async () => {
    // Use the native setter so React observes a user change to a controlled input.
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // There is no seen/dismissed persistence in this component. Fail if a test
  // accidentally starts depending on a real browser storage implementation.
  const storage = {
    getItem: vi.fn(() => { throw new Error("Unexpected storage read"); }),
    setItem: vi.fn(() => { throw new Error("Unexpected storage write"); }),
    removeItem: vi.fn(), clear: vi.fn(), key: vi.fn(), length: 0,
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => draft });
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<LimsBotPage />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("onboarding card interactions", () => {
  it("shows the card on a fresh visit at the first step", () => {
    expect(card().textContent).toContain("Follow the safe demo journey");
    expectProgress(0, "Set up the mock scenario");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it("advances after a mock scan and then a successful draft", async () => {
    await click("Mock scan");
    expectProgress(1, "Generate a documentation draft");
    await click("Generate draft");
    expectProgress(2, "Review and make the human decision");
    expect(card().querySelector('[aria-live="polite"]')?.textContent)
      .toContain("review or edit the draft");
  });

  it("allows the optional scan and operator note to be omitted", async () => {
    await click("Generate draft");
    expectProgress(2, "Review and make the human decision");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/lims-bot");
    expect(request.method).toBe("POST");
    expect(JSON.parse(request.body)).toMatchObject({ workflow: "field_sample", userMessage: "" });
  });

  it.each(["Approve", "Reject"])("completes only after the human chooses %s", async (decision) => {
    await click("Generate draft");
    expectProgress(2, "Review and make the human decision");
    await click(decision);
    expectProgress(4);
    expect(card().textContent).toContain("Demo journey complete");
    expect(container.querySelector("aside")?.textContent)
      .toContain(decision === "Approve" ? "approved" : "rejected");
    // Completion stays visible and takes precedence over subsequent draft state.
    await click("Generate draft");
    expectProgress(4);
  });

  it("records edited approval and supports resetting draft edits", async () => {
    await click("Generate draft");
    const record = container.querySelectorAll("textarea")[1];
    await edit(record, "Edited mock record");
    expectProgress(2, "Review and make the human decision");
    await click("Reset edits");
    expect(record.value).toBe(draft.draftRecord);
    await edit(record, "Revised mock record");
    await click("Approve");
    expect(container.querySelector("aside")?.textContent).toContain("edited-approved");
    expectProgress(4);
  });

  it.each([false, true])("returns to the appropriate step on workflow change (scanned=%s)", async (scanned) => {
    if (scanned) await click("Mock scan");
    await click("Generate draft");
    await click("Chain-of-custody event");
    expectProgress(scanned ? 1 : 0, scanned ? "Generate a documentation draft" : "Set up the mock scenario");
    expect(container.textContent).not.toContain("4. Draft preview");
  });

  it.each(["http", "network"])("does not advance on a %s failure and allows retry", async (failure) => {
    await click("Mock scan");
    if (failure === "http") fetchMock.mockResolvedValueOnce({ ok: false, status: 400 });
    else fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await click("Generate draft");
    expectProgress(1, "Generate a documentation draft");
    expect(container.textContent).toContain(failure === "http" ? "API error: 400" : "Network error generating draft.");
    expect(button("Generate draft").disabled).toBe(false);
    await click("Generate draft");
    expectProgress(2, "Review and make the human decision");
    expect(container.textContent).not.toContain("error");
  });

  it("disables generation while awaiting a response without advancing", async () => {
    let resolve!: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    await click("Generate draft");
    expect(button("Drafting…").disabled).toBe(true);
    expectProgress(0, "Set up the mock scenario");
    await act(async () => resolve({ ok: true, json: async () => draft }));
    expectProgress(2, "Review and make the human decision");
  });

  it("starts a new session on remount: completion is not a persisted dismissal", async () => {
    await click("Generate draft");
    await click("Approve");
    expectProgress(4);
    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<LimsBotPage />));
    expectProgress(0, "Set up the mock scenario");
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
  });
});
