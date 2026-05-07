import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lab Analytics & Benchmarking — LIMS BOX",
  description:
    "Lab analytics and benchmarking platforms — including ASCP's Performance & Diagnostics Insights (PDI) — need clean upstream data. LIMS BOX is complementary to those platforms, not competitive with them. No partnership claim.",
};

export default function PDIBenchmarking() {
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
            Lab Analytics &amp; Benchmarking
          </h1>
          <p className="text-lg text-[#F8F9FA]/75 mb-2">
            The trend is real. Cleaner upstream data is what makes it work.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            The shift toward lab analytics platforms
          </h2>
          <p className="text-[#F8F9FA]/75 mb-4 leading-relaxed">
            Clinical and anatomic pathology laboratories are increasingly
            adopting analytics and benchmarking platforms — tools that ingest
            laboratory data and turn it into operational, performance, and
            improvement insights. The American Society for Clinical Pathology
            (ASCP) launched one such platform, Performance &amp; Diagnostics
            Insights (PDI), framed around exactly that goal.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            That trend is healthy for the lab. Visibility, benchmarking, and
            workforce data have been undersupplied for years. The harder
            question, the one most labs run into about ninety days into
            adoption, is the same: <em>what does the analytics platform
            actually see?</em>
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            The upstream data problem
          </h2>
          <p className="text-[#F8F9FA]/75 mb-4 leading-relaxed">
            Analytics platforms ingest what the LIS or LIMS exports. If
            chain-of-custody is on paper, the platform doesn&apos;t see it. If
            field samples are captured in spreadsheets, the platform
            doesn&apos;t see them. If reagent lots and operator IDs are
            optional fields half the lab skips, the trends the platform
            produces are partial.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            That&apos;s an upstream data problem, not an analytics platform
            problem. And it&apos;s where LIMS BOX is designed to help.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            LIMS BOX is complementary
          </h2>
          <p className="text-[#F8F9FA]/75 mb-4 leading-relaxed">
            LIMS BOX is the bench-side capture layer. Field Scout, Authorized
            Discovery Mode, and the local LIMS BOT capture sample, asset,
            reagent, instrument, and workflow events with operator approval
            and audit trail. That structured data flows into your LIS or
            LIMS, and from there into your analytics platform of choice.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            We help lab analytics and benchmarking platforms — including
            ASCP&apos;s PDI — by improving the quality and completeness of
            the upstream signal they depend on. We don&apos;t replace them.
            We don&apos;t compete with them. We make them more accurate.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
          <h3 className="text-xl font-bold text-[#E67E22] mb-3">
            Disclosure
          </h3>
          <ul className="space-y-2 text-sm text-[#F8F9FA]/85 list-disc list-inside">
            <li>
              LIMS BOX has <strong>no formal partnership</strong> with ASCP,
              PDI, or any other analytics or benchmarking platform.
            </li>
            <li>
              Mentions of named platforms are <strong>illustrative only</strong>,
              to describe the broader market trend toward lab analytics.
            </li>
            <li>
              Each LIMS BOX deployment defines its own data flow,
              integration pattern, and review process. Privacy and security
              requirements are scoped per deployment.
            </li>
            <li>
              LIMS BOX is not a clinical decision tool. Clinical
              interpretation stays with qualified personnel.
            </li>
          </ul>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want a walkthrough?
          </h2>
          <p className="text-[#F8F9FA]/70 mb-6">
            We&apos;re currently selecting 5 pilot labs. Pilot deployments
            start around $5,000.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/early-access"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
            >
              Apply for Early Access
            </Link>
            <Link
              href="/ai-pathology"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#1E3A5F]/60 hover:border-[#2E8B57]/60 rounded-lg font-semibold transition-all text-[#F8F9FA]"
            >
              Back to AI in Pathology
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
