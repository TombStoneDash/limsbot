// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EarlyAdopterPage from "../src/app/early-adopter/page";

const expectedLabels = {
  labName: "Lab Name *",
  labType: "Lab Type *",
  contactName: "Your Name *",
  email: "Email *",
  testVolume: "Estimated Monthly Test Volume *",
  painPoint: "Biggest Current Pain Point *",
};

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<EarlyAdopterPage />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("early adopter field labels", () => {
  it("associates each field with exactly one visible label in both directions", () => {
    const form = container.querySelector("form")!;
    const controls = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");
    expect(controls).toHaveLength(Object.keys(expectedLabels).length);
    expect(form.querySelectorAll("label")).toHaveLength(controls.length);

    for (const [name, text] of Object.entries(expectedLabels)) {
      const control = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      expect(control).not.toBeNull();
      expect(control.id).not.toBe("");
      expect(control.labels).toHaveLength(1);
      const label = control.labels![0];
      expect(label.textContent).toBe(text);
      expect(label.htmlFor).toBe(control.id);
      expect(label.control).toBe(control);
    }

    const ids = Array.from(container.querySelectorAll("[id]"), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
