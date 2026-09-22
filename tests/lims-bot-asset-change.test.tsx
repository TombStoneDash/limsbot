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

async function settle(request: ReturnType<typeof queueRequest>, outcome: Outcome, title = "Obsolete workstation draft") {
  await act(async () => {
    if (outcome === "network") request.reject(new Error("Offline"));
    else request.resolve(outcome === "http" ? { ok: false, status: 503 } : response(title));
  });
}

function expectNoObsoleteState() {
  expect(container.textContent).not.toContain("Obsolete workstation draft");
  expect(container.textContent).not.toContain("API error:");
  expect(container.textContent).not.toContain("Network error generating draft.");
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
    const old = queueRequest();
    await click("Generate draft");
    expect(button("Drafting…").disabled).toBe(true);
    await click("Bench centrifuge");
    expect(button("Generate draft").disabled).toBe(false);
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll("button")).some((node) => node.textContent === "Approve")).toBe(false);
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
    expect(Array.from(container.querySelectorAll("button")).some((node) => node.textContent === "Approve")).toBe(false);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(outcomes)("keeps the replacement loading when the old request finishes first with %s", async (outcome) => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Bench centrifuge");
    const replacement = queueRequest();
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).context).toMatchObject({ asset: "Bench centrifuge", assetType: "Sample prep" });
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(button("Drafting…").disabled).toBe(true);
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll("button")).some((node) => node.textContent === "Approve")).toBe(false);
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
      if (outcome === "resolve") body.resolve(draft("Obsolete workstation draft"));
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
});

async function editRecord(value: string) {
  const record = container.querySelectorAll("textarea")[1];
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(record, value);
    record.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("asset selection state", () => {
  it("clears a displayed draft, edits and scan while preserving completed audit events", async () => {
    fetchMock.mockResolvedValueOnce(response("Completed maintenance"));
    await click("Generate draft");
    await click("Approve");
    const audit = container.querySelector("aside")!.textContent;
    await click("Mock scan");
    fetchMock.mockResolvedValueOnce(response("Obsolete workstation draft"));
    await click("Generate draft");
    await editRecord("Unsaved workstation edits");
    await click("Bench centrifuge");
    expectNoObsoleteState();
    expect(container.textContent).not.toContain("✓ Scanned");
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll("button")).some((node) => node.textContent === "Approve")).toBe(false);
    expect(container.querySelector("aside")!.textContent).toBe(audit);
    fetchMock.mockResolvedValueOnce(response("Valid centrifuge maintenance"));
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).context.asset).toBe("Bench centrifuge");
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Valid centrifuge maintenance").draftRecord);
    await click("Approve");
    expect(container.querySelector("aside")!.textContent).toContain("Approved: 2");
    expectNoObsoleteState();
  });

  it("preserves a displayed draft, edits and scan when the selected asset is clicked", async () => {
    await click("Mock scan");
    fetchMock.mockResolvedValueOnce(response("Current workstation draft"));
    await click("Generate draft");
    await editRecord("Keep my edits");
    await click("Sciclone G3 NGSx Workstation");
    expect(container.textContent).toContain("Current workstation draft");
    expect(container.textContent).toContain("✓ Scanned");
    expect(container.querySelectorAll("textarea")[1].value).toBe("Keep my edits");
    await click("Approve");
    expect(container.querySelector("aside")!.textContent).toContain("edited-approved");
  });

  it("preserves an outstanding generation when the selected asset is clicked", async () => {
    const pending = queueRequest();
    await click("Generate draft");
    await click("Sciclone G3 NGSx Workstation");
    expect(button("Drafting…").disabled).toBe(true);
    await settle(pending, "success", "Current workstation draft");
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Current workstation draft").draftRecord);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it("preserves an error on same-asset clicks and clears it and the scan on asset changes", async () => {
    await click("Mock scan");
    const failed = queueRequest();
    await click("Generate draft");
    await settle(failed, "http");
    await click("Sciclone G3 NGSx Workstation");
    expect(container.textContent).toContain("API error: 503");
    expect(container.textContent).toContain("✓ Scanned");
    await click("Bench centrifuge");
    expectNoObsoleteState();
    expect(container.textContent).not.toContain("✓ Scanned");
    expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("0");
  });
});
