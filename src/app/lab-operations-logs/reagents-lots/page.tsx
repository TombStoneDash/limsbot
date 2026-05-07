import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Reagents & Lots — Lab Operations Logs — LIMS BOX",
  description:
    "Reagent lot tracking, expiry windows, calibration context. Structured field documentation for the inputs your results depend on.",
};

interface Lot { lot_id: string; name: string; expiry: string; days_to_expiry: number; status: string; location: string; owner: string; notes: string | null; }

async function load(): Promise<{ reagent_lots: Lot[] }> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

export default async function ReagentsLots() {
  const { reagent_lots } = await load();
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <Link href="/lab-operations-logs" className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block">
            ← Lab Operations Logs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reagents &amp; Lots</h1>
          <p className="text-lg text-[#F8F9FA]/75">
            Lot numbers, expiry, calibration context. The lineage that QA reviewers and
            analytics platforms both need.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto rounded-lg border border-[#1E3A5F]/40">
            <table className="w-full text-sm">
              <thead className="bg-[#1E3A5F]/30 text-[#F8F9FA]/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Reagent</th>
                  <th className="text-left px-4 py-3 font-semibold">Lot</th>
                  <th className="text-left px-4 py-3 font-semibold">Expiry</th>
                  <th className="text-left px-4 py-3 font-semibold">Days to expiry</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody>
                {reagent_lots.map((l) => {
                  const cls =
                    l.status === "expiring-soon"
                      ? "bg-[#E67E22]/15 text-[#E67E22] border-[#E67E22]/30"
                      : l.status === "ok"
                      ? "bg-[#2E8B57]/15 text-[#2E8B57] border-[#2E8B57]/30"
                      : "bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border-[#1E3A5F]/40";
                  return (
                    <tr key={l.lot_id} className="border-t border-[#1E3A5F]/30 align-top">
                      <td className="px-4 py-3 font-semibold">{l.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{l.lot_id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{l.expiry}</td>
                      <td className="px-4 py-3">{l.days_to_expiry}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{l.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[#F8F9FA]/80">{l.location}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#F8F9FA]/50 mt-4">
            LIMS BOT drafts a rotation reminder when a lot enters the expiring window. A
            qualified operator approves the rotation before any record is written.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/lab-operations-logs/reports-signoff" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
            Next: Reports &amp; Signoff →
          </Link>
        </div>
      </section>
    </main>
  );
}
