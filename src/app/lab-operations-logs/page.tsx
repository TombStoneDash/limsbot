import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Lab Operations Logs — LIMS BOX",
  description:
    "AI-assisted documentation for instruments, QC, maintenance, reagents, reports, and audit. Human-reviewed records, designed to support audit workflows. LIS/LIMS-agnostic data capture.",
};

interface OpsLogsData {
  schema: string;
  generated_at: string;
  generated_by: string;
  data_classification: string;
  scope_statement: string;
  instruments: Array<{ instrument_id: string; name: string; category: string; location: string; last_qualification: string; next_pm_due: string; owner: string; notes: string | null }>;
  reagent_lots: Array<{ lot_id: string; name: string; expiry: string; days_to_expiry: number; status: string; location: string; owner: string; notes: string | null }>;
  qc_tasks: Array<{ qc_id: string; name: string; frequency: string; last_completed: string; next_due: string; status: string; owner_role: string; approval_required: boolean; notes: string | null }>;
  maintenance_tasks: Array<{ task_id: string; name: string; instrument_id: string; frequency: string; last_completed: string; next_due: string; status: string; approval_required: boolean }>;
  service_events: Array<{ event_id: string; instrument_id: string; name: string; performed_at: string; performed_by: string; result: string; approval_state: string; approver_role: string }>;
  non_compliance_items: Array<{ nc_id: string; name: string; linked_qc_id: string; severity: string; status: string; opened_at: string; approval_required: boolean; notes: string | null }>;
  reports: Array<{ report_id: string; name: string; period_start: string; period_end: string; generated_at: string; approval_state: string; approver_role: string; approver_signed_at: string }>;
  scan_events: Array<{ scan_id: string; tag_type: string; asset_id: string; asset_name: string; scanned_at: string; operator_role: string }>;
  pending_limsbot_drafts: Array<{ draft_id: string; subject: string; draft_text: string; drafted_by: string; approval_required: boolean }>;
  offline_sync: { mode: string; last_authorized_sync: string; pending_outbound: number; pending_inbound: number; notes: string };
}

async function loadOpsLogs(): Promise<OpsLogsData> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as OpsLogsData;
}

const subroutes = [
  { href: "/lab-operations-logs/instrument-registry", title: "Instrument Registry", desc: "Authorized instruments, qualification windows, integration patterns." },
  { href: "/lab-operations-logs/maintenance-qc", title: "Maintenance & QC", desc: "Daily, weekly, monthly tasks. AI-assisted drafts. Human-reviewed signoffs." },
  { href: "/lab-operations-logs/reagents-lots", title: "Reagents & Lots", desc: "Lot tracking, expiry windows, calibration context." },
  { href: "/lab-operations-logs/reports-signoff", title: "Reports & Signoff", desc: "Monthly summaries, designed to support audit workflows." },
  { href: "/lab-operations-logs/audit-trail", title: "Audit Trail", desc: "Every draft, edit, approval, and rejection — recorded with user, role, and time." },
  { href: "/lab-operations-logs/offline-field-mode", title: "Offline / Field Mode", desc: "Queue locally, sync on authorized network. Field-first lab informatics." },
];

