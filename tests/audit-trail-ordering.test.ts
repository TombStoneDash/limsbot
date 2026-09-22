// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

function dataWithDrafts(rows: [string, string][]): AuditTrailData {
  return {
    scan_events: [],
    service_events: [],
    reports: [],
    non_compliance_items: [],
    pending_limsbot_drafts: rows.map(([draft_id, drafted_at]) => ({
      draft_id,
      drafted_at,
      subject: "Review QC",
      draft_text: "Awaiting review.",
      drafted_by: "limsbot-local",
      approval_required: true,
    })),
  };
}

describe("audit trail ordering", () => {
  it("orders mixed offsets by instant, newest first", () => {
    const events = buildAuditTrail(dataWithDrafts([
      ["UTC", "2026-05-06T14:30:00Z"],
      ["PACIFIC", "2026-05-06T08:00:00-07:00"],
    ]));

    expect(events.map((event) => event.ref)).toEqual(["PACIFIC", "UTC"]);
    expect(events.map((event) => event.ts)).toEqual([
      "2026-05-06T08:00:00-07:00",
      "2026-05-06T14:30:00Z",
    ]);
  });

  it("preserves insertion order for equal instants with different offsets", () => {
    const events = buildAuditTrail(dataWithDrafts([
      ["PACIFIC", "2026-05-06T08:00:00-07:00"],
      ["UTC", "2026-05-06T15:00:00Z"],
      ["EAST", "2026-05-06T17:00:00+02:00"],
    ]));

    expect(events.map((event) => event.ref)).toEqual(["PACIFIC", "UTC", "EAST"]);
  });

  it("preserves insertion order for identical timestamps", () => {
    const events = buildAuditTrail(dataWithDrafts([
      ["FIRST", "2026-05-06T15:00:00Z"],
      ["SECOND", "2026-05-06T15:00:00Z"],
      ["THIRD", "2026-05-06T15:00:00Z"],
    ]));

    expect(events.map((event) => event.ref)).toEqual(["FIRST", "SECOND", "THIRD"]);
  });

  it("puts invalid timestamps last and preserves their relative order", () => {
    const events = buildAuditTrail(dataWithDrafts([
      ["INVALID-FIRST", "not-a-date"],
      ["OLDER", "2026-05-06T14:30:00Z"],
      ["INVALID-SECOND", ""],
      ["NEWER", "2026-05-06T08:00:00-07:00"],
      ["INVALID-THIRD", "also-invalid"],
    ]));

    expect(events.map((event) => event.ref)).toEqual([
      "NEWER", "OLDER", "INVALID-FIRST", "INVALID-SECOND", "INVALID-THIRD",
    ]);
    expect(events.slice(2).map((event) => event.ts)).toEqual([
      "not-a-date", "", "also-invalid",
    ]);
  });

  it("leaves input records and their order unchanged", () => {
    const data = dataWithDrafts([
      ["INVALID", "not-a-date"],
      ["OLDER", "2026-05-06T14:30:00Z"],
      ["NEWER", "2026-05-06T08:00:00-07:00"],
    ]);
    const original = structuredClone(data);

    const events = buildAuditTrail(data);

    expect(events.map((event) => event.ref)).toEqual(["NEWER", "OLDER", "INVALID"]);
    expect(data).toEqual(original);
  });
});
