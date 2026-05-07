import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Reports & Signoff — Lab Operations Logs — LIMS BOX",
  description:
    "Monthly maintenance summaries, QC roll-ups, AI-assisted documentation, human-reviewed signoffs. Designed to support audit workflows.",
};

interface Report { report_id: string; name: string; period_start: string; period_end: string; generated_at: string; approval_state: string; approver_role: string; approver_signed_at: string; }
interface Draft { draft_id: string; subject: string; draft_text: string; drafted_by: string; approval_required: boolean; }

async function load(): Promise<{ reports: Report[]; pending_limsbot_drafts: Draft[] }> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

export default async function ReportsSignoff() {
  const { reports, pending_limsbot_drafts } = await load();
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <Link href="/lab-operations-logs" className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block">
            ← Lab Operations Logs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reports &amp; Signoff</h1>
          <p className="text-lg text-[#F8F9FA]/75">
            AI-assisted documentation. Human-reviewed signoffs. Designed to support audit
            workflows — never to replace the human review at the end of the loop.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Signed reports</h2>
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.report_id} className="rounded-lg border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#2E8B57]/15 text-[#2E8B57] border border-[#2E8B57]/30">
                    {r.approval_state}
                  </span>
                  <span className="text-xs text-[#F8F9FA]/50 font-mono">{r.report_id}</span>
                </div>
                <div className="font-semibold text-[#F8F9FA] mb-1">{r.name}</div>
                <div className="text-sm text-[#F8F9FA]/70">
                  Period {r.period_start} → {r.period_end} · generated {new Date(r.generated_at).toLocaleString()} · signed by {r.approver_role} at {new Date(r.approver_signed_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Pending LIMS BOT drafts</h2>
          <p className="text-sm text-[#F8F9FA]/60 mb-6">
            AI drafts. Awaiting human approval. Nothing is committed to the live record
            until a qualified operator signs off.
          </p>
          <ul className="space-y-3">
            {pending_limsbot_drafts.map((d) => (
              <li key={d.draft_id} className="rounded-lg border border-[#E67E22]/40 bg-[#0a0f1a]/60 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#E67E22]/15 text-[#E67E22] border border-[#E67E22]/30">DRAFT</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border border-[#1E3A5F]/40">drafted by {d.drafted_by}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border border-[#1E3A5F]/40">human approval required</span>
                  <span className="text-xs text-[#F8F9FA]/50 font-mono">{d.draft_id}</span>
                </div>
                <div className="font-semibold text-[#F8F9FA] mb-1">{d.subject}</div>
                <p className="text-sm text-[#F8F9FA]/85 leading-relaxed">{d.draft_text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/lab-operations-logs/audit-trail" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
            Next: Audit Trail →
          </Link>
        </div>
      </section>
    </main>
  );
}
