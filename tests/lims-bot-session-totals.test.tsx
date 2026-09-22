// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
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
    .map((node) => node.parentElement!.textContent);
  expect(totals).toEqual([
    `Approved: ${approved}`,
    `Rejected: ${rejected}`,
    `Total: ${approved + rejected}`,
  ]);
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn().mockImplementation(async () => {
    const title = `Decision ${fetchMock.mock.calls.length}`;
    return {
      ok: true,
      json: async () => ({
        draftTitle: title,
        draftRecord: `${title}\nOperator review required.`,
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

it("retains session totals beyond 50 events and sends them in the pilot summary context", async () => {
  expectTotals(0, 0);
  for (let decision = 1; decision <= 51; decision += 1) {
    await click("Generate draft");
    if (decision > 1 && decision % 2 === 0) {
      const record = container.querySelectorAll("textarea")[1];
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
          .set!.call(record, `Edited decision ${decision}`);
        record.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }
    await click(decision === 1 ? "Reject" : "Approve");
    expectTotals(decision - 1, 1);
    expect(auditLog().querySelectorAll("li")).toHaveLength(Math.min(decision, 50));
    if (decision <= 50) {
      expect(auditLog().textContent).not.toContain("Showing only the latest 50 events.");
    }
  }

  const events = Array.from(auditLog().querySelectorAll("li"));
  expect(events).toHaveLength(50);
  expect(events[0].textContent).toContain("Decision 51");
  expect(events[49].textContent).toContain("Decision 2");
  expect(events.filter((node) => node.textContent?.includes("· edited-approved ·"))).toHaveLength(25);
  expect(events.filter((node) => node.textContent?.includes("· approved ·"))).toHaveLength(25);
  expect(events.some((node) => node.textContent?.includes("· rejected ·"))).toBe(false);
  expect(auditLog().textContent).toContain("Showing only the latest 50 events.");

  const previousAudit = auditLog().textContent;
  await click("Pilot summary report");
  expectTotals(50, 1);
  expect(auditLog().textContent).toBe(previousAudit);
  await click("Bench centrifuge");
  expectTotals(50, 1);
  expect(auditLog().textContent).toBe(previousAudit);
  await click("Generate draft");
  expect(fetchMock).toHaveBeenCalledTimes(52);
  const [url, request] = fetchMock.mock.calls[51];
  expect(url).toBe("/api/lims-bot");
  expect(request.method).toBe("POST");
  expect(JSON.parse(request.body)).toEqual({
    workflow: "pilot_summary",
    userMessage: "",
    context: {
      asset: "Bench centrifuge",
      assetType: "Sample prep",
      sample: "Field Collection 001",
      lot: "Buffer A · Lot LOT-2026-001 · Exp 2026-08-15",
      operator: "Demo operator",
      approvedCount: 50,
      rejectedCount: 1,
    },
  });
  expectTotals(50, 1);
  expect(auditLog().querySelectorAll("li")).toHaveLength(50);

  // A fresh mount, like a reload, starts a new in-memory session.
  await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(<LimsBotPage />));
  expectTotals(0, 0);
  expect(auditLog().querySelectorAll("li")).toHaveLength(0);
  expect(auditLog().textContent).not.toContain("Showing only the latest 50 events.");
});
