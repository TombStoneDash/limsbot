import { describe, expect, it } from "vitest";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_HREF } from "../src/lib/contact";
import { readAllAppSource } from "./helpers/site-source";

const EXCLUDED_PAGES = new Set([
  "src/app/early-access/page.tsx",
  "src/app/early-adopter/page.tsx",
]);

const CONTACT_PAGES = [
  "src/app/blog/5-signs-your-lab-has-outgrown-spreadsheets/page.tsx",
  "src/app/page.tsx",
  "src/app/blog/crime-labs/page.tsx",
  "src/app/blog/environmental-labs/page.tsx",
  "src/app/blog/nvidia-connect-isv-registration/page.tsx",
  "src/app/blog/why-lab-ai-agents-need-domain-expertise/page.tsx",
  "src/app/blog/why-small-labs-dont-need-enterprise-lims/page.tsx",
];

describe("business phone contact links", () => {
  const sources = readAllAppSource().filter(
    ({ relFile }) => relFile.endsWith(".tsx") && !EXCLUDED_PAGES.has(relFile)
  );

  it("does not contain the personal phone number outside the excluded form pages", () => {
    expect(sources.length).toBeGreaterThan(5);
    const hits = sources
      .filter(({ content }) => content.includes("960-4273"))
      .map(({ relFile }) => relFile);
    expect(hits, `Personal phone number found in:\n${hits.join("\n")}`).toEqual([]);
  });

  for (const relFile of CONTACT_PAGES) {
    it(`${relFile} links the shared business phone`, () => {
      const source = sources.find((source) => source.relFile === relFile);
      expect(source, `Missing contact page: ${relFile}`).toBeDefined();
      expect(source!.content).toMatch(
        /import\s*\{\s*BUSINESS_PHONE_DISPLAY\s*,\s*BUSINESS_PHONE_HREF\s*\}\s*from\s*["']@\/lib\/contact["']/
      );
      expect(source!.content).toMatch(
        /<a\s+href=\{BUSINESS_PHONE_HREF\}[^>]*>\s*\{BUSINESS_PHONE_DISPLAY\}\s*<\/a>/
      );
    });
  }

  it("uses the business number with a matching US telephone href", () => {
    expect(BUSINESS_PHONE_DISPLAY).toBe("(858) 305-8744");
    expect(BUSINESS_PHONE_HREF).toMatch(/^tel:\+1\d{10}$/);
    expect(BUSINESS_PHONE_HREF).toBe(
      `tel:+1${BUSINESS_PHONE_DISPLAY.replace(/\D/g, "")}`
    );
  });
});
