// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAccessPage from "../src/app/early-access/page";

const fields = [
  ["labName", "Lab Name *"],
  ["labSize", "Lab Size *"],
  ["currentLims", "Current LIMS *"],
  ["instruments", "Primary Instruments"],
  ["painPoint", "Biggest Pain Point *"],
  ["name", "Your Name *"],
  ["email", "Email *"],
  ["phone", "Phone (optional)"],
] as const;

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<EarlyAccessPage />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("early access field labels", () => {
  it.each(fields)("associates %s with its visible label", (name, text) => {
    const control = container.querySelector<Field>(`[name="${name}"]`)!;
    expect(control).not.toBeNull();
    const label = Array.from(container.querySelectorAll("label")).find(
      (candidate) => candidate.textContent === text,
    )!;
    expect(label).toBeDefined();
    expect(control.id).not.toBe("");
    expect(label.htmlFor).toBe(control.id);
    expect(Array.from(control.labels ?? [])).toContain(label);
    expect(label.control).toBe(control);
  });

  it("gives all eight controls unique ids, including selects and textarea", () => {
    const controls = Array.from(container.querySelectorAll<Field>("input, select, textarea"));
    expect(controls).toHaveLength(8);
    expect(container.querySelectorAll("select")).toHaveLength(2);
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    const ids = controls.map((control) => control.id);
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(controls.length);
    for (const id of ids) {
      expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
    }
  });

  it("renders without making requests", () => {
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
