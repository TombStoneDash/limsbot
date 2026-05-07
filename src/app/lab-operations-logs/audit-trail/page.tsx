import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Audit Trail — Lab Operations Logs — LIMS BOX",
  description:
    "Every draft, edit, approval, and rejection — recorded with user, role, timestamp, and reason. Designed to support audit workflows. LIS/LIMS-agnostic data capture.",
};

interface Scan { scan_id: string; tag_type: string; asset_id: string; asset_name: string; scanned_at: string; operator_role: string; }
interface Service { event_id: string; instrument_id: string; name: string; performed_at: string; performed_by: string; result: string; approval_state: string; approver_role: string; }
interface Report { report_id: string; name: string; period_start: string; period_end: string; generated_at: string; approval_state: string; approver_role: string; approver_signed_at: string; }
interface NC { nc_id: string; name: string; linked_qc_id: string; severity: string; status: string; opened_at: string; approval_required: boolean; notes: string | null; }
interface Draft { draft_id: string; subject: string; draft_text: string; drafted_by: string; approval_required: boolean; }

interface AuditEvent {
  ts: string;
  type: string;
  actor: string;
  ref: string;
  action: string;
}

async function load(): Promise<{ scan_events: Scan[]; service_events: Service[]; reports: Report[]; non_compliance_items: NC[]; pending_limsbot_drafts: Draft[]; }> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

export default async function AuditTrail() {
  const data = await load();
  // Synthesize a unified audit timeline from the mock data
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
      ts: data.scan_events[0]?.scanned_at || new Date().toISOString(),
      type: "limsbot-draft",
      actor: d.drafted_by,
      ref: d.draft_id,
      action: `LIMS BOT draft '${d.subject}' awaiting human approval`,
    })),
  ].sort((a, b) => (a.ts < b.ts ? 1 : -1));

  const typeBadge = (t: string) => {
    const map: Record<string, string> = {
      scan: "bg-[#1E3A5F]/40 text-[#F8F9FA]/80 border-[#1E3A5F]/40",
      service: "bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/30",
      "report-signoff": "bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/30",
      "non-compliance": "bg-[#E67E22]/15 text-[#E67E22] border-[#E67E22]/30",
      "limsbot-draft": "bg-[#E67E22]/15 text-[#E67E22] border-[#E67E22]/30",
    };
    return map[t] || "bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border-[#1E3A5F]/40";
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <Link href="/lab-operations-logs" className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block">
            ← Lab Operations Logs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Audit Trail</h1>
          <p className="text-lg text-[#F8F9FA]/75">
            Every draft, edit, approval, and rejection — recorded with user, role,
            timestamp, and reason. Designed to support audit workflows.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto rounded-lg border border-[#1E3A5F]/40">
            <table className="w-full text-sm">
              <thead className="bg-[#1E3A5F]/30 text-[#F8F9FA]/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">When</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Actor / role</th>
                  <th className="text-left px-4 py-3 font-semibold">Reference</th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, idx) => (
                  <tr key={idx} className="border-t border-[#1E3A5F]/30 align-top">
                    <td className="px-4 py-3 font-mono text-xs">{new Date(e.ts).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${typeBadge(e.type)}`}>{e.type}</span>
                    </td>
                    <td className="px-4 py-3 text-[#F8F9FA]/85">{e.actor}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#F8F9FA]/70">{e.ref}</td>
                    <td className="px-4 py-3 text-[#F8F9FA]/80">{e.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#F8F9FA]/50 mt-4">
            Mock audit timeline derived from{" "}
            <span className="font-mono">lab_operations_logs_demo.json</span>. In a live
            deployment, the audit trail captures every state change with role, timestamp,
            and reason. Designed to support audit workflows. Not a substitute for the
            human review at the end of the loop.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/lab-operations-logs/offline-field-mode" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
            Next: Offline / Field Mode →
          </Link>
        </div>
      </section>
    </main>
  );
}
