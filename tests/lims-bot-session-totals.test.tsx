// @vitest-environment jsdom
import { act, StrictMode, type ComponentProps } from "react";
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

function expectTotals(approved: number, rejected: number) {
  const totals = container.querySelector("aside")!.querySelectorAll("strong");
  expect(Array.from(totals, (node) => node.textContent)).toEqual([
    String(approved), String(rejected), String(approved + rejected),
  ]);
}

function visibleEvents() {
  return container.querySelectorAll("aside ul")[0].querySelectorAll("li");
}

async function mount() {
  root = createRoot(container);
  await act(async () => root.render(<StrictMode><LimsBotPage /></StrictMode>));
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn().mockImplementation(async () => {
    const title = `Session draft ${fetchMock.mock.calls.length}`;
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
  await mount();
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("session decision totals", () => {
  it("counts all mixed decisions while retaining only the latest 50 audit events", async () => {
    let approved = 0;
    let rejected = 0;
    expectTotals(0, 0);
    for (let index = 0; index < 55; index++) {
      await click("Generate draft");
      expectTotals(approved, rejected);
      if (index === 54) {
        const record = container.querySelectorAll("textarea")[1];
        await act(async () => {
          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
            .set!.call(record, "Edited session record");
          record.dispatchEvent(new Event("input", { bubbles: true }));
        });
        expectTotals(approved, rejected);
      }
      if (index % 10 === 0) {
        await click("Reject");
        rejected++;
      } else {
        await click("Approve");
        approved++;
      }
      expectTotals(approved, rejected);
    }

    const events = visibleEvents();
    expect(events).toHaveLength(50);
    expect(Array.from(events, (event) => event.querySelector(".font-medium")!.textContent))
      .toEqual(Array.from({ length: 50 }, (_, index) => `Session draft ${55 - index}`));
    expect(events[0].textContent).toContain("edited-approved");
    expectTotals(49, 6);

    await click("Generate draft");
    await click("Instrument maintenance log");
    expectTotals(49, 6);
    await click("Generate draft");
    await click("Bench centrifuge");
    expectTotals(49, 6);
    expect(visibleEvents()).toHaveLength(50);

    await click("Pilot summary report");
    await click("Generate draft");
    const [url, options] = fetchMock.mock.calls.at(-1)!;
    expect(url).toBe("/api/lims-bot");
    expect(JSON.parse(options.body)).toMatchObject({
      workflow: "pilot_summary",
      context: { approvedCount: 49, rejectedCount: 6 },
    });
    expectTotals(49, 6);
  });

  it("starts a fresh mount with zero counts in the sidebar and pilot summary", async () => {
    await click("Generate draft");
    await click("Approve");
    await click("Generate draft");
    await click("Reject");
    expectTotals(1, 1);

    await act(async () => root.unmount());
    await mount();
    expectTotals(0, 0);
    expect(container.querySelector("aside")!.textContent).toContain("No events yet.");
    await click("Pilot summary report");
    await click("Generate draft");
    expect(JSON.parse(fetchMock.mock.calls.at(-1)![1].body)).toMatchObject({
      workflow: "pilot_summary",
      context: { approvedCount: 0, rejectedCount: 0 },
    });
  });
});
