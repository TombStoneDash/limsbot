// @vitest-environment node
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { promises as fs } from "fs";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import FlipperDashboardPage from "../src/app/field-scout/flipper/page";
import type { DemoAsset } from "../src/lib/field-scout-latest";

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => <a {...props} />,
}));

vi.mock("@/lib/field-scout-latest", () => import("../src/lib/field-scout-latest"));

function asset(asset_id: string, captured_at: string): DemoAsset {
  return {
    asset_id,
    captured_at,
    asset_name: `Instrument ${asset_id}`,
    asset_type: "Instrument",
    tag_type: "NFC",
    tag_uid_redacted: "redacted",
    source: "demo",
    location: `Bench ${asset_id}`,
    owner: "Demo operator",
    authorization_scope: "demo",
    captured_by: "Demo scanner",
    notes: "Mock asset",
    lims_bot_summary: "Demo scan",
  };
}

afterEach(() => vi.restoreAllMocks());

describe("Field Scout scan provenance", () => {
  it("drafts from the newest scan without claiming calibration evidence", async () => {
    const assets = [
      asset("MIDDLE", "2026-05-03T19:02:00Z"),
      asset("NEWEST", "2026-05-03T12:04:00-07:00"),
      asset("OLDEST", "2026-05-03T19:00:00Z"),
    ];
    vi.spyOn(fs, "readFile").mockImplementation(async (file) => {
      switch (String(file)) {
        case path.join(process.cwd(), "public/data/field_scout_demo_assets.json"):
          return JSON.stringify({ assets, data_classification: "demo" });
        case path.join(process.cwd(), "public/data/authorized_discovery_demo.json"):
          return JSON.stringify({
            discovered_assets: [],
            explicitly_excluded_from_discovery: [],
            data_classification: "demo",
          });
        default:
          throw new Error(`Unexpected registry read: ${file}`);
      }
    });

    const html = renderToStaticMarkup(await FlipperDashboardPage());
    const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
    expect(article).toBeDefined();
    const draft = article!.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
    expect(draft).toBeDefined();
    expect(draft).toContain("Asset NEWEST (Instrument NEWEST) scanned at Bench NEWEST.");
    expect(draft).not.toMatch(/MIDDLE|OLDEST/);
    expect(draft).toContain("Scan captured at: Sun, 03 May 2026 19:04:00 GMT.");
    expect(draft).toContain("Calibration status is unknown: this registry does not provide calibration status; operator verification is required.");
    expect(draft).toContain("Suggested next workflow step: schedule operator verification, log scan event in maintenance ledger, attach to today&#x27;s run sheet.");
    expect(draft).toContain("Awaiting human approval before any record is written.");
    expect(html).not.toMatch(/last calibration check|calibration (?:check|completed|performed)(?: on file)?\s*:/i);
  });
});
