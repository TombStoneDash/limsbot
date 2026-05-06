import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Partnerships | LIMS BOX",
  description:
    "LIMS BOX is open to partnerships with labs, consultants, open-source LIMS contributors, instrument vendors, public health organizations, and anyone working toward resilient, accessible lab infrastructure.",
};

export default function PartnersPage() {
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
            <a href="/partners" className="text-[#2E8B57]">Partners</a>
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
            Partnerships
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#F8F9FA]">Partnerships</h1>
          <p className="text-xl text-[#F8F9FA]/65 max-w-3xl leading-relaxed">
            Resilient, accessible lab infrastructure is bigger than any single product. We are open to
            partnerships with anyone working in that direction.
          </p>
          <a href="/" className="inline-block mt-6 text-sm text-[#2E8B57] hover:underline">
            ← Back to lims.bot
          </a>
        </div>
      </section>

      {/* open statement */}
      <section className="py-12 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2E8B57]/5 border border-[#2E8B57]/20 rounded-lg p-6">
            <p className="text-[#F8F9FA]/80 text-lg leading-relaxed">
              We are open to partnerships with anyone who stands behind resilient, accessible lab
              infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* who we want to hear from */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Who We Want to Hear From</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            We are actively looking for partners across several categories:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Laboratories",
                desc: "Environmental, forensic, food safety, cannabis, clinical research, public health, and contract labs — any lab that needs a better workflow foundation.",
              },
              {
                title: "LIMS Consultants",
                desc: "Independent consultants who work with labs on LIMS selection, validation, and implementation. If you place or support SENAITE or similar open-source LIMS, we want to talk.",
              },
              {
                title: "Open-Source LIMS Contributors",
                desc: "Developers and contributors to SENAITE, BIKA Lab Systems, or related open-source lab software projects. We want to support the ecosystem, not bypass it.",
              },
              {
                title: "Instrument Vendors",
                desc: "Vendors who want to provide tested, documented instrument interfaces for LIMS BOX deployments. Integration partnerships must be authorized and documented.",
              },
              {
                title: "Public Health Organizations",
                desc: "State, federal, and international public health labs, outbreak response teams, and field epidemiology programs that need portable, offline-capable LIMS.",
              },
              {
                title: "Accreditation Experts",
                desc: "Specialists in ISO 17025, A2LA, COLA, CAP, or other accreditation programs who work with labs on their compliance journeys.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-5">
                <h3 className="text-[#2E8B57] font-semibold mb-2">{item.title}</h3>
                <p className="text-[#F8F9FA]/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how to reach out */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">How to Reach Out</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            The fastest path is a direct email. Tell us who you are, what you do, and why you think
            there&apos;s a fit. No deck required.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-6">
              <h3 className="text-[#F8F9FA] font-semibold mb-2">Email</h3>
              <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline text-lg font-medium">
                info@lims.bot
              </a>
              <p className="text-[#F8F9FA]/50 text-sm mt-2">
                Reaches Hudson Taylor directly. We respond within 48 hours.
              </p>
            </div>
            <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-6">
              <h3 className="text-[#F8F9FA] font-semibold mb-2">Early Access Form</h3>
              <a
                href="/early-access"
                className="inline-block px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white mt-1"
              >
                Apply here →
              </a>
              <p className="text-[#F8F9FA]/50 text-sm mt-3">
                Use the early access form if you&apos;re also interested in a pilot deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* what we won't do */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">
            What We Won&apos;t Do Without Your Written Approval
          </h2>
          <div className="bg-[#1E3A5F]/20 border border-[#1E3A5F]/40 rounded-lg p-6">
            <p className="text-[#F8F9FA]/70 leading-relaxed">
              We will not name you as a partner publicly without your explicit written approval. This
              applies to all individuals, organizations, labs, vendors, and open-source projects. If
              we&apos;ve had a conversation, been supportive of each other&apos;s work, or are in
              discussions — that does not mean we will represent you as a partner on this site or in any
              external communications without your sign-off.
            </p>
            <p className="text-[#F8F9FA]/70 leading-relaxed mt-4">
              We take this seriously. If you see your name or organization referenced incorrectly on this
              site, contact us at{" "}
              <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">
                info@lims.bot
              </a>{" "}
              and we will correct it immediately.
            </p>
          </div>
        </div>
      </section>

      {/* ISV note */}
      <section className="py-12 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-6">
            <p className="text-[#F8F9FA]/65 text-sm leading-relaxed">
              <strong className="text-[#F8F9FA]">NVIDIA Connect ISV:</strong> NVIDIA Connect approved us as
              an ISV last month. This represents independent software vendor recognition — not a joint
              development agreement or strategic partnership with NVIDIA.
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
