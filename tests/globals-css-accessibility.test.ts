import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function contrastRatio(fgHex: string, bgHex: string): number {
  function luminance(hex: string): number {
    if (!/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) {
      throw new Error(`Invalid hex colour: ${hex}`);
    }
    const digits = hex.slice(1);
    const expanded = digits.length === 3
      ? [...digits].map((digit) => digit + digit).join("")
      : digits;
    const channels = [0, 2, 4].map((offset) => {
      const value = parseInt(expanded.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const fg = luminance(fgHex);
  const bg = luminance(bgHex);
  return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}

const css = readFileSync(path.resolve(__dirname, "../src/app/globals.css"), "utf-8");

// Count braces so media queries include all of their nested rules.
function block(source: string, selector: string): string {
  const start = source.indexOf(selector);
  if (start < 0) throw new Error(`Missing CSS selector: ${selector}`);
  const opening = source.indexOf("{", start + selector.length);
  let depth = 1;
  for (let index = opening + 1; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}" && --depth === 0) {
      return source.slice(opening + 1, index);
    }
  }
  throw new Error(`Unclosed CSS block: ${selector}`);
}

describe("global CSS accessibility", () => {
  it("validates the WCAG contrast calculation", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 8);
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 8);
    expect(contrastRatio("#1E3A5F", "#0a0f1a")).toBeLessThan(2);
  });

  it("keeps every gradient colour readable on the page background", () => {
    const root = block(css, ":root");
    const properties = new Map([...root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
      .map((match) => [match[1], match[2].trim()]));
    const background = properties.get("--color-bg-dark");
    expect(background).toMatch(/^#(?:[a-f\d]{6}|[a-f\d]{3})$/i);
    const gradient = block(css, ".gradient-text");
    const resolved = gradient.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
      const value = properties.get(name);
      if (!value) throw new Error(`Missing root property: ${name}`);
      return value;
    });
    const colours = new Set(resolved.match(/#(?:[a-f\d]{6}|[a-f\d]{3})\b/gi));
    expect(colours.size).toBeGreaterThanOrEqual(2);
    for (const colour of colours) {
      expect(contrastRatio(colour, background!), colour).toBeGreaterThanOrEqual(4.5);
    }
    expect(gradient).not.toMatch(/#1e3a5f/i);
    expect(gradient).toContain("var(--gradient-text-from)");
    expect(gradient).toContain("var(--gradient-text-to)");
    const fallback = gradient.search(/(?:^|;)\s*color\s*:/);
    expect(fallback).toBeGreaterThanOrEqual(0);
    expect(gradient.indexOf("-webkit-text-fill-color")).toBeGreaterThan(fallback);
  });

  it("provides readable text without clipping and in forced colours", () => {
    const unsupported = block(css, "@supports not ((background-clip: text) or (-webkit-background-clip: text))");
    for (const rule of [
      block(unsupported, ".gradient-text"),
      block(block(css, "@media (forced-colors: active)"), ".gradient-text"),
    ]) {
      expect(rule).toMatch(/background:\s*none\s*;/);
      expect(rule).toMatch(/-webkit-text-fill-color:\s*currentColor\s*;/);
    }
    expect(block(css, "@media (forced-colors: active)")).toMatch(/color:\s*CanvasText\s*;/);
  });

  it("respects reduced motion while leaving content visible", () => {
    const reduced = block(css, "@media (prefers-reduced-motion: reduce)");
    for (const name of ["animate-float", "animate-pulse-glow", "animate-fade-in-up"]) {
      expect(block(reduced, `.${name}`)).toMatch(/animation:\s*none\s*;/);
    }
    expect(reduced).toMatch(/\.animate-fade-in-up\s*\{\s*opacity:\s*1;\s*transform:\s*none;/);
    expect(block(reduced, ".card-hover:hover")).toMatch(/transform:\s*none\s*;/);
    expect(block(reduced, "html")).toMatch(/scroll-behavior:\s*auto\s*;/);
  });

  it("preserves the Tailwind import and existing class names", () => {
    expect(css.split("\n").find((line) => line.trim())).toBe('@import "tailwindcss";');
    for (const name of ["gradient-text", "animate-float", "animate-pulse-glow", "animate-fade-in-up", "card-hover"]) {
      expect(css).toMatch(new RegExp(`\\.${name}\\s*\\{`));
    }
  });
});
