import { describe, expect, it } from "vitest";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { listRoutes } from "./helpers/site-source";

// The demo loop is intentionally excluded from search discovery.
// No current page declares robots noindex; add any such pages here explicitly.
const excludedRoutes = ["/demo-loop"];

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map(({ url }) => url);
  const routes = urls.map((url) => new URL(url).pathname);
  const pageRoutes = listRoutes();

  it("uses the canonical HTTPS origin for every URL", () => {
    for (const url of urls) {
      expect(url.startsWith("https://lims.bot")).toBe(true);
      expect(new URL(url).origin).toBe("https://lims.bot");
    }
  });

  it("contains no duplicate URLs and stays alphabetised", () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(routes).toEqual([...routes].sort());
  });

  it("only includes existing page routes", () => {
    for (const route of routes) expect(pageRoutes).toContain(route);
  });

  it("covers every page except the documented exclusions", () => {
    for (const route of excludedRoutes) {
      expect(pageRoutes).toContain(route);
      expect(routes).not.toContain(route);
    }
    expect([...routes].sort()).toEqual(
      pageRoutes.filter((route) => !excludedRoutes.includes(route)).sort(),
    );
  });

  it("uses monthly updates and the requested priorities", () => {
    for (const entry of entries) {
      const route = new URL(entry.url).pathname;
      expect(entry.changeFrequency).toBe("monthly");
      expect(entry.priority).toBe(
        route === "/" ? 1.0 : route.split("/").length === 2 ? 0.8 : 0.6,
      );
    }
  });
});

describe("robots", () => {
  it("allows crawling, disallows API routes, and advertises the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://lims.bot/sitemap.xml",
    });
  });
});
