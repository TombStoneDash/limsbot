import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Offline / Field Mode — Lab Operations Logs — LIMS BOX",
  description:
    "Queue locally, sync on authorized network. Field-first lab informatics for collection sites, mobile testing, and bench environments without dependable connectivity.",
};

interface Sync { mode: string; last_authorized_sync: string; pending_outbound: number; pending_inbound: number; notes: string; }

async function load(): Promise<{ offline_sync: Sync }> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

export default async function OfflineFieldMode() {
  const { offline_sync } = await load();
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <Link href="/lab-operations-logs" className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block">
            ← Lab Operations Logs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Offline / Field Mode</h1>
          <p className="text-lg text-[#F8F9FA]/75">
            Queue locally. Sync on authorized network. Field-first lab informatics for
            collection sites, mobile testing, and benches that can&apos;t depend on a
            stable network.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
          <div className="rounded-lg border border-[#2E8B57]/40 bg-[#2E8B57]/5 p-5">
            <div className="text-xs uppercase tracking-wide text-[#2E8B57]/80 mb-1">Mode</div>
            <div className="text-2xl font-semibold text-[#2E8B57]">{offline_sync.mode}</div>
          </div>
          <div className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5">
            <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/50 mb-1">Last authorized sync</div>
            <div className="text-2xl font-semibold font-mono">{new Date(offline_sync.last_authorized_sync).toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-5">
            <div className="text-xs uppercase tracking-wide text-[#E67E22]/90 mb-1">Pending outbound</div>
            <div className="text-3xl font-bold text-[#E67E22]">{offline_sync.pending_outbound}</div>
          </div>
          <div className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5">
            <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/50 mb-1">Pending inbound</div>
            <div className="text-3xl font-bold text-[#F8F9FA]">{offline_sync.pending_inbound}</div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How field mode works</h2>
          <ol className="space-y-3 text-[#F8F9FA]/80 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Capture</strong> — scans, drafts, signoffs, and corrections happen on
              the LIMS BOX locally, even with no network.
            </li>
            <li>
              <strong>Queue</strong> — every action is appended to a local event log with
              user, role, timestamp, and reason.
            </li>
            <li>
              <strong>Sync</strong> — when the box reaches an authorized network, the queue
              replays into the LIS/LIMS in order, with collisions surfaced for human review.
            </li>
            <li>
              <strong>Audit</strong> — the local log and the sync record are both available
              for audit workflow review.
            </li>
          </ol>
          <p className="text-xs text-[#F8F9FA]/50 mt-4">{offline_sync.notes}</p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
          <h3 className="text-xl font-bold text-[#E67E22] mb-3">Boundaries</h3>
          <ul className="space-y-2 text-sm text-[#F8F9FA]/85 list-disc list-inside">
            <li>Sync only to authorized destinations defined in the deployment.</li>
            <li>No silent autopilot. Operator decisions stay logged.</li>
            <li>Privacy and security requirements are scoped per deployment.</li>
            <li>Offline mode does not bypass review — it queues review for later.</li>
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Talk to us about an AI-ready lab data pilot.
          </h2>
          <p className="text-[#F8F9FA]/70 mb-6">
            Pilot deployments start around $5,000.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/early-access" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
              Apply for Early Access
            </Link>
            <Link href="/lab-operations-logs" className="inline-flex items-center justify-center px-6 py-3 border border-[#1E3A5F]/60 hover:border-[#2E8B57]/60 rounded-lg font-semibold transition-all text-[#F8F9FA]">
              Back to Lab Operations Logs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
