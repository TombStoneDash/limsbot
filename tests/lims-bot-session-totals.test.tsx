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

async function expectSummary(approved: number, rejected: number) {
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
  let generated = 0;
  fetchMock = vi.fn().mockImplementation(async () => {
    const title = `Mock record ${++generated}`;
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

describe("session decision totals", () => {
  it("counts all mixed decisions while retaining only the latest fifty audit rows", async () => {
    for (let index = 0; index < 60; index++) {
      await click("Generate draft");
      if (index === 1 || index === 59) {
        const record = container.querySelectorAll("textarea")[1];
        await act(async () => {
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
            .set!.call(record, "Edited mock record");
          record.dispatchEvent(new Event("input", { bubbles: true }));
        });
      }
      await click(index % 3 === 0 ? "Reject" : "Approve");
      if (index === 1 || index === 59) {
        expect(auditLog().querySelector("li")?.textContent).toContain("edited-approved");
      }
    }

    const rows = auditLog().querySelectorAll("li");
    expect(rows).toHaveLength(50);
    expect(rows[0].textContent).toContain("Mock record 60");
    expect(rows[49].textContent).toContain("Mock record 11");
    expectTotals(40, 20);
    await expectSummary(40, 20);
    expect(auditLog().querySelectorAll("li")).toHaveLength(50);
  });

  it("does not count generated or replaced drafts without a decision", async () => {
    expectTotals(0, 0);
    await click("Generate draft");
    expectTotals(0, 0);
    await click("Generate draft");
    expectTotals(0, 0);
    await expectSummary(0, 0);
    expect(auditLog().querySelectorAll("li")).toHaveLength(0);
  });

  it("starts totals at zero when a new session mounts", async () => {
    await click("Generate draft");
    await click("Approve");
    await click("Generate draft");
    await click("Reject");
    expectTotals(1, 1);
    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<LimsBotPage />));
    expectTotals(0, 0);
    await expectSummary(0, 0);
    expect(auditLog().querySelectorAll("li")).toHaveLength(0);
  });
});
