import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Instrument Interface Roadmap | LIMS BOX",
  description:
    "Instrument interfaces in LIMS BOX are scoped per deployment, validated by the customer, and mapped per instrument. Current demo uses mock assets.",
};

export default function InstrumentInterfacesPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/20 mb-8 text-sm text-[#E67E22]">
            Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#F8F9FA]">
            Instrument Interface Roadmap
          </h1>
          <p className="text-xl text-[#F8F9FA]/65 max-w-3xl leading-relaxed">
            Each lab has its own instrument mix. Interfaces are scoped per deployment, validated by the
            customer, and mapped per instrument — not bundled out of the box.
          </p>
          <a href="/" className="inline-block mt-6 text-sm text-[#2E8B57] hover:underline">
            ← Back to lims.bot
          </a>
        </div>
      </section>

      {/* demo state */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">How Instrument Interfaces Work Today (Demo)</h2>
          <div className="bg-[#E67E22]/5 border border-[#E67E22]/20 rounded-lg p-6 mb-6">
            <p className="text-[#E67E22] font-semibold mb-2">Demo Mode</p>
            <ul className="space-y-2 text-[#F8F9FA]/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#E67E22] mt-0.5 shrink-0">→</span>
                The current LIMS BOX demo uses <strong className="text-[#F8F9FA]">mock assets and Field Scout workflow examples</strong> — not live instrument data.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E67E22] mt-0.5 shrink-0">→</span>
                No real instrument results are captured or transmitted in the demo environment.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E67E22] mt-0.5 shrink-0">→</span>
                Field Scout demo tags use mock NFC identifiers linked to simulated lab assets.
              </li>
            </ul>
          </div>
          <p className="text-[#F8F9FA]/65 leading-relaxed">
            This demo exists to show how LIMS BOX workflow demonstrations work — not to represent a
            production-ready instrument integration. Real instrument work is scoped separately per deployment.
          </p>
        </div>
      </section>

      {/* real deployment */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">How They Work in a Real Deployment</h2>
          <p className="text-[#F8F9FA]/65 mb-8 leading-relaxed">
            In a production LIMS BOX deployment, instrument interfaces are scoped during the configuration
            phase. Each interface is mapped to the specific instrument model, data format, and result
            structure your lab uses. This work requires customer authorization and is validated by the
            customer before going live.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Per-Instrument Scoping",
                desc: "Every instrument integration is defined per deployment. There is no one-size-fits-all connector — each lab's instrument mix is mapped individually.",
              },
              {
                title: "Customer Authorization Required",
                desc: "Instrument interface work begins only after the customer authorizes the scope, instruments, and data flows in writing.",
              },
              {
                title: "Customer Validation",
                desc: "After configuration, the customer validates each interface — confirming that results are captured correctly before production use.",
              },
              {
                title: "Data Format Mapping",
                desc: "LIMS BOX maps each instrument's output format (ASTM, HL7, CSV, proprietary) to the SENAITE data model per instrument.",
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

      {/* field scout */}
      <section className="py-16 px-6 bg-[#2C3E50]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">
            Field Scout — Discovery and Asset Tracking
          </h2>
          <p className="text-[#F8F9FA]/65 mb-6 leading-relaxed">
            Field Scout is an authorized asset discovery and inventory tracking tool. It uses NFC tags
            (NTAG215) affixed to instruments, consumables, and bench locations to enable fast check-ins,
            inventory status updates, and chain of custody logging — without requiring a LIS plugin or
            network reconfiguration.
          </p>
          <div className="bg-[#2E8B57]/5 border border-[#2E8B57]/20 rounded-lg p-5 mb-6">
            <p className="text-[#2E8B57] font-semibold mb-2">Important clarification</p>
            <p className="text-[#F8F9FA]/70 text-sm leading-relaxed">
              Field Scout and the Flipper Zero integration are <strong className="text-[#F8F9FA]">authorized asset discovery and tracking support tools</strong> — not network scanning, security testing, or unauthorized access tools. Every tag interaction is an authorized, lab-managed workflow. No unauthorized network access, no security probing, no data interception.
            </p>
          </div>
          <a
            href="/field-scout"
            className="inline-block px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white"
          >
            See Field Scout in action
          </a>
        </div>
      </section>

      {/* per-instrument mapping */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-[#F8F9FA]">Per-Instrument Mapping Process</h2>
          <ol className="space-y-4 text-[#F8F9FA]/65">
            {[
              "Customer provides an instrument list with model numbers and current data output formats.",
              "LIMS BOX team reviews each instrument and scopes the interface work required.",
              "Customer authorizes the scope in writing before any interface development begins.",
              "Interface is built and tested in a staging environment using the customer's actual instrument output.",
              "Customer validates the interface end-to-end before production use.",
              "Interface goes live. Customer maintains validation records.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="text-3xl font-bold text-[#2E8B57]/20 shrink-0 leading-none">{String(i + 1).padStart(2, "0")}</span>
                <p className="leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <a
              href="/early-access"
              className="inline-block px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-lg transition-all text-white"
            >
              Discuss your instrument needs
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
