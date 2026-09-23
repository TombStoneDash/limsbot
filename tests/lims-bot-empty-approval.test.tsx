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

function button(label: string) {
  const match = Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.trim() === label);
  expect(match, `button: ${label}`).toBeDefined();
  return match!;
}

async function click(label: string) {
  await act(async () => button(label).click());
}

function record() {
  return container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Draft record"]')!;
}

async function edit(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(record(), value);
    record().dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function expectTotals(approved: number, rejected: number) {
  expect(Array.from(container.querySelectorAll("aside strong"), (node) => node.textContent))
    .toEqual([String(approved), String(rejected), String(approved + rejected)]);
}

function expectPending() {
  expectTotals(0, 0);
  expect(container.querySelector("aside")!.textContent).toContain("No events yet.");
  expect(container.querySelector('[role="progressbar"]')!.getAttribute("aria-valuenow")).toBe("2");
  expect(container.textContent).not.toContain("Demo journey complete.");
  expect(record()).not.toBeNull();
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => draft }));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<LimsBotPage />));
  await click("Generate draft");
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("blank draft approval", () => {
  it.each(["", " \t\n  "])("blocks approval of %j without changing totals or onboarding", async (value) => {
    await edit(value);
    expect(button("Approve").disabled).toBe(true);
    expect(button("Reject").disabled).toBe(false);
    expect(button("Reset edits").disabled).toBe(false);
    expect(record().getAttribute("aria-invalid")).toBe("true");
    const explanation = document.getElementById(record().getAttribute("aria-describedby")!);
    expect(explanation?.getAttribute("role")).toBe("status");
    expect(explanation?.textContent).toContain("Enter non-whitespace text before approving");
    await click("Approve");
    expectPending();

    // Invoke the current React handler directly to verify the guard independently
    // of the browser/React suppression of clicks on disabled buttons.
    const approve = button("Approve");
    const propsKey = Object.keys(approve).find((key) => key.startsWith("__reactProps$"))!;
    const props = (approve as unknown as Record<string, { onClick: () => void }>)[propsKey];
    await act(async () => props.onClick());
    expectPending();
  });

  it("recovers with Reset edits and records a normal approval", async () => {
    await edit("");
    await click("Reset edits");
    expect(record().value).toBe(draft.draftRecord);
    expect(record().getAttribute("aria-invalid")).toBe("false");
    expect(record().hasAttribute("aria-describedby")).toBe(false);
    expect(container.querySelector("#draft-record-error")!.textContent).toBe("");
    expect(button("Approve").disabled).toBe(false);
    await click("Approve");
    expectTotals(1, 0);
    expect(container.querySelector("aside")!.textContent).toContain("approved");
    expect(container.querySelector("aside")!.textContent).not.toContain("edited-approved");
    expect(container.querySelector('[role="progressbar"]')!.getAttribute("aria-valuenow")).toBe("4");
  });

  it("allows restored non-whitespace text and records edited approval once", async () => {
    await edit(" \n\t");
    await click("Approve");
    expectPending();
    await edit("  Reviewed mock record.\n");
    expect(button("Approve").disabled).toBe(false);
    expect(record().getAttribute("aria-invalid")).toBe("false");
    expect(container.querySelector("#draft-record-error")!.textContent).toBe("");
    await click("Approve");
    expectTotals(1, 0);
    expect(container.querySelector("aside")!.textContent).toContain("edited-approved");
    expect(container.querySelector('[role="progressbar"]')!.getAttribute("aria-valuenow")).toBe("4");
    expect(record()).toBeNull();
  });

  it.each(["", " \n\t"])("keeps rejection usable for a blank draft (%j)", async (value) => {
    await edit(value);
    await click("Reject");
    expectTotals(0, 1);
    expect(container.querySelector("aside")!.textContent).toContain("rejected");
    expect(container.querySelector('[role="progressbar"]')!.getAttribute("aria-valuenow")).toBe("4");
    expect(record()).toBeNull();
  });
});
