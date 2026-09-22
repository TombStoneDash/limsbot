// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

function timeline(scanTimestamp: string, drafts: [string, string][]): AuditTrailData {
  return {
    scan_events: [{
      scan_id: "SCAN-001",
      tag_type: "NTAG215",
      asset_id: "ASSET-001",
      asset_name: "Centrifuge",
      scanned_at: scanTimestamp,
      operator_role: "lab-tech",
    }],
    service_events: [],
    reports: [],
    non_compliance_items: [],
    pending_limsbot_drafts: drafts.map(([draft_id, drafted_at]) => ({
      draft_id,
      drafted_at,
      subject: draft_id,
      draft_text: "Draft text",
      drafted_by: "limsbot-local",
      approval_required: true,
    })),
  };
}

describe("audit trail chronological ordering", () => {
  it.each([
    {
      name: "sorts mixed UTC offsets by elapsed time, newest first",
      scan: "2026-05-06T08:30:00-07:00",
      drafts: [
        ["UTC", "2026-05-06T14:00:00Z"],
        ["POSITIVE", "2026-05-06T18:00:00+02:00"],
      ] as [string, string][],
      expected: [
        ["POSITIVE", "2026-05-06T18:00:00+02:00"],
        ["ASSET-001 (Centrifuge)", "2026-05-06T08:30:00-07:00"],
        ["UTC", "2026-05-06T14:00:00Z"],
      ],
    },
    {
      name: "orders instants across a UTC date boundary",
      scan: "2026-05-06T23:30:00-07:00",
      drafts: [["NEXT-DATE", "2026-05-07T01:00:00Z"]] as [string, string][],
      expected: [
        ["ASSET-001 (Centrifuge)", "2026-05-06T23:30:00-07:00"],
        ["NEXT-DATE", "2026-05-07T01:00:00Z"],
      ],
    },
    {
      name: "preserves source order for equivalent instants with different offsets",
      scan: "2026-05-06T08:30:00-07:00",
      drafts: [
        ["UTC", "2026-05-06T15:30:00Z"],
        ["POSITIVE", "2026-05-06T17:30:00+02:00"],
      ] as [string, string][],
      expected: [
        ["ASSET-001 (Centrifuge)", "2026-05-06T08:30:00-07:00"],
        ["UTC", "2026-05-06T15:30:00Z"],
        ["POSITIVE", "2026-05-06T17:30:00+02:00"],
      ],
    },
    {
      name: "preserves source order for identical timestamps",
      scan: "2026-05-06T15:30:00Z",
      drafts: [
        ["FIRST", "2026-05-06T15:30:00Z"],
        ["SECOND", "2026-05-06T15:30:00Z"],
      ] as [string, string][],
      expected: [
        ["ASSET-001 (Centrifuge)", "2026-05-06T15:30:00Z"],
        ["FIRST", "2026-05-06T15:30:00Z"],
        ["SECOND", "2026-05-06T15:30:00Z"],
      ],
    },
  ])("$name", ({ scan, drafts, expected }) => {
    const events = buildAuditTrail(timeline(scan, drafts));

    expect(events.map(({ ref, ts }) => [ref, ts])).toEqual(expected);
  });

  it("returns an empty timeline when there are no events", () => {
    const data = timeline("2026-05-06T15:30:00Z", []);
    data.scan_events = [];

    expect(buildAuditTrail(data)).toEqual([]);
  });
});
