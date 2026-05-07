import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Human in the Loop — LIMS BOX",
  description:
    "AI drafts. Humans approve. Audit trails record. The pattern that makes lab AI defensible — for compliance, for staff trust, and for the long run.",
};

export default function HumanInTheLoop() {
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
            Human in the Loop
          </h1>
          <p className="text-lg text-[#F8F9FA]/75 mb-2">
            AI drafts. Humans approve. Audit trails record.
          </p>
          <p className="text-[#F8F9FA]/60">
            That sequence is the whole product philosophy.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Three steps. In this order. Always.
          </h2>
          <div className="space-y-5">
            {[
              {
                n: "1",
                k: "AI drafts",
                v:
                  "The local model proposes the next workflow step — log this scan, attach this reagent lot, schedule this calibration check, route this sample. The draft is just a draft.",
              },
              {
                n: "2",
                k: "Human approves",
                v:
                  "A qualified operator reviews the draft, edits it, approves it, or rejects it. The operator&apos;s role and credentials are recorded with the action. No silent autopilot.",
              },
              {
                n: "3",
                k: "Audit trail records",
                v:
                  "Every draft, every edit, every approval, every rejection becomes a row in the audit trail — with user, role, timestamp, and reason. The record is what an auditor reads later.",
              },
            ].map((row) => (
              <div
                key={row.n}
                className="rounded-lg border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-5 flex gap-4"
              >
                <div className="text-3xl font-bold text-[#2E8B57] leading-none">
                  {row.n}
                </div>
                <div>
                  <div className="font-semibold text-[#F8F9FA] mb-1">
                    {row.k}
                  </div>
                  <div
                    className="text-sm text-[#F8F9FA]/75"
                    dangerouslySetInnerHTML={{ __html: row.v }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Why this pattern matters in pathology
          </h2>
          <p className="text-[#F8F9FA]/75 mb-4 leading-relaxed">
            Pathology is one of the most consequence-heavy environments in
            healthcare. A draft proposed by software is fine. A write executed
            by software, against a clinical record, with no human review, is
            not.
          </p>
          <p className="text-[#F8F9FA]/75 mb-4 leading-relaxed">
            Human-in-the-loop is how lab AI becomes defensible — for
            compliance, for staff trust, and for the long run. It also keeps
            the lab&apos;s expertise where it belongs: with the trained
            humans who run the bench.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed text-sm italic">
            LIMS BOX is not a clinical decision tool. Clinical interpretation
            stays with qualified personnel, every time, no exceptions.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/ai-pathology/pathology-operations"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
          >
            Next: Pathology Operations →
          </Link>
        </div>
      </section>
    </main>
  );
}
