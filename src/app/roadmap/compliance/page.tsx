import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Compliance Roadmap | LIMS BOX",
  description:
    "LIMS BOX workflow infrastructure supports CLIA-aware, ISO 17025-aligned, and Part 11-compatible lab workflows — not a certification.",
};

export default function ComplianceRoadmapPage() {
  return (
    <main className="bg-[#0a0f1a] min-h-screen text-[#F8F9FA]">
      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3" aria-label="LIMS BOX home">
            <Image src="/brand/lims-box-mark.svg" alt="" width={128} height={128} className="h-10 w-auto" priority />
          </a>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="/#features" className="hover:text-white transition">Features</a>
            <a href="/#field-scout" className="hover:text-white transition">Field Scout</a>
            <a href="/#pricing" className="hover:text-white transition">Pricing</a>
            <a href="/early-access" className="hover:text-white transition">Early Access</a>
            <a href="/partners" className="hover:text-white transition">Partners</a>
          </div>
          <a
            href="/early-access"
            className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white"
          >
            Early Access
          </a>
        </div>
      </nav>

      {/* hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E8B57]/10 border border-[#2E8B57]/20 mb-8 text-sm text-[#2E8B57]">
            Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#F8F9FA]">Compliance Roadmap</h1>
          <p className="text-xl text-[#F8F9FA]/65 max-w-3xl leading-relaxed">
            LIMS BOX is workflow infrastructure that supports your compliance journey — not a certification.
          </p>
          <a href="/" className="inline-block mt-6 text-sm text-[#2E8B57] hover:underline">
            ← Back to lims.bot
          </a>
        </div>
      </section>

      {/* what LIMS BOX does */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">What LIMS BOX Does</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            LIMS BOX is designed to support regulated lab workflows. It provides the tooling labs need to build
            consistent, auditable processes — but does not replace the validation work your lab must perform
            and document itself.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Audit Trails",
                desc: "Every sample event, user action, and result change is logged with a timestamp and user record — ready for your review.",
              },
              {
                title: "Access Control",
                desc: "Role-based access so the right staff see and act on the right data. Reviewers, analysts, and administrators each have appropriate permissions.",
              },
              {
                title: "Workflow Documentation",
                desc: "SOPs, method templates, and step-by-step workflows are configurable per deployment to match your lab's documented procedures.",
              },
              {
                title: "Local / Offline Operation",
                desc: "Full functionality without an internet connection. Deployment-specific hardware means no cloud dependency and complete data sovereignty.",
              },
              {
                title: "Human Approval Steps",
                desc: "Results, chain of custody, and QC decisions require human review and sign-off before records are finalized — by design.",
              },
              {
                title: "Validation Support Services",
                desc: "We provide deployment support, configuration review, and documentation to help your team execute your own validation process.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-5">
                <h3 className="text-[#2E8B57] font-semibold mb-1">{item.title}</h3>
                <p className="text-[#F8F9FA]/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* what LIMS BOX does NOT do */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[#F8F9FA]">What LIMS BOX Does NOT Do</h2>
          <div className="bg-[#E67E22]/5 border border-[#E67E22]/20 rounded-lg p-6">
            <ul className="space-y-4 text-[#F8F9FA]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span>
                  <strong className="text-[#F8F9FA]">LIMS BOX does not certify a lab.</strong>{" "}
                  Accreditation requires an independent, accredited reviewer — not a software vendor.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span>
                  <strong className="text-[#F8F9FA]">LIMS BOX does not replace customer validation.</strong>{" "}
                  Each customer validates its own workflows, SOPs, users, instruments, and reporting process.
                  LIMS BOX supports that work — it does not substitute for it.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span>
                  <strong className="text-[#F8F9FA]">LIMS BOX does not substitute for a qualified reviewer.</strong>{" "}
                  Human oversight by qualified personnel remains required for all compliance-sensitive decisions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span>
                  <strong className="text-[#F8F9FA]">LIMS BOX does not make compliance claims on your behalf.</strong>{" "}
                  Any compliance claim your lab makes is yours — based on your validation, your SOPs, and your
                  documented process.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CLIA-aware */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">How We Support CLIA-Aware Workflows</h2>
          <p className="text-[#F8F9FA]/65 mb-4 leading-relaxed">
            LIMS BOX is designed with CLIA laboratory requirements in mind. The platform includes workflow
            controls for test ordering, result entry, QC review, and chain of custody — all with documented
            audit trails and human approval steps. Customers using LIMS BOX in a CLIA-applicable setting
            validate these workflows themselves as part of their own compliance process.
          </p>
          <p className="text-[#F8F9FA]/45 text-sm leading-relaxed border-l-2 border-[#2E8B57]/30 pl-4">
            &ldquo;CLIA-aware workflows&rdquo; means the tooling is designed to support these requirements —
            not that LIMS BOX is a product that fulfills CLIA requirements on its own.
          </p>
        </div>
      </section>

      {/* ISO 17025-aligned */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">How We Support ISO 17025-Aligned Workflows</h2>
          <p className="text-[#F8F9FA]/65 mb-4 leading-relaxed">
            ISO 17025-aligned means LIMS BOX includes tooling relevant to ISO 17025 laboratory requirements —
            document control, equipment records, method tracking, proficiency testing records, and audit trail
            support. These are workflow supports designed to facilitate a lab&apos;s own ISO 17025 compliance
            work, not a product certification.
          </p>
        </div>
      </section>

      {/* Part 11-compatible */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">How We Support Part 11-Compatible Workflows</h2>
          <p className="text-[#F8F9FA]/65 mb-4 leading-relaxed">
            21 CFR Part 11 governs electronic records and electronic signatures in regulated industries.
            LIMS BOX includes controls for electronic signatures, audit trails, access management, and record
            retention that are designed to support Part 11-compatible processes. Customers in regulated
            industries validate these controls as part of their own compliance work.
          </p>
          <p className="text-[#F8F9FA]/45 text-sm leading-relaxed border-l-2 border-[#2E8B57]/30 pl-4">
            &ldquo;Part 11-compatible support&rdquo; means the feature set is designed to be compatible with
            Part 11 requirements — not that LIMS BOX has been submitted to or reviewed by any regulatory body.
          </p>
        </div>
      </section>

      {/* Deployment + validation services */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Deployment and Validation Support Services</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            Every LIMS BOX deployment includes hands-on configuration support, workflow documentation, and a
            validation support package. Our team works with your lab to configure workflows that match your SOPs,
            document the deployment, and prepare the materials your team needs to execute your own validation
            process.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              {
                label: "Deployment Services",
                desc: "On-site or remote setup, hardware configuration, and workflow configuration to match your lab.",
              },
              {
                label: "Validation Support",
                desc: "Documentation, configuration records, and workflow specification to support your IQ/OQ/PQ process.",
              },
              {
                label: "Ongoing Support",
                desc: "Continuous updates, monitoring, and access to our team as your lab&apos;s needs evolve.",
              },
            ].map((s) => (
              <div key={s.label} className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-5">
                <h3 className="text-[#2E8B57] font-semibold mb-2">{s.label}</h3>
                <p className="text-[#F8F9FA]/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="/early-access"
              className="inline-block px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-lg transition-all text-white"
            >
              Apply for Early Access
            </a>
            <p className="mt-3 text-sm text-[#F8F9FA]/40">
              Questions?{" "}
              <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">
                info@lims.bot
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 px-6 border-t border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <a href="/" className="inline-flex items-center gap-3 mb-2" aria-label="LIMS BOX home">
              <Image src="/brand/lims-box-mark.svg" alt="" width={128} height={128} className="h-10 w-auto" />
            </a>
            <div className="text-sm text-[#F8F9FA]/30">A TombStone Dash LLC product</div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">Home</a>
            <a href="/roadmap/compliance" className="hover:text-[#2E8B57] transition">Compliance</a>
            <a href="/roadmap/senaite" className="hover:text-[#2E8B57] transition">SENAITE</a>
            <a href="/roadmap/instrument-interfaces" className="hover:text-[#2E8B57] transition">Instruments</a>
            <a href="/roadmap/regulatory" className="hover:text-[#2E8B57] transition">Regulatory</a>
            <a href="/partners" className="hover:text-[#2E8B57] transition">Partners</a>
            <a href="/early-access" className="hover:text-[#2E8B57] transition">Early Access</a>
            <a href="mailto:info@lims.bot" className="hover:text-[#2E8B57] transition">info@lims.bot</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
