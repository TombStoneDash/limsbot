// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

function dataWithTimestamps(
  [scan, service, report, nc, draft]: [string, string, string, string, string],
): AuditTrailData {
  return {
    scan_events: [{
      scan_id: "SCAN-001", tag_type: "NTAG215", asset_id: "INSTR-001",
      asset_name: "Centrifuge", scanned_at: scan, operator_role: "lab-tech",
    }],
    service_events: [{
      event_id: "SVC-001", instrument_id: "INSTR-001", name: "Calibration",
      performed_at: service, performed_by: "lab-tech", result: "pass",
      approval_state: "approved", approver_role: "lab-director",
    }],
    reports: [{
      report_id: "RPT-001", name: "Weekly QC", period_start: "2026-05-01",
      period_end: "2026-05-05", generated_at: "2026-05-06T00:00:00Z",
      approval_state: "approved", approver_role: "lab-director",
      approver_signed_at: report,
    }],
    non_compliance_items: [{
      nc_id: "NC-001", name: "Missed check", linked_qc_id: "QC-001",
      severity: "moderate", status: "open", opened_at: nc,
      approval_required: true, notes: null,
    }],
    pending_limsbot_drafts: [{
      draft_id: "DRAFT-001", subject: "Close NC-001", draft_text: "Draft text.",
      drafted_by: "limsbot-local", drafted_at: draft, approval_required: true,
    }],
  };
}

const inputTypes = ["scan", "service", "report-signoff", "non-compliance", "limsbot-draft"];

describe("buildAuditTrail chronological ordering", () => {
  it("orders mixed offsets by instant across event types and preserves inputs and timestamp strings", () => {
    const timestamps: [string, string, string, string, string] = [
      "2026-05-06T09:00:00Z",      // 09:00 UTC
      "2026-05-06T08:30:00-07:00", // 15:30 UTC
      "2026-05-07T00:00:00+10:00", // 14:00 UTC
      "2026-05-06T10:00:00+02:00", // 08:00 UTC
      "2026-05-06T12:00:00Z",      // 12:00 UTC
    ];
    const data = dataWithTimestamps(timestamps);
    // Multiple rows also verify that the source array keeps its original order.
    data.scan_events.push({
      ...data.scan_events[0], scan_id: "SCAN-002", asset_id: "INSTR-002",
      scanned_at: "2026-05-06T16:00:00Z",
    });
    const before = structuredClone(data);

    const events = buildAuditTrail(data);

    expect(events.map(({ type, ts }) => [type, ts])).toEqual([
      ["scan", "2026-05-06T16:00:00Z"],
      ["service", timestamps[1]],
      ["report-signoff", timestamps[2]],
      ["limsbot-draft", timestamps[4]],
      ["scan", timestamps[0]],
      ["non-compliance", timestamps[3]],
    ]);
    expect(data).toEqual(before);
  });

  it("keeps input order for equal instants expressed with different offsets", () => {
    const timestamps: [string, string, string, string, string] = [
      "2026-05-06T09:00:00Z",
      "2026-05-06T02:00:00-07:00",
      "2026-05-06T11:00:00+02:00",
      "2026-05-06T19:00:00+10:00",
      "2026-05-06T09:00:00+00:00",
    ];

    const events = buildAuditTrail(dataWithTimestamps(timestamps));

    expect(events.map((event) => event.type)).toEqual(inputTypes);
    expect(events.map((event) => event.ts)).toEqual(timestamps);
  });

  it("keeps input order for identical timestamps within and across event types", () => {
    const ts = "2026-05-06T09:00:00Z";
    const data = dataWithTimestamps([ts, ts, ts, ts, ts]);
    data.pending_limsbot_drafts.push({
      ...data.pending_limsbot_drafts[0], draft_id: "DRAFT-002",
    });

    const events = buildAuditTrail(data);

    expect(events.map((event) => event.type)).toEqual([...inputTypes, "limsbot-draft"]);
    expect(events.map((event) => event.ref)).toEqual([
      "INSTR-001 (Centrifuge)", "SVC-001", "RPT-001", "NC-001", "DRAFT-001", "DRAFT-002",
    ]);
    expect(events.map((event) => event.ts)).toEqual([ts, ts, ts, ts, ts, ts]);
  });

  it("orders ordinary timestamps newest first", () => {
    const data = dataWithTimestamps([
      "2026-05-04T09:00:00Z",
      "2026-05-06T09:00:00Z",
      "2026-05-05T09:00:00Z",
      "2026-05-06T10:00:00Z",
      "2026-05-03T09:00:00Z",
    ]);

    expect(buildAuditTrail(data).map((event) => event.type)).toEqual([
      "non-compliance", "service", "report-signoff", "scan", "limsbot-draft",
    ]);
  });
});
