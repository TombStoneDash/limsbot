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
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
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

type MockResponse = { ok: boolean; status?: number; json?: () => Promise<ReturnType<typeof draft>> };
type PendingRequest = ReturnType<typeof deferred<MockResponse>>;
type Outcome = "success" | "http error" | "rejection";

const staleTitle = "Stale field sample";
const freshTitle = "Fresh custody transfer";
let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

function button(label: string) {
  const match = Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.includes(label));
  expect(match, `button: ${label}`).toBeDefined();
  return match!;
}

async function click(label: string) {
  await act(async () => button(label).click());
}

async function startRequest() {
  const request = deferred<MockResponse>();
  fetchMock.mockReturnValueOnce(request.promise);
  await click("Generate draft");
  expect(button("Drafting…").disabled).toBe(true);
  return request;
}

async function finish(request: PendingRequest, outcome: Outcome, title = staleTitle) {
  await act(async () => {
    if (outcome === "rejection") request.reject(new Error("Offline"));
    else if (outcome === "http error") request.resolve({ ok: false, status: 503 });
    else request.resolve({ ok: true, json: async () => draft(title) });
  });
}

function expectNoStaleState() {
  expect(container.textContent).not.toContain(staleTitle);
  expect(container.textContent).not.toContain("API error:");
  expect(container.textContent).not.toContain("Network error generating draft.");
}

async function approveFreshDraft(workflow = "chain_of_custody") {
  expect(container.querySelectorAll("textarea")[1]?.value).toBe(draft(freshTitle).draftRecord);
  await click("Approve");
  const events = container.querySelectorAll("aside ul")[0].querySelectorAll("li");
  expect(events).toHaveLength(1);
  expect(events[0].textContent).toContain(freshTitle);
  expect(events[0].textContent).toContain(`${workflow} · approved`);
  expect(events[0].textContent).not.toContain(staleTitle);
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

describe("workflow request invalidation", () => {
  it.each<Outcome>(["success", "http error", "rejection"])(
    "discards late %s after switching and immediately enables generation",
    async (outcome) => {
      const old = await startRequest();
      expect(button("Chain-of-custody event").disabled).toBe(false);
      await click("Chain-of-custody event");
      expect(button("Generate draft").disabled).toBe(false);
      await finish(old, outcome);
      expectNoStaleState();
      expect(container.textContent).not.toContain("4. Draft preview");
      expect(button("Generate draft").disabled).toBe(false);
    },
  );

  it.each<Outcome>(["success", "http error", "rejection"])(
    "does not clear a newer request's loading state on old %s",
    async (outcome) => {
      const old = await startRequest();
      await click("Chain-of-custody event");
      const fresh = await startRequest();
      expect(fetchMock.mock.calls.map(([, request]) => JSON.parse(request.body).workflow))
        .toEqual(["field_sample", "chain_of_custody"]);
      await finish(old, outcome);
      expectNoStaleState();
      expect(button("Drafting…").disabled).toBe(true);
      expect(container.textContent).not.toContain("4. Draft preview");
      await finish(fresh, "success", freshTitle);
      expect(button("Generate draft").disabled).toBe(false);
      await approveFreshDraft();
    },
  );

  it.each<Outcome>(["success", "http error", "rejection"])(
    "preserves the newer draft when old %s completes last",
    async (outcome) => {
      const old = await startRequest();
      await click("Chain-of-custody event");
      const fresh = await startRequest();
      await finish(fresh, "success", freshTitle);
      await finish(old, outcome);
      expectNoStaleState();
      expect(button("Generate draft").disabled).toBe(false);
      await approveFreshDraft();
    },
  );

  it("invalidates an old request even after switching back to its workflow", async () => {
    const old = await startRequest();
    await click("Chain-of-custody event");
    await click("Field sample documentation");
    const fresh = await startRequest();
    await finish(old, "success");
    expectNoStaleState();
    expect(button("Drafting…").disabled).toBe(true);
    await finish(fresh, "success", freshTitle);
    await approveFreshDraft("field_sample");
  });

  it.each(["success", "rejection"])("ignores stale body parsing %s", async (outcome) => {
    const old = await startRequest();
    const body = deferred<ReturnType<typeof draft>>();
    const json = vi.fn(() => body.promise);
    await act(async () => old.resolve({ ok: true, json }));
    expect(json).toHaveBeenCalledOnce();
    await click("Chain-of-custody event");
    const fresh = await startRequest();
    await act(async () => {
      if (outcome === "success") body.resolve(draft(staleTitle));
      else body.reject(new Error("Invalid body"));
    });
    expectNoStaleState();
    expect(button("Drafting…").disabled).toBe(true);
    await finish(fresh, "success", freshTitle);
    await approveFreshDraft();
  });

  it("clears existing errors and draft edits on workflow selection", async () => {
    const failed = await startRequest();
    await finish(failed, "http error");
    expect(container.textContent).toContain("API error: 503");
    await click("Chain-of-custody event");
    expectNoStaleState();
    const first = await startRequest();
    await finish(first, "success", freshTitle);
    await act(async () => {
      const record = container.querySelectorAll("textarea")[1];
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
        .set!.call(record, "Discard these edits");
      record.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await click("Field sample documentation");
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(container.textContent).not.toContain("4. Draft preview");
    const fresh = await startRequest();
    await finish(fresh, "success", freshTitle);
    await approveFreshDraft("field_sample");
  });
});
