import { describe, expect, it } from "vitest";
import { extractHrefs, listAnchorIds, listPublicFiles, listRoutes } from "./helpers/site-source";

const VALID_CONTACT_EMAIL = "info@lims.bot";
const SITE_ORIGIN = "https://lims.bot";

// Third-party references the site deliberately links out to (real projects/videos
// cited by name in the copy) — not arbitrary external destinations.
const EXTERNAL_ALLOWLIST_PREFIXES = ["https://www.senaite.com", "https://www.youtube.com/"];

/** Anchored origin check — plain `startsWith(SITE_ORIGIN)` would also accept a
 * lookalike host like "https://lims.bot.evil.com", since that string literally
 * starts with "https://lims.bot" too. */
function isSameOrigin(href: string): boolean {
  return href === SITE_ORIGIN || href.startsWith(`${SITE_ORIGIN}/`);
}

/** Same-page anchor, either bare ("#pricing") or path-qualified ("/#pricing") —
 * the latter is how other routes link back to a homepage section. */
function isValidAnchor(href: string, routes: Set<string>, anchorIds: Set<string>): boolean {
  const match = href.match(/^(\/[\w/-]*)?#([\w-]+)$/);
  if (!match) return false;
  const [, routePart, anchor] = match;
  const route = routePart || "/";
  return routes.has(route) && anchorIds.has(anchor);
}

describe("CTA and navigation link destinations", () => {
  const hrefs = extractHrefs();
  const routes = new Set(listRoutes());
  const publicFiles = new Set(listPublicFiles());
  const anchorIds = listAnchorIds();

  it("found CTAs to check", () => {
    expect(hrefs.length).toBeGreaterThan(5);
  });

  it("every href resolves to a real route, in-page anchor, public asset, or mailto link", () => {
    const broken: string[] = [];

    for (const { href, relFile } of hrefs) {
      const ok =
        routes.has(href) ||
        publicFiles.has(href) ||
        isValidAnchor(href, routes, anchorIds) ||
        isSameOrigin(href) ||
        EXTERNAL_ALLOWLIST_PREFIXES.some((prefix) => href.startsWith(prefix)) ||
        (href.startsWith("mailto:") && href.slice("mailto:".length).split("?")[0] === VALID_CONTACT_EMAIL);

      if (!ok) broken.push(`${relFile}: href="${href}"`);
    }

    expect(broken, `Broken/unexpected CTA destinations:\n${broken.join("\n")}`).toEqual([]);
  });

  it("no CTA points at a route that doesn't exist yet (e.g. removed /pricing, /lims-bot, /demo-loop pages)", () => {
    const dead = hrefs.filter(
      ({ href }) =>
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !routes.has(href) &&
        !publicFiles.has(href) &&
        !isValidAnchor(href, routes, anchorIds)
    );
    expect(dead.map((d) => `${d.relFile}: href="${d.href}"`)).toEqual([]);
  });

  it("mailto CTAs only ever target the real published contact address", () => {
    const badMailto = hrefs.filter(
      ({ href }) => href.startsWith("mailto:") && href.slice("mailto:".length).split("?")[0] !== VALID_CONTACT_EMAIL
    );
    expect(badMailto.map((d) => `${d.relFile}: href="${d.href}"`)).toEqual([]);
  });
});
