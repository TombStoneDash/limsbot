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

describe("pickLatestAsset with invalid capture timestamps", () => {
  const earlier = asset("earlier", "2026-05-03T19:00:00Z");
  const latest = asset("latest", "2026-05-03T19:04:00Z");

  it.each(["not-a-date", ""])("ignores timestamp %j in any position", (timestamp) => {
    const invalid = asset("invalid", timestamp);
    for (const assets of [
      [invalid, earlier, latest],
      [earlier, invalid, latest],
      [earlier, latest, invalid],
      [invalid, latest, earlier],
      [latest, invalid, earlier],
      [latest, earlier, invalid],
    ]) {
      expect(pickLatestAsset(assets)).toBe(latest);
    }
  });

  it.each([["not-a-date"], [""], ["not-a-date", "", "invalid"]])(
    "throws a distinct error when all timestamps are invalid: %j",
    (...timestamps) => {
      const assets = timestamps.map((timestamp, index) => asset(String(index), timestamp));
      expect(() => pickLatestAsset(assets)).toThrow(
        "Cannot pick the latest asset: no valid capture timestamps."
      );
    }
  );

  it("preserves the first valid maximum when timezone offsets tie", () => {
    const tied = asset("tied", "2026-05-03T12:04:00-07:00");
    const invalid = asset("invalid", "not-a-date");
    expect(pickLatestAsset([invalid, earlier, latest, tied])).toBe(latest);
    expect(pickLatestAsset([invalid, earlier, tied, latest])).toBe(tied);
  });

  it("preserves input ordering, object identities, and object contents", () => {
    const assets = [asset("invalid", ""), latest, earlier];
    const originalObjects = [...assets];
    const originalValues = assets.map((entry) => ({ ...entry }));
    assets.forEach(Object.freeze);
    Object.freeze(assets);

    expect(pickLatestAsset(assets)).toBe(latest);
    expect(assets).toEqual(originalValues);
    assets.forEach((entry, index) => expect(entry).toBe(originalObjects[index]));
  });
});
