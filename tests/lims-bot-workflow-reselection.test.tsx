// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

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

function record() {
  return container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Draft record"]');
}

async function editRecord(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(record()!, value);
    record()!.dispatchEvent(new Event("input", { bubbles: true }));
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
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("workflow reselection", () => {
  it("preserves edited text, scan state and completed audit totals", async () => {
    fetchMock.mockResolvedValueOnce(response("Approved sample"));
    await click("Generate draft");
    await click("Approve");
    fetchMock.mockResolvedValueOnce(response("Rejected sample"));
    await click("Generate draft");
    await click("Reject");
    const audit = container.querySelector("aside")!.textContent;
    expect(audit).toContain("Approved: 1");
    expect(audit).toContain("Rejected: 1");
    expect(audit).toContain("Total: 2");

    await click("Mock scan");
    fetchMock.mockResolvedValueOnce(response("Current field sample"));
    await click("Generate draft");
    await editRecord("Keep my field sample edits");
    await click("Field sample documentation");

    expect(container.textContent).toContain("Current field sample");
    expect(record()?.value).toBe("Keep my field sample edits");
    expect(container.textContent).toContain("✓ Scanned");
    expect(container.querySelector("aside")!.textContent).toBe(audit);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    await click("Approve");
    expect(container.querySelector("aside")!.textContent).toContain("field_sample · edited-approved · template");
    expect(container.querySelector("aside")!.textContent).toContain("Approved: 2");
    expect(container.querySelector("aside")!.textContent).toContain("Total: 3");
  });

  it("preserves pending generation and accepts its eventual result", async () => {
    let resolve!: (value: ReturnType<typeof response>) => void;
    fetchMock.mockReturnValueOnce(new Promise<ReturnType<typeof response>>((done) => { resolve = done; }));
    await click("Mock scan");
    await click("Generate draft");
    await click("Field sample documentation");

    expect(button("Drafting…").disabled).toBe(true);
    expect(record()).toBeNull();
    expect(container.textContent).toContain("✓ Scanned");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => resolve(response("Pending field sample")));
    expect(record()?.value).toBe(draft("Pending field sample").draftRecord);
    expect(button("Generate draft").disabled).toBe(false);
  });

  it.each(["http", "network"] as const)("preserves a displayed %s error on reselection", async (outcome) => {
    if (outcome === "http") fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    else fetchMock.mockRejectedValueOnce(new Error("Offline"));
    const error = outcome === "http" ? "API error: 503" : "Network error generating draft.";
    await click("Mock scan");
    await click("Generate draft");
    expect(container.textContent).toContain(error);
    await click("Field sample documentation");
    expect(container.textContent).toContain(error);
    expect(container.textContent).toContain("✓ Scanned");
    expect(button("Generate draft").disabled).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await click("Chain-of-custody event");
    expect(container.textContent).not.toContain(error);
  });

  it("clears obsolete drafts and edits on real changes, including a round trip", async () => {
    fetchMock.mockResolvedValueOnce(response("Obsolete field sample"));
    await click("Generate draft");
    await editRecord("Obsolete field sample edits");
    await click("Chain-of-custody event");
    expect(record()).toBeNull();
    expect(container.textContent).not.toContain("Obsolete field sample");
    await click("Field sample documentation");
    expect(record()).toBeNull();
    expect(button("Generate draft").disabled).toBe(false);
    fetchMock.mockResolvedValueOnce(response("Fresh field sample"));
    await click("Generate draft");
    expect(record()?.value).toBe(draft("Fresh field sample").draftRecord);
    expect(container.textContent).not.toContain("Obsolete field sample");
  });
});
