import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Instrument Registry — Lab Operations Logs — LIMS BOX",
  description:
    "Authorized instrument registry. Qualification windows, integration patterns, owner-declared mock instruments. AI-assisted documentation, human-reviewed records.",
};

interface Instrument {
  instrument_id: string;
  name: string;
  category: string;
  location: string;
  last_qualification: string;
  next_pm_due: string;
  owner: string;
  notes: string | null;
}

async function load(): Promise<{ instruments: Instrument[] }> {
  const file = path.join(process.cwd(), "public", "data", "lab_operations_logs_demo.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

export default async function InstrumentRegistry() {
  const { instruments } = await load();
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <Link href="/lab-operations-logs" className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block">
            ← Lab Operations Logs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Instrument Registry</h1>
          <p className="text-lg text-[#F8F9FA]/75">
            Authorized instruments. Owner-declared mock entries for demo. Qualification windows
            and integration patterns recorded once, used everywhere downstream.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto rounded-lg border border-[#1E3A5F]/40">
            <table className="w-full text-sm">
              <thead className="bg-[#1E3A5F]/30 text-[#F8F9FA]/80">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Instrument</th>
                  <th className="text-left px-4 py-3 font-semibold">Category</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                  <th className="text-left px-4 py-3 font-semibold">Last qualification</th>
                  <th className="text-left px-4 py-3 font-semibold">Next PM due</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((i) => (
                  <tr key={i.instrument_id} className="border-t border-[#1E3A5F]/30 align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#F8F9FA]">{i.name}</div>
                      <div className="text-xs text-[#F8F9FA]/50 font-mono">{i.instrument_id}</div>
                    </td>
                    <td className="px-4 py-3 text-[#F8F9FA]/80">{i.category}</td>
                    <td className="px-4 py-3 text-[#F8F9FA]/80">{i.location}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#F8F9FA]/70">{i.last_qualification}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#E67E22]">{i.next_pm_due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#F8F9FA]/50 mt-4">
            Owner-declared mock instruments. Integration patterns: vendor file drop, RS-232
            serial capture, USB-HID scan, owner-declared manifest. Real integrations require
            vendor interface specs.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Why a registry first?</h2>
          <p className="text-[#F8F9FA]/75 leading-relaxed">
            Most labs we talk to don&apos;t have a complete, current instrument list anywhere.
            Vendor PCs come and go. Auxiliary devices get plugged in by whoever needed them.
            The registry is the foundation for QC, maintenance, audit prep, and operational
            AI readiness.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/lab-operations-logs/maintenance-qc" className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white">
            Next: Maintenance &amp; QC →
          </Link>
        </div>
      </section>
    </main>
  );
}
