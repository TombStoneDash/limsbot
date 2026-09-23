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

function operatorNote() {
  const heading = Array.from(container.querySelectorAll("h2"))
    .find((node) => node.textContent === "3. Operator note (optional)");
  expect(heading).toBeDefined();
  expect(heading!.id).toBe("operator-note-heading");
  expect(container.querySelectorAll('[id="operator-note-heading"]')).toHaveLength(1);
  expect(heading!.closest('[hidden], [aria-hidden="true"]')).toBeNull();

  const fields = container.querySelectorAll<HTMLTextAreaElement>(
    'textarea[aria-labelledby="operator-note-heading"]',
  );
  expect(fields).toHaveLength(1);
  expect(document.getElementById(fields[0].getAttribute("aria-labelledby")!))
    .toBe(heading);
  expect(fields[0].required).toBe(false);
  return fields[0];
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

describe("operator note accessible label", () => {
  it("references the visible heading with its purpose and optional status", () => {
    expect(operatorNote().placeholder)
      .toBe("e.g., Routine field collection, conditions nominal.");
  });

  it("submits the entered note and keeps the resulting draft separately named", async () => {
    const draftRecord = "Mock collection record for human review.";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        draftTitle: "Collection draft",
        draftRecord,
        structuredFields: {},
        requiresHumanApproval: true,
        safetyNote: "Review before approval.",
        suggestedNextAction: "Check the collection details.",
        mode: "template",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const note = operatorNote();
    const enteredNote = "Collected at bay 2; awaiting operator review.";
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
        .set!.call(note, enteredNote);
      note.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(note.value).toBe(enteredNote);

    const generate = Array.from(container.querySelectorAll("button"))
      .find((node) => node.textContent === "Generate draft");
    expect(generate).toBeDefined();
    await act(async () => generate!.click());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/lims-bot", expect.objectContaining({
      method: "POST",
    }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).userMessage).toBe(enteredNote);
    expect(operatorNote()).toBe(note);
    expect(note.value).toBe(enteredNote);
    const drafts = container.querySelectorAll<HTMLTextAreaElement>(
      'textarea[aria-label="Draft record"]',
    );
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).not.toBe(note);
    expect(drafts[0].hasAttribute("aria-labelledby")).toBe(false);
    expect(drafts[0].value).toBe(draftRecord);
  });
});
