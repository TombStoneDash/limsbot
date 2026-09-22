export interface ScanEvent {
  scan_id: string;
  tag_type: string;
  asset_id: string;
  asset_name: string;
  scanned_at: string;
  operator_role: string;
}

export interface ServiceEvent {
  event_id: string;
  instrument_id: string;
  name: string;
  performed_at: string;
  performed_by: string;
  result: string;
  approval_state: string;
  approver_role: string;
}

export interface Report {
  report_id: string;
  name: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  approval_state: string;
  approver_role: string;
  approver_signed_at: string;
}

export interface NonComplianceItem {
  nc_id: string;
  name: string;
  linked_qc_id: string;
  severity: string;
  status: string;
  opened_at: string;
  approval_required: boolean;
  notes: string | null;
}

export interface Draft {
  draft_id: string;
  subject: string;
  draft_text: string;
  drafted_by: string;
  drafted_at: string;
  approval_required: boolean;
}

export interface AuditTrailData {
  scan_events: ScanEvent[];
  service_events: ServiceEvent[];
  reports: Report[];
  non_compliance_items: NonComplianceItem[];
  pending_limsbot_drafts: Draft[];
}

export interface AuditEvent {
  ts: string;
  type: string;
  actor: string;
  ref: string;
  action: string;
}

/**
 * Builds the unified, chronologically-sorted audit timeline shown on the
 * Audit Trail page from the raw lab-operations-logs data.
 *
 * Every event is stamped with a timestamp that belongs to that event.
 * limsbot-draft rows use the draft's own `drafted_at` — never an unrelated
 * scan event's time and never the moment the page happens to render.
 */
export function buildAuditTrail(data: AuditTrailData): AuditEvent[] {
  const events: AuditEvent[] = [
    ...data.scan_events.map<AuditEvent>((s) => ({
      ts: s.scanned_at,
      type: "scan",
      actor: s.operator_role,
      ref: `${s.asset_id} (${s.asset_name})`,
      action: `Asset scanned (${s.tag_type})`,
    })),
    ...data.service_events.map<AuditEvent>((s) => ({
      ts: s.performed_at,
      type: "service",
      actor: `${s.performed_by} → ${s.approver_role}`,
      ref: `${s.event_id}`,
      action: `Service event '${s.name}' result=${s.result} approval=${s.approval_state}`,
    })),
    ...data.reports.map<AuditEvent>((r) => ({
      ts: r.approver_signed_at,
      type: "report-signoff",
      actor: r.approver_role,
      ref: r.report_id,
      action: `Report '${r.name}' signed`,
    })),
    ...data.non_compliance_items.map<AuditEvent>((nc) => ({
      ts: nc.opened_at,
      type: "non-compliance",
      actor: "system",
      ref: nc.nc_id,
      action: `NC opened — ${nc.name} (severity=${nc.severity})`,
    })),
    ...data.pending_limsbot_drafts.map<AuditEvent>((d) => ({
      ts: d.drafted_at,
      type: "limsbot-draft",
      actor: d.drafted_by,
      ref: d.draft_id,
      action: `LIMS BOT draft '${d.subject}' awaiting human approval`,
    })),
  ];

  return events.sort((a, b) => {
    const aTime = Date.parse(a.ts);
    const bTime = Date.parse(b.ts);
    // Keep unparseable timestamps last, retaining assembly order for ties.
    if (Number.isNaN(aTime)) return Number.isNaN(bTime) ? 0 : 1;
    if (Number.isNaN(bTime)) return -1;
    return bTime - aTime;
  });
}
