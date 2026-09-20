import type { MetadataRoute } from "next";

// Keep alphabetised. Route coverage is checked in tests/sitemap.test.ts.
// /demo-loop is intentionally excluded from search discovery.
const routes = [
  "/",
  "/ai-pathology",
  "/ai-pathology/field-data",
  "/ai-pathology/human-in-the-loop",
  "/ai-pathology/lab-data-readiness",
  "/ai-pathology/pathology-operations",
  "/ai-pathology/pdi-and-benchmarking",
  "/blog",
  "/blog/5-signs-your-lab-has-outgrown-spreadsheets",
  "/blog/crime-labs",
  "/blog/environmental-labs",
  "/blog/nvidia-connect-isv-registration",
  "/blog/why-lab-ai-agents-need-domain-expertise",
  "/blog/why-small-labs-dont-need-enterprise-lims",
  "/early-access",
  "/early-adopter",
  "/field-scout",
  "/field-scout/flipper",
  "/lab-operations-logs",
  "/lab-operations-logs/audit-trail",
  "/lab-operations-logs/instrument-registry",
  "/lab-operations-logs/maintenance-qc",
  "/lab-operations-logs/offline-field-mode",
  "/lab-operations-logs/reagents-lots",
  "/lab-operations-logs/reports-signoff",
  "/lims-bot",
  "/partners",
  "/roadmap/compliance",
  "/roadmap/instrument-interfaces",
  "/roadmap/regulatory",
  "/roadmap/senaite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://lims.bot${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1.0 : route.slice(1).includes("/") ? 0.6 : 0.8,
  }));
}
