import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pathology Operations — LIMS BOX",
  description:
    "Turnaround time, sample movement, staffing visibility, workload trends. Operational analytics for clinical and anatomic pathology — built on cleaner upstream data.",
};

const opsSignals = [
  {
    k: "Turnaround time (TAT)",
    v:
      "From accession to verified result. Where does it stall? Which step, which instrument, which shift. AI can spot patterns; the lab acts on them.",
  },
  {
    k: "Sample movement",
    v:
      "Where each specimen is, right now. Bench A. Cold storage. Awaiting verification. Lost-in-tracking is the most expensive thing in a busy lab.",
  },
  {
    k: "Staffing visibility",
    v:
      "Who ran what, when. Workload distribution. Backlog by station. The recruitment and retention story starts with the numbers.",
  },
  {
    k: "Workload trends",
    v:
      "Volume by panel, by referrer, by week. The trend that tells you whether to hire or to automate.",
  },
  {
    k: "Reagent and consumable context",
    v:
      "Which lot, which kit, which calibration. The lineage that QA needs and that AI workflows depend on.",
  },
  {
    k: "Asset and instrument state",
    v:
      "Calibration windows, maintenance flags, planned downtime. Operational AI can route around problems if it can see them.",
  },
];

export default function PathologyOperations() {
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
            Pathology Operations
          </h1>
          <p className="text-lg text-[#F8F9FA]/75">
            Operational analytics is what wins the next decade in the lab.
            That starts with the data.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            The signals operational AI actually needs
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {opsSignals.map((row) => (
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
            LIMS BOX is the bench-side capture layer. Field Scout reads asset
            tags. Authorized Discovery Mode maps approved lab assets to
            workflows. The local LIMS BOT drafts the next operational step.
            Humans approve. The audit trail records.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            Whether the analytics platform downstream is ASCP PDI, an
            in-house data warehouse, a hospital-wide dashboard, or a future
            AI workflow we haven&apos;t named yet, the input quality is the
            same: structured events, captured at the moment they happened,
            with human approval recorded.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/ai-pathology/field-data"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
          >
            Next: Field Data →
          </Link>
        </div>
      </section>
    </main>
  );
}
