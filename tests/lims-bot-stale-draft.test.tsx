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
    draftRecord: `${title} record`,
    structuredFields: {},
    requiresHumanApproval: true,
    safetyNote: "Human review required.",
    suggestedNextAction: "Review the draft.",
    mode: "template",
  };
}

function response(title: string) {
  return { ok: true, json: async () => draft(title) };
}

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

function expectNoDraft() {
  expect(container.textContent).not.toContain("4. Draft preview");
  expect(container.querySelectorAll("textarea")).toHaveLength(1);
  expect(Array.from(container.querySelectorAll("button"))
    .some((node) => node.textContent === "Approve" || node.textContent === "Reject")).toBe(false);
}

function expectNoAudit() {
  expect(container.querySelector("aside")?.textContent).toContain("No events yet.");
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

describe("workflow switches during draft generation", () => {
  it("ignores a late success and immediately enables generation for the new workflow", async () => {
    const old = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(old.promise);
    await click("Generate draft");
    expect(button("Drafting…").disabled).toBe(true);
    await click("Chain-of-custody event");
    expect(button("Generate draft").disabled).toBe(false);
    await act(async () => old.resolve(response("Stale field sample")));
    expectNoDraft();
    expectNoAudit();
    expect(container.textContent).not.toContain("Stale field sample");
  });

  it.each(["http", "network", "success"])("ignores old %s and loading updates while a new request is pending", async (outcome) => {
    const old = deferred<unknown>();
    const current = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    await click("Generate draft");
    await click("Chain-of-custody event");
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).workflow).toBe("chain_of_custody");
    await act(async () => {
      if (outcome === "network") old.reject(new Error("Offline"));
      else old.resolve(outcome === "http" ? { ok: false, status: 500 } : response("Stale field sample"));
    });
    expectNoDraft();
    expectNoAudit();
    expect(container.textContent).not.toContain("error");
    expect(button("Drafting…").disabled).toBe(true);
    await act(async () => current.resolve(response("Current custody")));
    expect(container.querySelectorAll("textarea")[1].value).toBe("Current custody record");
    expectNoAudit();
    await click("Approve");
    const audit = container.querySelector("aside")!.textContent;
    expect(audit).toContain("Current custody");
    expect(audit).toContain("chain_of_custody · approved");
    expect(audit).not.toContain("Stale field sample");
  });

  it("does not revive the original request after switching away and back", async () => {
    const old = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(old.promise);
    await click("Generate draft");
    await click("Chain-of-custody event");
    await click("Field sample documentation");
    await act(async () => old.resolve(response("Original field sample")));
    expectNoDraft();
    expectNoAudit();
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(["fetch", "json"])("preserves a newer draft when the old %s settles afterwards", async (stage) => {
    const oldFetch = deferred<ReturnType<typeof response>>();
    const oldJson = deferred<ReturnType<typeof draft>>();
    fetchMock.mockReturnValueOnce(stage === "fetch"
      ? oldFetch.promise
      : Promise.resolve({ ok: true, json: () => oldJson.promise }));
    fetchMock.mockResolvedValueOnce(response("New custody"));
    await click("Generate draft");
    await click("Chain-of-custody event");
    await click("Generate draft");
    await act(async () => {
      if (stage === "fetch") oldFetch.resolve(response("Old field sample"));
      else oldJson.resolve(draft("Old field sample"));
    });
    expect(container.textContent).toContain("New custody");
    expect(container.textContent).not.toContain("Old field sample");
    expect(container.querySelectorAll("textarea")[1].value).toBe("New custody record");
    expectNoAudit();
    await click("Reject");
    const audit = container.querySelector("aside")!.textContent;
    expect(audit).toContain("New custody");
    expect(audit).toContain("chain_of_custody · rejected");
    expect(audit).not.toContain("Old field sample");
    expectNoDraft();
  });

  it("clears an existing error when changing workflow", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    await click("Generate draft");
    expect(container.textContent).toContain("Network error generating draft.");
    await click("Chain-of-custody event");
    expect(container.textContent).not.toContain("Network error generating draft.");
    expect(button("Generate draft").disabled).toBe(false);
    expectNoAudit();
  });
});