export default async function LabOpsLogsHub() {
  const d = await loadOpsLogs();
  const dueToday = d.qc_tasks.filter((q) => q.status === "due-today").length;
  const overdue = d.qc_tasks.filter((q) => q.status === "missed").length + d.maintenance_tasks.filter((m) => m.status === "overdue").length;
  const failed = d.non_compliance_items.filter((nc) => nc.status === "open").length;
  const expiring = d.reagent_lots.filter((l) => l.status === "expiring-soon").length;
  const recentScans = d.scan_events.length;
  const pendingDrafts = d.pending_limsbot_drafts.length;
  const signedReports = d.reports.filter((r) => r.approval_state === "signed").length;
  const offlineMode = d.offline_sync.mode;

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E8B57]/10 border border-[#2E8B57]/30 mb-6 text-sm text-[#2E8B57]">
            Lab Operations Logs
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            AI-assisted documentation for{" "}
            <span className="gradient-text">the lab&apos;s daily ledger.</span>
          </h1>
          <p className="text-lg text-[#F8F9FA]/75 max-w-3xl mb-6">
            Instruments, QC, maintenance, reagents, reports, audit trail. Captured locally,
            drafted by the AI, reviewed and approved by qualified humans. LIS/LIMS-agnostic
            data capture, designed to support audit workflows.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mb-3">
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> AI-assisted documentation
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Human-reviewed records
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Offline-first / field-ready
            </div>
          </div>
          <p className="text-xs text-[#F8F9FA]/45 max-w-3xl">
            Mock demo data. Authorized environment only. No PHI, no production records.
          </p>
        </div>
      </section>

      {/* DASHBOARD WIDGETS */}
      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Widget label="Due today" value={dueToday} accent="green" />
            <Widget label="Overdue" value={overdue} accent={overdue > 0 ? "orange" : "green"} />
            <Widget label="Failed checks" value={failed} accent={failed > 0 ? "orange" : "green"} />
            <Widget label="Expiring lots" value={expiring} accent={expiring > 0 ? "orange" : "green"} />
            <Widget label="Recent scan events" value={recentScans} accent="blue" />
            <Widget label="Pending LIMS BOT drafts" value={pendingDrafts} accent="orange" />
            <Widget label="Signed reports" value={signedReports} accent="green" />
            <Widget label="Offline sync status" value={offlineMode} accent="blue" />
          </div>
          <p className="text-xs text-[#F8F9FA]/50 mt-4">
            Counts derived from local mock registry{" "}
            <span className="font-mono">lab_operations_logs_demo.json</span>. Classification:{" "}
            <span className="text-[#E67E22]">{d.data_classification}</span>.
          </p>
        </div>
      </section>

      {/* SUBROUTES */}
      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Drill into the log</h2>
          <p className="text-[#F8F9FA]/60 mb-8 max-w-3xl">
            Six lenses on the same operations data. All AI drafts. All human-reviewed.
            All audit-trailed.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subroutes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-6 hover:border-[#2E8B57]/60 transition-all"
              >
                <div className="text-xl font-semibold mb-2 text-[#F8F9FA]">{r.title}</div>
                <p className="text-sm text-[#F8F9FA]/70 leading-relaxed mb-4">{r.desc}</p>
                <span className="text-sm text-[#2E8B57]">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SAFE CLAIMS */}
      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
          <h3 className="text-xl font-bold text-[#E67E22] mb-3">What this is — and isn&apos;t</h3>
          <ul className="space-y-2 text-sm text-[#F8F9FA]/85 list-disc list-inside">
            <li><strong>Is:</strong> AI-assisted documentation for lab instrument, QC, reagent, and workflow events.</li>
            <li><strong>Is:</strong> human-reviewed by default — AI drafts, qualified operator approves.</li>
            <li><strong>Is:</strong> LIS/LIMS-agnostic. Designed to feed cleaner upstream data into your existing systems.</li>
            <li><strong>Is:</strong> designed to <em>support</em> audit workflows.</li>
            <li><strong>Is not:</strong> a diagnostic AI system or clinical decision tool.</li>
            <li><strong>Is not:</strong> FDA-cleared, 21 CFR Part 11 validated, or a regulated medical device.</li>
            <li><strong>Is not:</strong> a replacement for pathologists, lab supervisors, or qualified lab staff.</li>
            <li><strong>Is not:</strong> partnered with or integrated into ASCP PDI or any analytics platform unless explicitly stated for a given deployment.</li>
          </ul>
        </div>
      </section>

      {/* CTA + LINKS */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Talk to us about an AI-ready lab data pilot.
          </h2>
          <p className="text-[#F8F9FA]/70 mb-6">
            Pilot deployments start around $5,000. We&apos;re currently selecting 5 pilot labs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <Link href="/early-access" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
              Apply for Early Access
            </Link>
            <a href="mailto:info@lims.bot" className="inline-flex items-center justify-center px-6 py-3 border border-[#1E3A5F]/60 hover:border-[#2E8B57]/60 rounded-lg font-semibold transition-all text-[#F8F9FA]">
              Email info@lims.bot
            </a>
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/field-scout" className="text-[#2E8B57]/80 hover:text-[#2E8B57] transition">Field Scout →</Link>
            <Link href="/roadmap/compliance" className="text-[#2E8B57]/80 hover:text-[#2E8B57] transition">Compliance roadmap →</Link>
            <Link href="/ai-pathology" className="text-[#2E8B57]/80 hover:text-[#2E8B57] transition">AI in Pathology →</Link>
            <Link href="/#pricing" className="text-[#2E8B57]/80 hover:text-[#2E8B57] transition">Pricing →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Widget({ label, value, accent }: { label: string; value: number | string; accent: "green" | "orange" | "blue" }) {
  const ring =
    accent === "orange"
      ? "border-[#E67E22]/40 bg-[#E67E22]/5"
      : accent === "green"
      ? "border-[#2E8B57]/40 bg-[#2E8B57]/5"
      : "border-[#1E3A5F]/50 bg-[#1E3A5F]/10";
  const text =
    accent === "orange" ? "text-[#E67E22]" : accent === "green" ? "text-[#2E8B57]" : "text-[#F8F9FA]";
  return (
    <div className={`rounded-lg border ${ring} p-5`}>
      <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/60 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${text}`}>{value}</div>
    </div>
  );
}
