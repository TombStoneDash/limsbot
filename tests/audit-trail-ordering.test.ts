// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildAuditTrail,
  type AuditTrailData,
  type Draft,
  type ServiceEvent,
} from "../src/lib/audit-trail";

function data(overrides: Partial<AuditTrailData> = {}): AuditTrailData {
  return {
    scan_events: [],
    service_events: [],
    reports: [],
    non_compliance_items: [],
    pending_limsbot_drafts: [],
    ...overrides,
  };
}

function service(event_id: string, performed_at: string): ServiceEvent {
  return {
    event_id,
    performed_at,
    instrument_id: "INSTR-001",
    name: "Calibration",
    performed_by: "lab-tech",
    result: "pass",
    approval_state: "approved",
    approver_role: "lab-director",
  };
}

function draft(draft_id: string, drafted_at: string): Draft {
  return {
    draft_id,
    drafted_at,
    subject: "Review calibration",
    draft_text: "Review requested.",
    drafted_by: "limsbot-local",
    approval_required: true,
  };
}

describe("buildAuditTrail chronological ordering", () => {
  it("sorts mixed offsets by instant and preserves event fields", () => {
    const events = buildAuditTrail(data({
      service_events: [service("SVC-UTC", "2026-05-06T14:00:00Z")],
      pending_limsbot_drafts: [draft("DRAFT-PACIFIC", "2026-05-06T08:30:00-07:00")],
    }));

    expect(events.map((event) => event.ref)).toEqual(["DRAFT-PACIFIC", "SVC-UTC"]);
    expect(events).toEqual([
      {
        ts: "2026-05-06T08:30:00-07:00",
        type: "limsbot-draft",
        actor: "limsbot-local",
        ref: "DRAFT-PACIFIC",
        action: "LIMS BOT draft 'Review calibration' awaiting human approval",
      },
      {
        ts: "2026-05-06T14:00:00Z",
        type: "service",
        actor: "lab-tech → lab-director",
        ref: "SVC-UTC",
        action: "Service event 'Calibration' result=pass approval=approved",
      },
    ]);
  });

  it("sorts instants across a UTC day boundary", () => {
    const events = buildAuditTrail(data({
      service_events: [service("SVC-NEWER", "2026-05-06T23:30:00-02:00")],
      pending_limsbot_drafts: [draft("DRAFT-OLDER", "2026-05-07T00:30:00+02:00")],
    }));

    expect(events.map((event) => event.ref)).toEqual(["SVC-NEWER", "DRAFT-OLDER"]);
  });

  it("retains input order for equivalent instants with different offsets", () => {
    const events = buildAuditTrail(data({
      service_events: [
        service("SVC-FIRST", "2026-05-06T08:30:00-07:00"),
        service("SVC-SECOND", "2026-05-06T17:30:00+02:00"),
      ],
      pending_limsbot_drafts: [draft("DRAFT-THIRD", "2026-05-06T15:30:00Z")],
    }));

    expect(events.map((event) => event.ref)).toEqual(["SVC-FIRST", "SVC-SECOND", "DRAFT-THIRD"]);
  });

  it("retains input order for identical timestamps", () => {
    const timestamp = "2026-05-06T15:30:00Z";
    const events = buildAuditTrail(data({
      service_events: [service("SVC-FIRST", timestamp), service("SVC-SECOND", timestamp)],
      pending_limsbot_drafts: [draft("DRAFT-THIRD", timestamp)],
    }));

    expect(events.map((event) => event.ref)).toEqual(["SVC-FIRST", "SVC-SECOND", "DRAFT-THIRD"]);
  });

  it("places invalid timestamps last in stable input order", () => {
    const events = buildAuditTrail(data({
      service_events: [
        service("SVC-INVALID", "not-a-date"),
        service("SVC-OLDER", "2026-05-06T14:00:00Z"),
        service("SVC-EMPTY", ""),
      ],
      pending_limsbot_drafts: [
        draft("DRAFT-NEWER", "2026-05-06T08:30:00-07:00"),
        draft("DRAFT-INVALID", "2026-99-99T00:00:00Z"),
      ],
    }));

    expect(events.map((event) => event.ref)).toEqual([
      "DRAFT-NEWER", "SVC-OLDER", "SVC-INVALID", "SVC-EMPTY", "DRAFT-INVALID",
    ]);
    expect(events.slice(2).map((event) => event.ts)).toEqual([
      "not-a-date", "", "2026-99-99T00:00:00Z",
    ]);
  });

  it("retains input order when every timestamp is invalid", () => {
    const events = buildAuditTrail(data({
      service_events: [service("SVC-FIRST", ""), service("SVC-SECOND", "invalid")],
      pending_limsbot_drafts: [draft("DRAFT-THIRD", "not-a-date")],
    }));

    expect(events.map((event) => event.ref)).toEqual(["SVC-FIRST", "SVC-SECOND", "DRAFT-THIRD"]);
  });

  it("returns an empty timeline for empty input", () => {
    expect(buildAuditTrail(data())).toEqual([]);
  });
});
