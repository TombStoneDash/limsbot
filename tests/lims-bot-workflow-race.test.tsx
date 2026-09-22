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

async function settle(request: ReturnType<typeof queueRequest>, outcome: Outcome, title = "Obsolete field sample") {
  await act(async () => {
    if (outcome === "network") request.reject(new Error("Offline"));
    else request.resolve(outcome === "http" ? { ok: false, status: 503 } : response(title));
  });
}

function expectNoObsoleteState() {
  expect(container.textContent).not.toContain("Obsolete field sample");
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
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("workflow generation races", () => {
  it.each(outcomes)("ignores late %s after switching and permits generation immediately", async (outcome) => {
    const old = queueRequest();
    await click("Generate draft");
    expect(button("Drafting…").disabled).toBe(true);
    await click("Chain-of-custody event");
    expect(button("Generate draft").disabled).toBe(false);
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(container.querySelector('[aria-current="step"]')?.textContent).toContain("Set up the mock scenario");
    expect(button("Generate draft").disabled).toBe(false);
  });

  it("invalidates A-to-B-to-A requests even when the workflow matches again", async () => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Chain-of-custody event");
    await click("Field sample documentation");
    await settle(old, "success");
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(outcomes)("keeps the replacement loading when the old request finishes first with %s", async (outcome) => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Chain-of-custody event");
    const replacement = queueRequest();
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).workflow).toBe("chain_of_custody");
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(button("Drafting…").disabled).toBe(true);
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    await settle(replacement, "success", "Valid custody transfer");
    expect(button("Generate draft").disabled).toBe(false);
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Valid custody transfer").draftRecord);
    await click("Approve");
    const events = container.querySelectorAll("aside li");
    const event = Array.from(events).find((node) => node.textContent?.includes("Valid custody transfer"));
    expect(event?.textContent).toContain("chain_of_custody · approved · template");
    expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("4");
  });

  it.each(outcomes)("preserves a completed replacement when the old request finishes last with %s", async (outcome) => {
    const old = queueRequest();
    await click("Generate draft");
    await click("Chain-of-custody event");
    const replacement = queueRequest();
    await click("Generate draft");
    await settle(replacement, "success", "Valid custody transfer");
    await settle(old, outcome);
    expectNoObsoleteState();
    expect(container.querySelectorAll("textarea")[1].value).toBe(draft("Valid custody transfer").draftRecord);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(["resolve", "reject"] as const)("ignores obsolete JSON parsing that later %ss", async (outcome) => {
    const body = deferred<ReturnType<typeof draft>>();
    const old = queueRequest();
    await click("Generate draft");
    await act(async () => old.resolve({ ok: true, json: () => body.promise }));
    await click("Chain-of-custody event");
    const replacement = queueRequest();
    await click("Generate draft");
    await act(async () => {
      if (outcome === "resolve") body.resolve(draft("Obsolete field sample"));
      else body.reject(new Error("Invalid JSON"));
    });
    expectNoObsoleteState();
    expect(button("Drafting…").disabled).toBe(true);
    await settle(replacement, "success", "Valid custody transfer");
    expect(container.textContent).toContain("Valid custody transfer");
  });

  it("clears an existing workflow error when switching", async () => {
    const failed = queueRequest();
    await click("Generate draft");
    await settle(failed, "http");
    expect(container.textContent).toContain("API error: 503");
    await click("Chain-of-custody event");
    expectNoObsoleteState();
    expect(button("Generate draft").disabled).toBe(false);
  });
});
