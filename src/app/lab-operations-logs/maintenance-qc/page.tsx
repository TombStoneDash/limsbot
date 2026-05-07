import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Maintenance & QC — Lab Operations Logs — LIMS BOX",
  description:
    "Daily, weekly, and monthly maintenance and QC tasks. AI-assisted drafts. Human-reviewed signoffs. Designed to support audit workflows.",
};

interface QC { qc_id: string; name: string; frequency: string; last_completed: string; next_due: string; status: string; owner_role: string; approval_required: boolean; notes: string | null; }
interface Maint { task_id: string; name: string; instrument_id: string; frequency: string; last_completed: string; next_due: string; status: string; approval_required: boolean; }
interface Service { event_id: string; instrument_id: string; name: string; performed_at: string; performed_by: string; result: string; approval_state: string; approver_role: string; }
interface NC { nc_id: string; name: string; linked_qc_id: string; severity: string; status: string; opened_at: string; approval_required: boolean; notes: string | null; }

async function load(): Promise<{ qc_tasks: QC[]; maintenance_tasks: Maint[]; service_events: Service[]; non_compliance_items: NC[] }> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    "due-today": "bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/30",
    "due-soon": "bg-[#E67E22]/15 text-[#E67E22] border-[#E67E22]/30",
    missed: "bg-[#E67E22]/20 text-[#E67E22] border-[#E67E22]/40",
    overdue: "bg-[#E67E22]/20 text-[#E67E22] border-[#E67E22]/40",
    open: "bg-[#E67E22]/20 text-[#E67E22] border-[#E67E22]/40",
    passed: "bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/30",
    signed: "bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/30",
  };
  return map[s] || "bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border-[#1E3A5F]/40";
};

export default async function MaintenanceQC() {
  const { qc_tasks, maintenance_tasks, service_events, non_compliance_items } = await load();
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <Link href="/lab-operations-logs" className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block">
            ← Lab Operations Logs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Maintenance &amp; QC</h1>
          <p className="text-lg text-[#F8F9FA]/75">
            Daily, weekly, monthly tasks. AI-assisted drafts. Human-reviewed signoffs.
            Non-compliance items captured and routed to the right operator role.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">QC tasks</h2>
          <div className="overflow-x-auto rounded-lg border border-[#1E3A5F]/40">
            <table className="w-full text-sm">
              <thead className="bg-[#1E3A5F]/30 text-[#F8F9FA]/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Task</th>
                  <th className="text-left px-4 py-3 font-semibold">Frequency</th>
                  <th className="text-left px-4 py-3 font-semibold">Last completed</th>
                  <th className="text-left px-4 py-3 font-semibold">Next due</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Approval</th>
                </tr>
              </thead>
              <tbody>
                {qc_tasks.map((q) => (
                  <tr key={q.qc_id} className="border-t border-[#1E3A5F]/30 align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{q.name}</div>
                      <div className="text-xs text-[#F8F9FA]/50 font-mono">{q.qc_id}</div>
                    </td>
                    <td className="px-4 py-3 text-[#F8F9FA]/80">{q.frequency}</td>
                    <td className="px-4 py-3 font-mono text-xs">{q.last_completed}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#E67E22]">{q.next_due}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(q.status)}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#E67E22]">Required</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Maintenance tasks</h2>
          <div className="overflow-x-auto rounded-lg border border-[#1E3A5F]/40">
            <table className="w-full text-sm">
              <thead className="bg-[#1E3A5F]/30 text-[#F8F9FA]/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Task</th>
                  <th className="text-left px-4 py-3 font-semibold">Instrument</th>
                  <th className="text-left px-4 py-3 font-semibold">Frequency</th>
                  <th className="text-left px-4 py-3 font-semibold">Last completed</th>
                  <th className="text-left px-4 py-3 font-semibold">Next due</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance_tasks.map((m) => (
                  <tr key={m.task_id} className="border-t border-[#1E3A5F]/30 align-top">
                    <td className="px-4 py-3 font-semibold">{m.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.instrument_id}</td>
                    <td className="px-4 py-3 text-[#F8F9FA]/80">{m.frequency}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.last_completed}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#E67E22]">{m.next_due}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(m.status)}`}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Service events</h2>
          <ul className="space-y-3">
            {service_events.map((s) => (
              <li key={s.event_id} className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-[#F8F9FA]/55 font-mono">{s.event_id} · instrument {s.instrument_id} · performed by {s.performed_by} at {new Date(s.performed_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(s.result)}`}>{s.result}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(s.approval_state)}`}>{s.approval_state} ({s.approver_role})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#E67E22]/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#E67E22]">Non-compliance items</h2>
          <ul className="space-y-3">
            {non_compliance_items.map((nc) => (
              <li key={nc.nc_id} className="rounded-lg border border-[#E67E22]/40 bg-[#0a0f1a]/60 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(nc.status)}`}>{nc.status}</span>
                  <span className="text-xs px-2 py-0.5 rounded border bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border-[#1E3A5F]/40">severity: {nc.severity}</span>
                  <span className="text-xs text-[#F8F9FA]/50 font-mono">{nc.nc_id}</span>
                </div>
                <div className="font-semibold mb-1">{nc.name}</div>
                {nc.notes ? <p className="text-sm text-[#F8F9FA]/70">{nc.notes}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/lab-operations-logs/reagents-lots" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
            Next: Reagents &amp; Lots →
          </Link>
        </div>
      </section>
    </main>
  );
}
