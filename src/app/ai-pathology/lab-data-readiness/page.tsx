import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lab Data Readiness for AI — LIMS BOX",
  description:
    "AI in the lab needs clean, structured, complete data. Here's what 'AI-ready' means at the bench — and how LIMS BOX gets you there.",
};

export default function LabDataReadiness() {
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
            Lab Data Readiness
          </h1>
          <p className="text-lg text-[#F8F9FA]/75 mb-2">
            AI is only as good as the data it sees.
          </p>
          <p className="text-[#F8F9FA]/60">
            Most lab data isn&apos;t ready. The bench knows it.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            What &ldquo;AI-ready&rdquo; means in a lab
          </h2>
          <p className="text-[#F8F9FA]/75 mb-6 leading-relaxed">
            AI-ready lab data has four properties: it is{" "}
            <strong>structured</strong>, <strong>complete</strong>,{" "}
            <strong>contextual</strong>, and <strong>auditable</strong>. Most
            lab data, today, is missing at least two of those. Sample logs in
            spreadsheets. Chain of custody on clipboards. Reagent lots in
            someone&apos;s notebook. Instrument export files in a folder
            nobody backs up.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                k: "Structured",
                v:
                  "Fields, types, schemas — not free-text fields and email threads.",
              },
              {
                k: "Complete",
                v:
                  "Sample, asset, operator, reagent lot, time, location — captured at the event, not reconstructed later.",
              },
              {
                k: "Contextual",
                v:
                  "What method was running, which instrument, which calibration window, which SOP version.",
              },
              {
                k: "Auditable",
                v:
                  "Every change traceable to a user, a role, a timestamp, and an approval state.",
              },
            ].map((row) => (
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
            Where LIMS BOX fits
          </h2>
          <p className="text-[#F8F9FA]/75 mb-4 leading-relaxed">
            LIMS BOX captures the upstream events — scan-in, asset state,
            field notes, reagent lot, instrument run, operator approval —
            into a single structured registry. That registry is what you feed
            to your analytics platform, your benchmarking platform, your
            audit prep, and (when you&apos;re ready) your AI workflows.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            We don&apos;t replace your LIS or LIMS. We make sure the data
            arriving at it — and at the analytics platforms downstream — is
            actually usable.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/ai-pathology/human-in-the-loop"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
          >
            Next: Human in the Loop →
          </Link>
        </div>
      </section>
    </main>
  );
}
