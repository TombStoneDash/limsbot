import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI in Pathology & Healthcare — LIMS BOX",
  description:
    "AI in pathology starts with better laboratory data. LIMS BOX is the AI-ready lab data capture and documentation layer for field, asset, sample, reagent, and workflow events. LIS/LIMS-agnostic.",
};

const subroutes = [
  {
    href: "/ai-pathology/lab-data-readiness",
    title: "Lab Data Readiness",
    desc:
      "Why AI in the lab needs clean, structured, complete data — and what 'AI-ready' actually means at the bench.",
  },
  {
    href: "/ai-pathology/human-in-the-loop",
    title: "Human in the Loop",
    desc:
      "AI drafts. Humans approve. Audit trails record. The pattern that makes lab AI defensible.",
  },
  {
    href: "/ai-pathology/pathology-operations",
    title: "Pathology Operations",
    desc:
      "Turnaround time, sample movement, staffing visibility, workload trends — operational analytics for clinical and anatomic pathology.",
  },
  {
    href: "/ai-pathology/field-data",
    title: "Field Data",
    desc:
      "Field collection, chain-of-custody, mobile testing, assets, reagents, instruments — captured once, structured for downstream AI.",
  },
  {
    href: "/ai-pathology/pdi-and-benchmarking",
    title: "PDI & Benchmarking",
    desc:
      "Lab analytics platforms like ASCP PDI need clean upstream data. LIMS BOX is complementary to benchmarking — not competitive with it.",
  },
];

export default function AIPathologyHub() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      {/* Hero */}
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E8B57]/10 border border-[#2E8B57]/30 mb-6 text-sm text-[#2E8B57]">
            AI in Pathology &amp; Healthcare
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            AI in pathology starts with{" "}
            <span className="gradient-text">better laboratory data.</span>
          </h1>
          <p className="text-lg text-[#F8F9FA]/75 max-w-3xl mb-6">
            LIMS BOX helps labs capture field, asset, sample, and workflow data
            in structured, human-reviewed form so future AI systems have
            cleaner inputs, stronger audit trails, and safer operational
            context.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mb-6">
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> LIS/LIMS-agnostic
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Human approval required
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Local-first, offline-capable
            </div>
          </div>
          <p className="text-xs text-[#F8F9FA]/45 max-w-3xl">
            LIMS BOX is not a diagnostic AI system. It is the AI-ready lab data
            capture layer. Clinical interpretation always stays with qualified
            personnel.
          </p>
        </div>
      </section>

      {/* Positioning */}
      <section className="px-6 py-16 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            The data layer, not the model layer
          </h2>
          <p className="text-[#F8F9FA]/75 max-w-3xl mb-6 leading-relaxed">
            Most AI conversations focus on models. LIMS BOX focuses on the data
            layer: scan events, sample movement, reagent context, asset state,
            field collection notes, and human-approved documentation. Better
            inputs create better audit trails, better analytics, and safer AI
            workflows.
          </p>
          <p className="text-[#F8F9FA]/65 max-w-3xl leading-relaxed">
            Whether your environment calls it LIS or LIMS, the same pressures
            apply: workforce shortages, certification scrutiny, data
            stewardship expectations, and the steady arrival of operational
            AI. The labs that get value out of those models will be the labs
            whose upstream data was already structured and trustworthy when
            the models showed up.
          </p>
        </div>
      </section>

      {/* Sub-routes grid */}
      <section className="px-6 py-16 border-b border-[#1E3A5F]/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Explore the AI-ready lab data layer
          </h2>
          <p className="text-[#F8F9FA]/60 mb-8 max-w-3xl">
            Five lenses on the same idea: how lab data should be captured,
            reviewed, and structured so AI and analytics platforms can do
            their job downstream.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subroutes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-6 hover:border-[#2E8B57]/60 transition-all"
              >
                <div className="text-xl font-semibold mb-2 text-[#F8F9FA]">
                  {r.title}
                </div>
                <p className="text-sm text-[#F8F9FA]/70 leading-relaxed mb-4">
                  {r.desc}
                </p>
                <span className="text-sm text-[#2E8B57]">Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Scope statement */}
      <section className="px-6 py-16 border-b border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
          <h3 className="text-xl font-bold text-[#E67E22] mb-3">
            What LIMS BOX is — and isn&apos;t
          </h3>
          <ul className="space-y-2 text-sm text-[#F8F9FA]/85 list-disc list-inside">
            <li>
              <strong>Is:</strong> a lab data capture and documentation layer
              for field, asset, sample, reagent, and workflow events.
            </li>
            <li>
              <strong>Is:</strong> LIS/LIMS-agnostic, designed to feed cleaner
              upstream data into the analytics and AI platforms a lab already
              uses.
            </li>
            <li>
              <strong>Is:</strong> human-in-the-loop by default — AI drafts,
              human approves, audit trail records.
            </li>
            <li>
              <strong>Is not:</strong> a diagnostic AI system or a clinical
              interpretation engine.
            </li>
            <li>
              <strong>Is not:</strong> a regulated medical device under FDA
              authority.
            </li>
            <li>
              <strong>Is not:</strong> a partner of, or affiliated with, any
              named analytics or benchmarking platform unless explicitly
              stated. Privacy and security requirements are scoped per
              deployment.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Explore AI-ready lab workflows
          </h2>
          <p className="text-[#F8F9FA]/70 mb-6">
            Pilot deployments start around $5,000. We&apos;re currently
            selecting 5 pilot labs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/early-access"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
            >
              Apply for Early Access
            </Link>
            <Link
              href="/field-scout/flipper"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#1E3A5F]/60 hover:border-[#2E8B57]/60 rounded-lg font-semibold transition-all text-[#F8F9FA]"
            >
              See Authorized Discovery
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
