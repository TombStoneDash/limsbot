// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function draft(title: string) {
  return {
    draftTitle: title,
    draftRecord: `${title}\nOperator review required.`,
    structuredFields: {},
    requiresHumanApproval: true,
    safetyNote: "Mock data only.",
    suggestedNextAction: "Review the draft.",
    mode: "template",
  };
}

function response(title: string) {
  return { ok: true, json: async () => draft(title) };
}

type MockResponse = { ok: boolean; status?: number; json?: () => Promise<ReturnType<typeof draft>> };
type Outcome = "success" | "http" | "network";
const outcomes: Outcome[] = ["success", "http", "network"];
let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function button(label: string) {
  const found = Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.includes(label));
  expect(found, `button: ${label}`).toBeDefined();
  return found!;
}

async function click(label: string) {
  await act(async () => button(label).click());
}

function queueRequest() {
  const request = deferred<MockResponse>();
  fetchMock.mockReturnValueOnce(request.promise);
  return request;
}

async function settle(request: ReturnType<typeof queueRequest>, outcome: Outcome, title = "Obsolete Sciclone maintenance") {
  await act(async () => {
    if (outcome === "network") request.reject(new Error("Offline"));
    else request.resolve(outcome === "http" ? { ok: false, status: 503 } : response(title));
  });
}

function expectNoObsoleteState() {
  expect(container.textContent).not.toContain("Obsolete Sciclone maintenance");
  expect(container.textContent).not.toContain("API error:");
  expect(container.textContent).not.toContain("Network error generating draft.");
}

async function edit(textarea: HTMLTextAreaElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<LimsBotPage />));
  await click("Instrument maintenance log");
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("asset generation races", () => {
  it.each(outcomes)("ignores late %s after switching and permits generation immediately", async (outcome) => {
    await click("Mock scan");
    const old = queueRequest();
    await click("Generate draft");
    expect(button("Drafting…").disabled).toBe(true);
    await click("Bench centrifuge");
    expect(button("Generate draft").disabled).toBe(false);
    await settle(old, outcome);
    expect(container.textContent).not.toContain("✓ Scanned");
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(container.querySelector('[aria-current="step"]')?.textContent).toContain("Set up the mock scenario");
    expect(button("Generate draft").disabled).toBe(false);
  });

  it("invalidates A-to-B-to-A requests even when the asset matches again", async () => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Bench centrifuge");
    await click("Sciclone G3 NGSx Workstation");
    await settle(old, "success");
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(outcomes)("keeps the replacement loading when the old request finishes first with %s", async (outcome) => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Bench centrifuge");
    const replacement = queueRequest();
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).context.asset).toBe("Sciclone G3 NGSx Workstation");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      workflow: "instrument_maintenance",
      context: { asset: "Bench centrifuge", assetType: "Sample prep" },
    });
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(button("Drafting…").disabled).toBe(true);
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    await settle(replacement, "success", "Valid centrifuge maintenance");
    expect(button("Generate draft").disabled).toBe(false);
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Valid centrifuge maintenance").draftRecord);
    await click("Approve");
    const events = container.querySelectorAll("aside li");
    const event = Array.from(events).find((node) => node.textContent?.includes("Valid centrifuge maintenance"));
    expect(event?.textContent).toContain("instrument_maintenance · approved · template");
    expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("4");
  });

  it.each(outcomes)("preserves a completed replacement when the old request finishes last with %s", async (outcome) => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Bench centrifuge");
    const replacement = queueRequest();
    await click("Generate draft");
    await settle(replacement, "success", "Valid centrifuge maintenance");
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Valid centrifuge maintenance").draftRecord);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(["resolve", "reject"] as const)("ignores obsolete JSON parsing that later %ss", async (outcome) => {
    const body = deferred<ReturnType<typeof draft>>();
    const old = queueRequest();
    await click("Generate draft");
    await act(async () => old.resolve({ ok: true, json: () => body.promise }));
    await click("Bench centrifuge");
    const replacement = queueRequest();
    await click("Generate draft");
    await act(async () => {
      if (outcome === "resolve") body.resolve(draft("Obsolete Sciclone maintenance"));
      else body.reject(new Error("Invalid JSON"));
    });
    expectNoObsoleteState();
    expect(button("Drafting…").disabled).toBe(true);
    await settle(replacement, "success", "Valid centrifuge maintenance");
    expect(container.textContent).toContain("Valid centrifuge maintenance");
  });

  it("clears an existing asset error when switching", async () => {
    const failed = queueRequest();
    await click("Generate draft");
    await settle(failed, "http");
    expect(container.textContent).toContain("API error: 503");
    await click("Bench centrifuge");
    expectNoObsoleteState();
    expect(button("Generate draft").disabled).toBe(false);
  });

  it("removes a completed draft and edits while preserving audit events and operator notes", async () => {
    const approved = queueRequest();
    await click("Generate draft");
    await settle(approved, "success", "Prior approved maintenance");
    await click("Approve");
    const audit = container.querySelector("aside")!.textContent;
    await edit(container.querySelector("textarea")!, "Keep this operator note");
    await click("Mock scan");
    const current = queueRequest();
    await click("Generate draft");
    await settle(current, "success");
    await edit(container.querySelectorAll("textarea")[1], "Old asset edits");
    await click("Bench centrifuge");
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(container.querySelector("textarea")!.value).toBe("Keep this operator note");
    expect(container.textContent).not.toContain("✓ Scanned");
    expect(Array.from(container.querySelectorAll("button")).some((node) => node.textContent === "Approve")).toBe(false);
    expect(container.querySelector("aside")!.textContent).toBe(audit);
    expect(button("Generate draft").disabled).toBe(false);
    const replacement = queueRequest();
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).userMessage).toBe("Keep this operator note");
    await settle(replacement, "success", "Valid centrifuge maintenance");
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Valid centrifuge maintenance").draftRecord);
    await click("Approve");
    expect(container.querySelectorAll("aside > div:first-child li")).toHaveLength(2);
    expect(container.querySelector("aside li")?.textContent).toContain("instrument_maintenance · approved · template");
  });

  it("preserves a completed draft, edits, and scan when selecting the same asset", async () => {
    await click("Mock scan");
    const current = queueRequest();
    await click("Generate draft");
    await settle(current, "success", "Current Sciclone maintenance");
    await edit(container.querySelectorAll("textarea")[1], "Keep these edits");
    await click("Sciclone G3 NGSx Workstation");
    expect(container.textContent).toContain("Current Sciclone maintenance");
    expect(container.querySelectorAll("textarea")[1].value).toBe("Keep these edits");
    expect(container.textContent).toContain("✓ Scanned");
    await click("Approve");
    expect(container.querySelector("aside li")?.textContent).toContain("edited-approved");
  });

  it("preserves pending generation when selecting the same asset", async () => {
    const current = queueRequest();
    await click("Generate draft");
    await click("Sciclone G3 NGSx Workstation");
    expect(button("Drafting…").disabled).toBe(true);
    await settle(current, "success", "Current Sciclone maintenance");
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Current Sciclone maintenance").draftRecord);
  });
});
