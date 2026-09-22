// @vitest-environment jsdom
import { act, StrictMode, type ComponentProps } from "react";
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

function expectTotals(approved: number, rejected: number) {
  const totals = container.querySelector("aside")!.querySelectorAll("strong");
  expect(Array.from(totals, (node) => node.textContent)).toEqual([
    String(approved), String(rejected), String(approved + rejected),
  ]);
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
  root = createRoot(container);
  await act(async () => root.render(<StrictMode><LimsBotPage /></StrictMode>));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("includes an evicted rejection and edited approval in session totals and the pilot summary", async () => {
  expectTotals(0, 0);
  await click("Generate draft");
  expectTotals(0, 0);
  await click("Reject");
  expectTotals(0, 1);

  for (let index = 0; index < 50; index++) {
    await click("Generate draft");
    expectTotals(index, 1);
    if (index === 49) {
      const record = container.querySelectorAll("textarea")[1];
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
          .set!.call(record, "Edited session record");
        record.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expectTotals(index, 1);
    }
    await click("Approve");
    expectTotals(index + 1, 1);
  }

  const history = container.querySelector("aside ul")!;
  const events = history.querySelectorAll("li");
  expect(events).toHaveLength(50);
  expect(Array.from(events, (event) => event.querySelector(".font-medium")!.textContent))
    .toEqual(Array.from({ length: 50 }, (_, index) => `Session draft ${51 - index}`));
  expect(events[0].textContent).toContain("edited-approved");
  expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("4");
  const historyText = history.textContent;

  fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
  await click("Generate draft");
  expect(container.textContent).toContain("API error: 503");
  expectTotals(50, 1);

  await click("Generate draft");
  expectTotals(50, 1);
  await click("Instrument maintenance log");
  expectTotals(50, 1);
  await click("Generate draft");
  await click("Bench centrifuge");
  expectTotals(50, 1);
  expect(container.querySelector("aside ul")!.textContent).toBe(historyText);
  expect(container.querySelector("aside ul")!.querySelectorAll("li")).toHaveLength(50);

  await click("Pilot summary report");
  await click("Generate draft");
  const [url, options] = fetchMock.mock.calls.at(-1)!;
  expect(url).toBe("/api/lims-bot");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toMatchObject({
    workflow: "pilot_summary",
    context: { approvedCount: 50, rejectedCount: 1 },
  });
  expectTotals(50, 1);
  expect(container.querySelector("aside ul")!.textContent).toBe(historyText);
});
