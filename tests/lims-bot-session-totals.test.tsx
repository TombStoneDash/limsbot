// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

async function click(label: string) {
  const button = Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.includes(label));
  expect(button, `button: ${label}`).toBeDefined();
  await act(async () => button!.click());
}

function auditLog() {
  return container.querySelector("aside > div")!;
}

function expectTotals(approved: number, rejected: number) {
  const totals = Array.from(auditLog().querySelectorAll("strong"))
    .map((node) => node.parentElement?.textContent);
  expect(totals).toEqual([
    `Approved: ${approved}`, `Rejected: ${rejected}`, `Total: ${approved + rejected}`,
  ]);
}

async function expectSummaryCounts(approved: number, rejected: number) {
  await click("Pilot summary report");
  await click("Generate draft");
  const [url, request] = fetchMock.mock.calls.at(-1)!;
  expect(url).toBe("/api/lims-bot");
  expect(request.method).toBe("POST");
  expect(JSON.parse(request.body)).toMatchObject({
    workflow: "pilot_summary",
    context: { approvedCount: approved, rejectedCount: rejected },
  });
  expectTotals(approved, rejected);
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  let draftNumber = 0;
  fetchMock = vi.fn().mockImplementation(async () => {
    const draftTitle = `Mock record ${++draftNumber}`;
    return {
      ok: true,
      json: async () => ({
        draftTitle,
        draftRecord: `${draftTitle}\nOperator review required.`,
        structuredFields: {},
        requiresHumanApproval: true,
        safetyNote: "Mock data only.",
        suggestedNextAction: "Review the draft.",
        mode: "template",
      }),
    };
  });
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

describe("demo session totals", () => {
  it("counts all 51 decisions, caps recent history at 50, and resets on remount", async () => {
    expectTotals(0, 0);
    for (let decision = 1; decision <= 51; decision++) {
      await click("Generate draft");
      expectTotals(Math.min(decision - 1, 50), 0);
      if (decision === 50) {
        const record = container.querySelectorAll("textarea")[1];
        await act(async () => {
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
            .set!.call(record, "Edited mock record");
          record.dispatchEvent(new Event("input", { bubbles: true }));
        });
        expectTotals(49, 0);
      }
      await click(decision === 51 ? "Reject" : "Approve");
      expectTotals(Math.min(decision, 50), decision === 51 ? 1 : 0);
    }

    const events = auditLog().querySelectorAll("li");
    expect(events).toHaveLength(50);
    expect(Array.from(events).map((event) => event.children[1].textContent))
      .toEqual(Array.from({ length: 50 }, (_, index) => `Mock record ${51 - index}`));
    expect(events[0].textContent).toContain("rejected");
    expect(events[1].textContent).toContain("edited-approved");
    await expectSummaryCounts(50, 1);
    expect(auditLog().querySelectorAll("li")).toHaveLength(50);

    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<LimsBotPage />));
    expectTotals(0, 0);
    expect(auditLog().querySelectorAll("li")).toHaveLength(0);
    await expectSummaryCounts(0, 0);
  });

  it("does not count discarded drafts or failed generation requests", async () => {
    await click("Generate draft");
    await click("Chain-of-custody event");
    expectTotals(0, 0);
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    await click("Generate draft");
    expect(container.textContent).toContain("API error: 503");
    expectTotals(0, 0);
    expect(auditLog().querySelectorAll("li")).toHaveLength(0);
    await expectSummaryCounts(0, 0);
  });
});
