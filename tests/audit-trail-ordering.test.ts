// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

function timeline(timestamps: string[]): AuditTrailData {
  return {
    scan_events: [{
      scan_id: "SCAN", tag_type: "NFC", asset_id: "ASSET", asset_name: "Meter",
      scanned_at: timestamps[0], operator_role: "operator",
    }],
    service_events: [{
      event_id: "SERVICE", instrument_id: "ASSET", name: "Calibration",
      performed_at: timestamps[1], performed_by: "operator", result: "pass",
      approval_state: "approved", approver_role: "director",
    }],
    reports: [{
      report_id: "REPORT", name: "QC", period_start: "2026-05-01",
      period_end: "2026-05-05", generated_at: "2026-05-06T00:00:00Z",
      approval_state: "approved", approver_role: "director",
      approver_signed_at: timestamps[2],
    }],
    non_compliance_items: [{
      nc_id: "NC", name: "Missed check", linked_qc_id: "QC", severity: "low",
      status: "open", opened_at: timestamps[3], approval_required: true, notes: null,
    }],
    pending_limsbot_drafts: [{
      draft_id: "DRAFT", subject: "Follow up", draft_text: "Review check",
      drafted_by: "limsbot", drafted_at: timestamps[4], approval_required: true,
    }],
  };
}

function buildWithoutMutation(data: AuditTrailData) {
  const snapshot = structuredClone(data);
  const arrays = Object.values(data);
  const records = arrays.map((rows) => [...rows]);
  for (const rows of arrays) {
    for (const row of rows) Object.freeze(row);
    Object.freeze(rows);
  }
  Object.freeze(data);

  const events = buildAuditTrail(data);

  expect(data).toEqual(snapshot);
  Object.values(data).forEach((rows, i) => {
    expect(rows).toBe(arrays[i]);
    rows.forEach((row, j) => expect(row).toBe(records[i][j]));
  });
  return events;
}

describe("audit trail chronological ordering", () => {
  it("sorts mixed UTC and positive/negative offsets by descending instant", () => {
    const data = timeline([
      "2026-05-06T09:00:00Z",
      "2026-05-06T08:00:00-07:00",
      "2026-05-06T18:00:00+02:00",
      "2026-05-06T07:00:00Z",
      "2026-05-06T10:00:00Z",
    ]);
    const events = buildWithoutMutation(data);
    expect(events.map((event) => event.ref)).toEqual([
      "REPORT", "SERVICE", "DRAFT", "ASSET (Meter)", "NC",
    ]);
    expect(events.map((event) => event.ts)).toEqual([
      "2026-05-06T18:00:00+02:00", "2026-05-06T08:00:00-07:00",
      "2026-05-06T10:00:00Z", "2026-05-06T09:00:00Z", "2026-05-06T07:00:00Z",
    ]);
  });

  it("preserves assembly order for equivalent instants expressed differently", () => {
    const events = buildWithoutMutation(timeline([
      "2026-05-06T09:00:00Z", "2026-05-06T02:00:00-07:00",
      "2026-05-06T11:00:00+02:00", "2026-05-06T09:00:00.000Z",
      "2026-05-06T09:00:00+00:00",
    ]));
    expect(events.map((event) => event.ref)).toEqual([
      "ASSET (Meter)", "SERVICE", "REPORT", "NC", "DRAFT",
    ]);
  });

  it("preserves assembly and source-array order for identical timestamps", () => {
    const data = timeline(Array(5).fill("2026-05-06T09:00:00Z"));
    data.pending_limsbot_drafts.push({ ...data.pending_limsbot_drafts[0], draft_id: "DRAFT-2" });
    const events = buildWithoutMutation(data);
    expect(events.map((event) => event.ref)).toEqual([
      "ASSET (Meter)", "SERVICE", "REPORT", "NC", "DRAFT", "DRAFT-2",
    ]);
  });

  it("places invalid timestamps last in their original relative order", () => {
    const events = buildWithoutMutation(timeline([
      "not-a-date", "2026-05-06T09:00:00Z", "",
      "2026-05-06T08:00:00-07:00", "2026-99-99T00:00:00Z",
    ]));
    expect(events.map((event) => event.ref)).toEqual([
      "NC", "SERVICE", "ASSET (Meter)", "REPORT", "DRAFT",
    ]);
    expect(events.slice(2).map((event) => event.ts)).toEqual([
      "not-a-date", "", "2026-99-99T00:00:00Z",
    ]);
  });

  it("returns an empty timeline for empty input", () => {
    expect(buildWithoutMutation({
      scan_events: [], service_events: [], reports: [],
      non_compliance_items: [], pending_limsbot_drafts: [],
    })).toEqual([]);
  });
});
