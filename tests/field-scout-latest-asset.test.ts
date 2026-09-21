// @vitest-environment node
import { describe, expect, it } from "vitest";
import { pickLatestAsset, type DemoAsset } from "../src/lib/field-scout-latest";

function asset(asset_id: string, captured_at: string): DemoAsset {
  return {
    asset_id,
    captured_at,
    asset_name: "Demo asset",
    asset_type: "Instrument",
    tag_type: "NFC",
    tag_uid_redacted: "redacted",
    source: "demo",
    location: "Demo lab",
    owner: "Demo operator",
    authorization_scope: "demo",
    captured_by: "Demo scanner",
    notes: "Mock asset",
    lims_bot_summary: "Demo scan",
  };
}

describe("pickLatestAsset", () => {
  const oldest = asset("001", "2026-05-03T12:00:00-07:00");
  const middle = asset("003", "2026-05-03T12:02:00-07:00");
  const latest = asset("005", "2026-05-03T12:04:00-07:00");

  it.each([
    ["ascending", [oldest, middle, latest]],
    ["descending", [latest, middle, oldest]],
    ["shuffled", [middle, latest, oldest]],
  ] as const)("selects the maximum timestamp in %s order", (_, ordered) => {
    const assets = [...ordered];
    expect(pickLatestAsset(assets)).toBe(latest);
    expect(assets).toEqual(ordered);
  });

  it("compares parsed timestamps across time zones", () => {
    const earlier = asset("006", "2026-05-03T19:03:00Z");
    expect(pickLatestAsset([earlier, latest])).toBe(latest);
  });

  it("keeps the first occurrence when the latest timestamps tie", () => {
    const tied = asset("007", "2026-05-03T19:04:00Z");
    expect(pickLatestAsset([oldest, latest, tied])).toBe(latest);
    expect(pickLatestAsset([oldest, tied, latest])).toBe(tied);
  });

  it("throws a clear error for an empty array", () => {
    expect(() => pickLatestAsset([])).toThrow(
      "Cannot pick the latest asset from an empty array."
    );
  });
});
