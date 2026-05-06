import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Built on SENAITE — Open-Source LIMS Foundation | LIMS BOX",
  description:
    "LIMS BOX builds hardware, deployment, LIMS BOT, and Field Scout around an open-source LIMS foundation. We don't sell SENAITE — we build the appliance around it.",
};

export default function SenaiteRoadmapPage() {
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
            Open-Source Foundation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#F8F9FA]">
            Built on SENAITE — Open-Source LIMS Foundation
          </h1>
          <p className="text-xl text-[#F8F9FA]/65 max-w-3xl leading-relaxed">
            SENAITE is a globally maintained open-source LIMS with 10+ years of active development. LIMS BOX
            builds the appliance, the local AI assistant (LIMS BOT), and the deployment model around it —
            we don&apos;t sell SENAITE itself.
          </p>
          <a href="/" className="inline-block mt-6 text-sm text-[#2E8B57] hover:underline">
            ← Back to lims.bot
          </a>
        </div>
      </section>

      {/* what is SENAITE */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">What Is SENAITE?</h2>
          <p className="text-[#F8F9FA]/65 mb-4 leading-relaxed">
            SENAITE is an open-source Laboratory Information Management System (LIMS) built on the Plone
            content management platform. It is actively maintained by a global community of contributors and
            is licensed under the GPL. Labs around the world use SENAITE for sample management, QC workflows,
            result reporting, and chain of custody — at no software cost.
          </p>
          <p className="text-[#F8F9FA]/65 mb-6 leading-relaxed">
            Because SENAITE is open-source, it is freely available to anyone. LIMS BOX does not sell SENAITE
            as software — we build the deployment model, hardware, support structure, and local AI layer on
            top of it.
          </p>
          <a
            href="https://www.senaite.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 border border-[#2E8B57]/40 hover:border-[#2E8B57] rounded-lg text-sm text-[#2E8B57] transition"
          >
            Visit senaite.com ↗
          </a>
        </div>
      </section>

      {/* what LIMS BOX adds */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">What LIMS BOX Adds</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            SENAITE is powerful software — but deploying it for a real lab takes hardware, configuration,
            offline support, training, and ongoing maintenance. That&apos;s exactly what LIMS BOX provides.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Rugged Hardware Appliance",
                desc: "Pre-configured field case with dual Mac Studios, ready to ship to any lab environment — no IT setup required.",
              },
              {
                title: "Local / Offline Operation",
                desc: "SENAITE running fully offline. No cloud dependency. Complete data sovereignty for field labs, remote sites, and regulated environments.",
              },
              {
                title: "LIMS BOT — Local AI Assistant",
                desc: "A local AI layer trained on your lab's SOPs, methods, and instrument manuals. Natural language queries, offline, with no data leaving the appliance.",
              },
              {
                title: "Field Scout",
                desc: "Asset discovery and inventory tracking via NFC tags. Authorized discovery and check-in workflows — not a network scanning tool.",
              },
              {
                title: "Customer-Specific Configuration",
                desc: "Workflows, method templates, reporting formats, and user roles configured per deployment to match your lab's actual process.",
              },
              {
                title: "Support and Deployment Services",
                desc: "Ongoing updates, monitoring, and direct access to our team. Not a license fee — a full deployment and support model.",
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

      {/* our relationship with SENAITE */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Our Relationship with SENAITE</h2>
          <div className="bg-[#2E8B57]/5 border border-[#2E8B57]/20 rounded-lg p-6 mb-6">
            <p className="text-[#F8F9FA]/80 text-lg italic leading-relaxed">
              &ldquo;In touch with SENAITE maintainers, they&apos;re supportive of the idea.&rdquo;
            </p>
          </div>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            We respect the work the SENAITE open-source community has done. We believe deployment models like
            LIMS BOX can help bring SENAITE to labs that would never have the resources to self-host and
            maintain it — which is good for the ecosystem and good for labs. We are building in that spirit.
          </p>
        </div>
      </section>

      {/* open to partnerships */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Open to Partnerships</h2>
          <p className="text-[#F8F9FA]/65 mb-6 leading-relaxed">
            We are open to partnerships with anyone who stands behind resilient, accessible lab
            infrastructure.
          </p>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            This includes open-source LIMS contributors, instrument vendors, public health organizations,
            lab consultants, and accreditation specialists. If you&apos;re working on making lab informatics
            more accessible and more reliable, we want to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/partners"
              className="inline-block px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white"
            >
              See our partnership page
            </a>
            <a
              href="mailto:info@lims.bot"
              className="inline-block px-6 py-3 border border-[#1E3A5F] hover:border-[#2E8B57] rounded-lg font-semibold text-sm transition-all text-[#F8F9FA]"
            >
              Contact us
            </a>
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
