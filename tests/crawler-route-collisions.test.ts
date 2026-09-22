import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { PUBLIC_DIR } from "./helpers/site-source";

describe("crawler route ownership", () => {
  it.each(["sitemap.xml", "robots.txt"])(
    "has no public/%s competing with the generated metadata route",
    (file) => {
      expect(existsSync(path.join(PUBLIC_DIR, file))).toBe(false);
    },
  );

  it("generates a canonical sitemap with a non-homepage route", () => {
    const urls = sitemap().map(({ url }) => new URL(url));
    expect(urls.some((url) => url.pathname !== "/")).toBe(true);
    for (const url of urls) {
      expect(url.origin).toBe("https://lims.bot");
    }
  });

  it("generates a robots policy that excludes API routes", () => {
    const { rules } = robots();
    const policies = Array.isArray(rules) ? rules : [rules];
    expect(policies).toContainEqual(
      expect.objectContaining({ userAgent: "*", disallow: "/api/" }),
    );
  });
});
