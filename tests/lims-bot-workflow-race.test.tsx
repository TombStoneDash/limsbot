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
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function draft(title: string) {
  return {
    draftTitle: title,
    draftRecord: `${title} record`,
    structuredFields: {},
    requiresHumanApproval: true,
    safetyNote: "Mock data only.",
    suggestedNextAction: "Review the draft.",
    mode: "template",
  };
}

function response(title: string) {
  return { ok: true, json: vi.fn().mockResolvedValue(draft(title)) };
}

type MockResponse = { ok: boolean; status?: number; json?: () => Promise<unknown> };
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
  expect(button(label).disabled).toBe(false);
  await act(async () => button(label).click());
}

function expectNoStaleOutput() {
  expect(container.textContent).not.toContain("Stale draft");
  for (const textarea of container.querySelectorAll("textarea")) {
    expect(textarea.value).not.toContain("Stale draft");
  }
}

function expectNoDraftOrAudit() {
  expectNoStaleOutput();
  expect(container.textContent).not.toContain("4. Draft preview");
  expect(Array.from(container.querySelectorAll("button"))
    .some((node) => node.textContent?.trim() === "Approve")).toBe(false);
  expect(container.querySelector("aside")?.textContent).toContain("Total: 0");
  expect(container.querySelector("aside")?.textContent).toContain("No events yet.");
}

async function startRequest() {
  const pending = deferred<MockResponse>();
  fetchMock.mockReturnValueOnce(pending.promise);
  await click("Generate draft");
  expect(button("Drafting…").disabled).toBe(true);
  return pending;
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

describe("workflow request races", () => {
  it("discards an old success after switching and immediately enables generation", async () => {
    const old = await startRequest();
    await click("Chain-of-custody event");
    expect(button("Generate draft").disabled).toBe(false);
    expectNoDraftOrAudit();
    await act(async () => old.resolve(response("Stale draft")));
    expectNoDraftOrAudit();
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(["success", "network", "http"])(
    "ignores an old %s while a newer request is loading",
    async (outcome) => {
      const old = await startRequest();
      await click("Chain-of-custody event");
      const current = await startRequest();
      await act(async () => {
        if (outcome === "network") old.reject(new Error("Old request failed"));
        else if (outcome === "http") old.resolve({ ok: false, status: 503 });
        else old.resolve(response("Stale draft"));
      });
      expectNoDraftOrAudit();
      expect(container.textContent).not.toContain("error");
      expect(button("Drafting…").disabled).toBe(true);
      await act(async () => current.resolve(response("Current custody draft")));
      expectNoStaleOutput();
      expect(container.textContent).toContain("Current custody draft");
      expect(button("Generate draft").disabled).toBe(false);
    }
  );

  it.each(["resolve", "reject"])(
    "ignores delayed old JSON that %ss after a newer draft arrives",
    async (outcome) => {
      const old = await startRequest();
      const body = deferred<ReturnType<typeof draft>>();
      const json = vi.fn(() => body.promise);
      await act(async () => old.resolve({ ok: true, json }));
      expect(json).toHaveBeenCalledOnce();
      expect(button("Drafting…").disabled).toBe(true);
      await click("Chain-of-custody event");
      const current = await startRequest();
      await act(async () => current.resolve(response("Current custody draft")));
      await act(async () => {
        if (outcome === "resolve") body.resolve(draft("Stale draft"));
        else body.reject(new Error("Old JSON failed"));
      });
      expectNoStaleOutput();
      expect(container.textContent).toContain("Current custody draft");
      expect(container.querySelectorAll("textarea")[1].value).toBe("Current custody draft record");
      expect(container.textContent).not.toContain("error");
      expect(button("Generate draft").disabled).toBe(false);
      expect(container.querySelector("aside")?.textContent).toContain("Total: 0");
      await click("Approve");
      const audit = container.querySelector("aside")!;
      expect(audit.textContent).toContain("Total: 1");
      expect(audit.textContent).toContain("Current custody draft");
      expect(audit.textContent).toContain("chain_of_custody · approved · template");
      expect(audit.textContent).not.toContain("field_sample");
      expectNoStaleOutput();
    }
  );

  it("does not revive a request when switching away and back to its workflow", async () => {
    const old = await startRequest();
    await click("Chain-of-custody event");
    await click("Field sample documentation");
    const current = await startRequest();
    await act(async () => old.resolve(response("Stale draft")));
    expectNoDraftOrAudit();
    expect(button("Drafting…").disabled).toBe(true);
    await act(async () => current.resolve(response("Current field draft")));
    expectNoStaleOutput();
    await click("Approve");
    expect(container.querySelector("aside")?.textContent).toContain("field_sample · approved · template");
    expect(container.querySelector("aside")?.textContent).toContain("Total: 1");
    expect(fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).workflow))
      .toEqual(["field_sample", "field_sample"]);
  });

  it("preserves a newer error when a stale success finishes", async () => {
    const old = await startRequest();
    await click("Chain-of-custody event");
    const current = await startRequest();
    await act(async () => current.resolve({ ok: false, status: 400 }));
    expect(container.textContent).toContain("API error: 400");
    await act(async () => old.resolve(response("Stale draft")));
    expectNoDraftOrAudit();
    expect(container.textContent).toContain("API error: 400");
    expect(button("Generate draft").disabled).toBe(false);
    await click("Instrument maintenance log");
    expect(container.textContent).not.toContain("API error");
  });
});
