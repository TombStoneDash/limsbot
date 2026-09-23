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

function note() {
  return container.querySelector<HTMLTextAreaElement>("#operator-note")!;
}

function generate() {
  return Array.from(container.querySelectorAll("button"))
    .find((node) => node.textContent?.trim() === "Generate draft")!;
}

async function edit(textarea: HTMLTextAreaElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function expectValidity(length: number) {
  const invalid = length > 1000;
  expect(note().getAttribute("aria-invalid")).toBe(String(invalid));
  expect(generate().disabled).toBe(invalid);
  const descriptions = note().getAttribute("aria-describedby")!.split(" ")
    .map((id) => document.getElementById(id)!);
  expect(descriptions.every(Boolean)).toBe(true);
  expect(descriptions[0].textContent).toBe(`${length.toLocaleString("en-US")} / 1,000 characters`);
  if (invalid) {
    expect(descriptions[1].getAttribute("role")).toBe("status");
    expect(descriptions[1].textContent).toContain("exceeds the 1,000-character limit");
    expect(descriptions[1].textContent).toContain("Shorten it before generating a draft");
  } else {
    expect(container.querySelector("#operator-note-error")!.textContent).toBe("");
  }
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

describe("operator note length", () => {
  it.each([0, 1000])("allows a %i-character note unchanged", async (length) => {
    const value = "a".repeat(length);
    await edit(note(), value);
    expect(note().labels?.[0].textContent).toContain("Operator note (optional)");
    expectValidity(length);
    await act(async () => generate().click());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).userMessage).toBe(value);
    expect(note().value).toBe(value);
  });

  it.each(["a".repeat(1001), "a".repeat(1000) + "Seal broken."])
    ("preserves oversized input and blocks requests (%#)", async (value) => {
      // A native input event with the entire value models an oversized paste.
      await edit(note(), value);
      expect(note().value).toBe(value);
      expect(note().hasAttribute("maxlength")).toBe(false);
      expectValidity(value.length);
      await act(async () => generate().click());
      expect(fetchMock).not.toHaveBeenCalled();

      // Exercise the handler independently of disabled-button click suppression.
      const button = generate();
      const propsKey = Object.keys(button).find((key) => key.startsWith("__reactProps$"))!;
      const props = (button as unknown as Record<string, { onClick: () => Promise<void> }>)[propsKey];
      await act(async () => props.onClick());
      expect(fetchMock).not.toHaveBeenCalled();
      expect(note().value).toBe(value);
    });

  it("preserves an existing edited draft and recovers when the note is shortened", async () => {
    await act(async () => generate().click());
    const record = container.querySelector<HTMLTextAreaElement>('textarea[aria-label="Draft record"]')!;
    const edited = "Reviewed record. ".repeat(100);
    await edit(record, edited);
    await edit(note(), "a".repeat(1001));
    expectValidity(1001);
    fetchMock.mockClear();
    const button = generate();
    const propsKey = Object.keys(button).find((key) => key.startsWith("__reactProps$"))!;
    const props = (button as unknown as Record<string, { onClick: () => Promise<void> }>)[propsKey];
    await act(async () => props.onClick());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(record.isConnected).toBe(true);
    expect(record.value).toBe(edited);

    await edit(note(), "Seal broken.");
    expectValidity(12);
    await act(async () => generate().click());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).userMessage).toBe("Seal broken.");
  });

  it("counts UTF-16 code units consistently with the API", async () => {
    await edit(note(), "😀".repeat(500));
    expectValidity(1000);
    await edit(note(), "😀".repeat(500) + "a");
    expectValidity(1001);
    expect(note().value).toBe("😀".repeat(500) + "a");
    await act(async () => generate().click());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
