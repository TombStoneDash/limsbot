// @vitest-environment jsdom
import { act, type ComponentProps } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimsBotPage from "../src/app/lims-bot/page";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

const workflows = [
  "Field sample documentation",
  "Chain-of-custody event",
  "Instrument maintenance log",
  "Reagent / lot check",
  "Asset scan explanation",
  "Pilot summary report",
];
const assets = [
  "Sciclone G3 NGSx Workstation",
  "Flipper Zero Field Scout",
  "Offline LIMS BOX Router",
  "Bench centrifuge",
  "Label printer",
];

let container: HTMLDivElement;
let root: Root;

function button(label: string) {
  const found = Array.from(container.querySelectorAll("button"))
    .find((node) => node.firstElementChild?.textContent === label);
  expect(found, `button: ${label}`).toBeDefined();
  return found!;
}

function expectSelection(labels: string[], selected: string) {
  const buttons = labels.map(button);
  expect(buttons.filter((node) => node.getAttribute("aria-pressed") === "true"))
    .toHaveLength(1);
  for (const label of labels) {
    expect(button(label).getAttribute("aria-pressed"), label)
      .toBe(String(label === selected));
  }
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
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

describe("accessible workflow and asset selection", () => {
  it("exposes exactly one pressed button per group initially", () => {
    expectSelection(workflows, workflows[0]);
    expectSelection(assets, assets[0]);
  });

  it("updates every workflow's pressed state while preserving the selected asset", async () => {
    await act(async () => button(assets[3]).click());
    for (const workflow of [...workflows.slice(1), workflows[0]]) {
      await act(async () => button(workflow).click());
      expectSelection(workflows, workflow);
      expectSelection(assets, assets[3]);
    }
  });

  it("updates every asset's pressed state while preserving the selected workflow", async () => {
    await act(async () => button(workflows[2]).click());
    for (const asset of [...assets.slice(1), assets[0]]) {
      await act(async () => button(asset).click());
      expectSelection(assets, asset);
      expectSelection(workflows, workflows[2]);
    }
  });
});
