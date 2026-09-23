// @vitest-environment node
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { promises as fs } from "fs";
import path from "path";
import { expect, it, vi } from "vitest";
import FlipperDashboardPage from "../src/app/field-scout/flipper/page";
import type { DemoAsset } from "../src/lib/field-scout-latest";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));
vi.mock("fs", () => ({ promises: { readFile: vi.fn() } }));
vi.mock("@/lib/field-scout-latest", () => import("../src/lib/field-scout-latest"));

it("identifies the scan capture time without claiming calibration history", async () => {
  const asset: DemoAsset = {
    asset_id: "SCAN-042",
    asset_name: "Demo centrifuge",
    asset_type: "Instrument",
    tag_type: "NFC",
    tag_uid_redacted: "redacted",
    source: "demo",
    location: "Bench 7",
    owner: "Demo operator",
    authorization_scope: "demo",
    captured_by: "Demo scanner",
    captured_at: "2026-05-03T19:04:00Z",
    notes: "Mock asset",
    lims_bot_summary: "Demo scan",
  };
  vi.mocked(fs.readFile).mockImplementation(async (file) => {
    switch (path.basename(String(file))) {
      case "field_scout_demo_assets.json":
        return JSON.stringify({ assets: [asset], data_classification: "demo" });
      case "authorized_discovery_demo.json":
        return JSON.stringify({
          discovered_assets: [],
          explicitly_excluded_from_discovery: [],
        });
      default:
        throw new Error(`Unexpected file read: ${file}`);
    }
  });
  try {
    const page = await FlipperDashboardPage();
    const html = renderToStaticMarkup(page);
    const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
    const draft = article?.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1]
      .replace(/&#x27;/g, "'");
    expect(draft).toContain("Asset SCAN-042 (Demo centrifuge) scanned at Bench 7.");
    expect(draft).toContain(
      `Scan capture time: ${new Date(asset.captured_at).toLocaleString()}.`
    );
    expect(draft).toContain(
      "Calibration status is not provided and requires operator verification."
    );
    expect(draft).not.toMatch(/last calibration|calibration check|calibrated/i);
    expect(draft).toContain(
      "Suggested next workflow step: schedule operator verification, log scan event in maintenance ledger, attach to today's run sheet."
    );
    expect(draft).toContain("Awaiting human approval before any record is written.");
  } finally {
    vi.resetAllMocks();
  }
});
