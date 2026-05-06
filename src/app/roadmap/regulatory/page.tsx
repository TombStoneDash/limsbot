import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Regulatory Boundary | LIMS BOX",
  description:
    "LIMS BOX is lab workflow infrastructure — not an IVD, not a clinical decision system, not a patient care recommendation engine. Human review is required.",
};

export default function RegulatoryPage() {
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
          <a href="/early-access" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white">
            Early Access
          </a>
        </div>
      </nav>

      {/* hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E8B57]/10 border border-[#2E8B57]/20 mb-8 text-sm text-[#2E8B57]">
            Regulatory Boundary
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#F8F9FA]">Regulatory Boundary</h1>
          <p className="text-xl text-[#F8F9FA]/65 max-w-3xl leading-relaxed">
            LIMS BOX is lab workflow infrastructure. It is not an IVD, not a clinical decision system, and
            not a patient care recommendation engine. Human review remains required.
          </p>
          <a href="/" className="inline-block mt-6 text-sm text-[#2E8B57] hover:underline">← Back to lims.bot</a>
        </div>
      </section>

      {/* what LIMS BOX is */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">What LIMS BOX Is</h2>
          <p className="text-[#F8F9FA]/65 mb-6 leading-relaxed">
            LIMS BOX is <strong className="text-[#F8F9FA]">laboratory workflow infrastructure</strong>. It
            manages sample tracking, chain of custody, result entry, QC workflows, audit trails, and
            reporting — the operational layer that keeps a lab&apos;s data organized, traceable, and
            audit-ready.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Sample Tracking", desc: "End-to-end sample lifecycle management from receipt to final report, with full chain of custody." },
              { title: "QC Workflow Support", desc: "QC checks, control charts, and holding time alerts designed to support human review." },
              { title: "Audit Trail Infrastructure", desc: "Every user action, result change, and approval logged with timestamp — ready for your reviewer." },
              { title: "Reporting and Documentation", desc: "Configurable result reports, certificates of analysis, and compliance documentation support." },
            ].map((item) => (
              <div key={item.title} className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-5">
                <h3 className="text-[#2E8B57] font-semibold mb-1">{item.title}</h3>
                <p className="text-[#F8F9FA]/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* what LIMS BOX is NOT */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[#F8F9FA]">What LIMS BOX Is NOT</h2>
          <div className="bg-[#E67E22]/5 border border-[#E67E22]/20 rounded-lg p-6">
            <ul className="space-y-4 text-[#F8F9FA]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span><strong className="text-[#F8F9FA]">Not an IVD (in-vitro testing device).</strong>{" "}
                LIMS BOX does not perform tests, generate results, or substitute for laboratory instrumentation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span><strong className="text-[#F8F9FA]">Not a clinical decision system.</strong>{" "}
                LIMS BOX does not interpret results, flag patient risk, or provide clinical guidance of any kind.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span><strong className="text-[#F8F9FA]">Not a patient care recommendation engine.</strong>{" "}
                LIMS BOX has no patient-facing functions and does not output care recommendations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5 shrink-0">✗</span>
                <span><strong className="text-[#F8F9FA]">Not a regulated device under FDA authority.</strong>{" "}
                LIMS BOX is workflow infrastructure software. It is not submitted to or reviewed by the FDA as a regulated device.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* human review */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Human Review Requirement</h2>
          <p className="text-[#F8F9FA]/65 mb-4 leading-relaxed">
            Every result, QC decision, and compliance-sensitive action in LIMS BOX requires human review
            and approval before it is finalized. The system is designed to support human reviewers —
            not to replace them.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            Qualified laboratory personnel remain responsible for all result interpretation, QC acceptance,
            and compliance decisions. LIMS BOX provides the infrastructure to support that work; it does
            not automate or replace professional judgment.
          </p>
        </div>
      </section>

      {/* documentation and audit */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Documentation and Audit Trail Support</h2>
          <p className="text-[#F8F9FA]/65 mb-6 leading-relaxed">
            LIMS BOX&apos;s regulatory roadmap focuses on documentation, audit trails, workflow validation
            support, and privacy/security. These are the building blocks labs need to support their own
            compliance programs — whatever the applicable standard.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Immutable Audit Logs", desc: "Every action logged with user, timestamp, and before/after state. Cannot be edited or deleted." },
              { title: "Electronic Signatures", desc: "Configurable e-signature steps for result approval, QC acceptance, and chain of custody handoffs." },
              { title: "Record Retention", desc: "Configurable retention policies with local backup and export support." },
            ].map((item) => (
              <div key={item.title} className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-5">
                <h3 className="text-[#2E8B57] font-semibold mb-1">{item.title}</h3>
                <p className="text-[#F8F9FA]/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* privacy + security */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Privacy and Security Roadmap</h2>
          <p className="text-[#F8F9FA]/65 mb-4 leading-relaxed">
            Because LIMS BOX runs fully locally, customer data never leaves the deployment appliance unless
            the customer explicitly exports it. There is no cloud data store, no third-party data sharing,
            and no telemetry that captures sample or result data.
          </p>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            Privacy and security controls are scoped per deployment. Customers requiring specific privacy
            frameworks (e.g., HIPAA business associate considerations) work with our team to confirm the
            right deployment configuration for their environment.
          </p>
        </div>
      </section>

      {/* customer-specific compliance */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Customer-Specific Compliance Support</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            No two labs have identical compliance requirements. LIMS BOX is designed to be configured per
            deployment — not to be a generic, lowest-common-denominator system. Our team works with each
            customer to understand their applicable standards and configure workflows that support their
            specific compliance needs.
          </p>
          <div className="text-center">
            <a href="/early-access" className="inline-block px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-lg transition-all text-white">
              Discuss your compliance needs
            </a>
            <p className="mt-3 text-sm text-[#F8F9FA]/40">
              Questions?{" "}
              <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a>
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
