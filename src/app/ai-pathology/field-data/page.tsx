import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Field Data — LIMS BOX",
  description:
    "Field collection, chain-of-custody, mobile testing, assets, reagents, instruments — captured once, structured for downstream AI and analytics.",
};

const fieldDimensions = [
  {
    k: "Field collection",
    v:
      "Sample taken in the field, at the bench, or at a remote site — captured with location, time, operator, and authorization context. Not retyped from a paper form three days later.",
  },
  {
    k: "Chain of custody",
    v:
      "Every hand-off recorded. No gaps. No paper logbooks. Auditors and analytics platforms both want the same thing: complete custody history with timestamps.",
  },
  {
    k: "Mobile testing",
    v:
      "Rugged case, local AI, offline-first. The lab can deploy without depending on a hotel network or a guest Wi-Fi. Sync when authorized.",
  },
  {
    k: "Assets",
    v:
      "Tagged instruments, consumables, and bench locations. Field Scout reads NTAG tags applied by the lab. Authorized Discovery Mode maps approved hardware.",
  },
  {
    k: "Reagents",
    v:
      "Lot numbers, expiry, calibration windows. The context that makes a result defensible and that AI workflows lean on.",
  },
  {
    k: "Instruments",
    v:
      "State, run history, integration mode. Vendor file drop, RS-232 capture, USB-HID scan, owner-declared manifest — whatever the instrument supports.",
  },
];

export default function FieldData() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/ai-pathology"
            className="text-sm text-[#2E8B57] hover:underline mb-4 inline-block"
          >
            ← AI in Pathology &amp; Healthcare
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Field Data
          </h1>
          <p className="text-lg text-[#F8F9FA]/75 mb-2">
            Captured once. Structured for downstream AI.
          </p>
          <p className="text-[#F8F9FA]/60">
            From the field, the bench, or the rugged case in the back of the truck.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Six dimensions LIMS BOX captures
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {fieldDimensions.map((row) => (
              <div
                key={row.k}
                className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5"
              >
                <div className="font-semibold text-[#2E8B57] mb-1">{row.k}</div>
                <div className="text-sm text-[#F8F9FA]/75">{row.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            See it on the bench
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Link
              href="/field-scout"
              className="block rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5 hover:border-[#2E8B57]/60 transition-all"
            >
              <div className="text-lg font-semibold mb-1">Field Scout</div>
              <p className="text-sm text-[#F8F9FA]/70">
                Authorized asset discovery using NTAG tags applied by the lab.
                Demo-only data, no PHI, human approval central.
              </p>
              <span className="text-sm text-[#2E8B57] mt-3 inline-block">
                Open Field Scout →
              </span>
            </Link>
            <Link
              href="/field-scout/flipper"
              className="block rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5 hover:border-[#2E8B57]/60 transition-all"
            >
              <div className="text-lg font-semibold mb-1">
                Authorized Discovery Mode
              </div>
              <p className="text-sm text-[#F8F9FA]/70">
                Approved lab assets, mapped to LIMS workflows. Authorized
                environment only — no hotel devices, no badge systems.
              </p>
              <span className="text-sm text-[#2E8B57] mt-3 inline-block">
                Open Discovery Mode →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/ai-pathology/pdi-and-benchmarking"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
          >
            Next: PDI &amp; Benchmarking →
          </Link>
        </div>
      </section>
    </main>
  );
}
