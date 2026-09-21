import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { posts, sortNewestFirst } from "../src/lib/blog-index";
import { APP_DIR } from "./helpers/site-source";

describe("blog index", () => {
  it("sorts newest first and preserves source order for equal dates", () => {
    expect(sortNewestFirst(posts).map((post) => post.slug)).toEqual([
      "environmental-labs",
      "crime-labs",
      "5-signs-your-lab-has-outgrown-spreadsheets",
      "why-small-labs-dont-need-enterprise-lims",
      "why-lab-ai-agents-need-domain-expertise",
      "nvidia-connect-isv-registration",
    ]);
  });

  it("returns a new array without mutating the input", () => {
    const input = Object.freeze(posts.map((post) => Object.freeze({ ...post })));
    const before = [...input];
    expect(sortNewestFirst(input)).not.toBe(input);
    expect(input).toEqual(before);
    expect(sortNewestFirst([])).toEqual([]);
  });

  it("uses real ISO dates with the shown day or the first of the month", () => {
    const expectedDates = [
      ["April 12, 2026", "2026-04-12"],
      ["April 12, 2026", "2026-04-12"],
      ["April 2026", "2026-04-01"],
      ["June 2026", "2026-06-01"],
      ["June 2026", "2026-06-01"],
      ["March 17, 2026", "2026-03-17"],
    ];
    expect(posts.map(({ date, published }) => [date, published])).toEqual(expectedDates);
    for (const post of posts) {
      expect(post.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const parsed = new Date(`${post.published}T00:00:00.000Z`);
      expect(Number.isNaN(parsed.getTime())).toBe(false);
      expect(parsed.toISOString().slice(0, 10)).toBe(post.published);
    }
  });

  it("links each slug to an existing blog page", () => {
    for (const post of posts) {
      expect(post.href).toBe(`/blog/${post.slug}`);
      expect(existsSync(path.join(APP_DIR, "blog", post.slug, "page.tsx"))).toBe(true);
    }
  });

  it("renders sorted posts with semantic dates and the canonical URL", () => {
    const source = readFileSync(path.join(APP_DIR, "blog", "page.tsx"), "utf-8");
    expect(source).toContain("sortNewestFirst(posts).map");
    expect(source).toMatch(/<time\b[^>]*dateTime=\{post\.published\}/);
    expect(source).toMatch(/alternates:\s*\{\s*canonical:\s*"https:\/\/lims\.bot\/blog"/);
  });
});
