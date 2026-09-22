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
  const textarea = container.querySelectorAll("textarea")[1];
  expect(textarea).toBeDefined();
  return textarea;
}

async function edit(value: string) {
  await act(async () => {
    const textarea = record();
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function auditEvents() {
  return container.querySelector("aside > div")!.querySelectorAll("li");
}

async function invokeApprovalHandler() {
  // Bypass React's disabled-button event suppression to exercise the handler guard.
  const approve = button("Approve");
  const propsKey = Object.keys(approve).find((key) => key.startsWith("__reactProps$"));
  expect(propsKey).toBeDefined();
  const props = (approve as unknown as Record<string, { onClick: () => void }>)[propsKey!];
  await act(async () => props.onClick());
}

function expectPendingBlank(value: string) {
  expect(record().value).toBe(value);
  expect(container.textContent).toContain("4. Draft preview");
  expect(auditEvents()).toHaveLength(0);
  expect(button("Approve").disabled).toBe(true);
  expect(button("Reset edits").disabled).toBe(false);
  expect(button("Reject").disabled).toBe(false);
  const explanation = container.querySelector("#blank-draft-explanation");
  expect(explanation?.getAttribute("role")).toBe("status");
  expect(explanation?.textContent).toBe("Enter record text or reset edits to enable approval.");
  expect(record().getAttribute("aria-describedby")).toBe(explanation?.id);
  expect(button("Approve").getAttribute("aria-describedby")).toBe(explanation?.id);
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
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

describe("blank draft approval", () => {
  it.each(["", "   ", "\t", "\n", " \t\n  "])("blocks approval after editing to %j and allows reset", async (blank) => {
    await click("Generate draft");
    expect(button("Approve").disabled).toBe(false);
    await edit(blank);
    expectPendingBlank(blank);
    await click("Approve");
    expectPendingBlank(blank);
    await invokeApprovalHandler();
    expectPendingBlank(blank);

    await click("Reset edits");
    expect(record().value).toBe(draft.draftRecord);
    expect(button("Approve").disabled).toBe(false);
    expect(container.querySelector("#blank-draft-explanation")?.textContent).toBe("");
    expect(record().hasAttribute("aria-describedby")).toBe(false);
    await click("Approve");
    expect(auditEvents()).toHaveLength(1);
    expect(auditEvents()[0].textContent).toContain("field_sample · approved · template");
    expect(container.textContent).not.toContain("4. Draft preview");
  });

  it("also guards approved decisions for an unchanged blank generated record", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ...draft, draftRecord: " \t\n" }) });
    await click("Generate draft");
    expectPendingBlank(" \t\n");
    await invokeApprovalHandler();
    expectPendingBlank(" \t\n");
  });

  it("enables edited approval without changing nonblank edit text", async () => {
    await click("Generate draft");
    await edit("");
    const revised = "  Revised mock record.\t\nKeep these spaces.  \n";
    await edit(revised);
    expect(record().value).toBe(revised);
    expect(button("Approve").disabled).toBe(false);
    expect(container.querySelector("#blank-draft-explanation")?.textContent).toBe("");
    await click("Approve");
    expect(auditEvents()).toHaveLength(1);
    expect(auditEvents()[0].textContent).toContain("field_sample · edited-approved · template");
    expect(container.textContent).not.toContain("4. Draft preview");
  });

  it.each(["", " \t\n"])("allows rejection of a blank record %j", async (blank) => {
    await click("Generate draft");
    await edit(blank);
    expectPendingBlank(blank);
    await click("Reject");
    expect(auditEvents()).toHaveLength(1);
    expect(auditEvents()[0].textContent).toContain("field_sample · rejected · template");
    expect(container.textContent).not.toContain("4. Draft preview");
  });
});
