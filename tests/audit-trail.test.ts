// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildAuditTrail,
  type AuditTrailData,
  type Draft,
} from "../src/lib/audit-trail";

function baseData(overrides: Partial<AuditTrailData> = {}): AuditTrailData {
  return {
    scan_events: [],
    service_events: [],
    reports: [],
    non_compliance_items: [],
    pending_limsbot_drafts: [],
    ...overrides,
  };
}

function draft(overrides: Partial<Draft> = {}): Draft {
  return {
    draft_id: "DRAFT-001",
    subject: "Close NC-001 (missed daily temp)",
    draft_text: "Demo draft text.",
    drafted_by: "limsbot-local",
    drafted_at: "2026-05-04T16:15:00-07:00",
    approval_required: true,
    ...overrides,
  };
}

describe("buildAuditTrail", () => {
  it("stamps a limsbot-draft row with the draft's own drafted_at, not an unrelated scan's timestamp", () => {
    const data = baseData({
      scan_events: [
        {
          scan_id: "SCAN-001",
          tag_type: "NTAG215",
          asset_id: "INSTR-002",
          asset_name: "Bench Centrifuge",
          scanned_at: "2026-05-06T08:14:00-07:00",
          operator_role: "lab-tech",
        },
      ],
      pending_limsbot_drafts: [
        draft({ drafted_at: "2026-05-04T16:15:00-07:00" }),
      ],
    });

    const events = buildAuditTrail(data);
    const draftEvent = events.find((e) => e.type === "limsbot-draft");

    expect(draftEvent).toBeDefined();
    expect(draftEvent!.ts).toBe("2026-05-04T16:15:00-07:00");
    // Must not have borrowed the unrelated scan event's timestamp.
    expect(draftEvent!.ts).not.toBe(data.scan_events[0].scanned_at);
  });

  it("does not fall back to the current time when there are no scan events", () => {
    const drafted_at = "2026-05-06T09:05:00-07:00";
    const data = baseData({
      scan_events: [],
      pending_limsbot_drafts: [draft({ draft_id: "DRAFT-002", drafted_at })],
    });

    const events = buildAuditTrail(data);
    const draftEvent = events.find((e) => e.type === "limsbot-draft");

    expect(draftEvent).toBeDefined();
    // A `new Date().toISOString()` fallback would not equal this fixed,
    // already-past timestamp, so this only passes if drafted_at is used
    // directly rather than the moment the code happens to run.
    expect(draftEvent!.ts).toBe(drafted_at);
  });

  it("stamps each of several limsbot-draft rows with its own drafted_at", () => {
    const data = baseData({
      pending_limsbot_drafts: [
        draft({ draft_id: "DRAFT-001", drafted_at: "2026-05-04T16:15:00-07:00" }),
        draft({ draft_id: "DRAFT-002", drafted_at: "2026-05-06T09:05:00-07:00" }),
      ],
    });

    const events = buildAuditTrail(data).filter((e) => e.type === "limsbot-draft");
    const tsByRef = Object.fromEntries(events.map((e) => [e.ref, e.ts]));

    expect(tsByRef["DRAFT-001"]).toBe("2026-05-04T16:15:00-07:00");
    expect(tsByRef["DRAFT-002"]).toBe("2026-05-06T09:05:00-07:00");
  });

  it("leaves the other event types' timestamp sources untouched", () => {
    const data: AuditTrailData = {
      scan_events: [
        {
          scan_id: "SCAN-001",
          tag_type: "NTAG215",
          asset_id: "INSTR-002",
          asset_name: "Bench Centrifuge",
          scanned_at: "2026-05-06T08:14:00-07:00",
          operator_role: "lab-tech",
        },
      ],
      service_events: [
        {
          event_id: "SVC-001",
          instrument_id: "INSTR-002",
          name: "Calibration",
          performed_at: "2026-05-04T10:30:00-07:00",
          performed_by: "lab-tech",
          result: "pass",
          approval_state: "approved",
          approver_role: "lab-director",
        },
      ],
      reports: [
        {
          report_id: "RPT-001",
          name: "Weekly QC",
          period_start: "2026-04-25",
          period_end: "2026-05-01",
          generated_at: "2026-05-02T15:00:00-07:00",
          approval_state: "approved",
          approver_role: "lab-director",
          approver_signed_at: "2026-05-02T15:42:00-07:00",
        },
      ],
      non_compliance_items: [
        {
          nc_id: "NC-001",
          name: "Missed daily temp check",
          linked_qc_id: "QC-001",
          severity: "moderate",
          status: "open",
          opened_at: "2026-05-04T08:00:00-07:00",
          approval_required: true,
          notes: null,
        },
      ],
      pending_limsbot_drafts: [draft()],
    };

    const events = buildAuditTrail(data);
    const tsByType = Object.fromEntries(events.map((e) => [e.type, e.ts]));

    expect(tsByType["scan"]).toBe(data.scan_events[0].scanned_at);
    expect(tsByType["service"]).toBe(data.service_events[0].performed_at);
    expect(tsByType["report-signoff"]).toBe(data.reports[0].approver_signed_at);
    expect(tsByType["non-compliance"]).toBe(data.non_compliance_items[0].opened_at);
  });

  it("sorts the combined timeline newest first, unaffected by the fix", () => {
    const data = baseData({
      scan_events: [
        {
          scan_id: "SCAN-001",
          tag_type: "NTAG215",
          asset_id: "INSTR-002",
          asset_name: "Bench Centrifuge",
          scanned_at: "2026-05-06T08:14:00-07:00",
          operator_role: "lab-tech",
        },
      ],
      pending_limsbot_drafts: [
        draft({ draft_id: "DRAFT-001", drafted_at: "2026-05-04T16:15:00-07:00" }),
        draft({ draft_id: "DRAFT-002", drafted_at: "2026-05-07T09:05:00-07:00" }),
      ],
    });

    const events = buildAuditTrail(data);
    const timestamps = events.map((e) => e.ts);
    const expectedOrder = [...timestamps].sort((a, b) => (a < b ? 1 : -1));

    expect(timestamps).toEqual(expectedOrder);
    expect(events[0].ref).toBe("DRAFT-002");
  });
});
