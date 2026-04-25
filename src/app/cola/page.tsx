import type { Metadata } from "next";
import VideoSection from "@/components/VideoSection";

const CALENDLY_BASE =
  process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/hudtaylor/30min";

const CALENDLY_COLA = `${CALENDLY_BASE}${
  CALENDLY_BASE.includes("?") ? "&" : "?"
}utm_source=cola2026`;

export const metadata: Metadata = {
  title: "THE LIMS BOX at COLA Forum 2026 — Nashville, May 6–8",
  description:
    "Meet the team building the LIMS purpose-built for COLA-accredited labs. Book 15 minutes at the COLA Annual Laboratory Enrichment Forum, Sheraton Music City, May 6–8.",
  alternates: { canonical: "https://lims.bot/cola" },
  openGraph: {
    title: "THE LIMS BOX at COLA Forum 2026 — Nashville, May 6–8",
    description:
      "The LIMS purpose-built for COLA-accredited labs. Book 15 minutes in Nashville.",
    url: "https://lims.bot/cola",
    siteName: "THE LIMS BOX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ColaPage() {
  return (
    <main>
      {/* nav — matches site nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold gradient-text">
            THE LIMS BOX
          </a>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="/#features" className="hover:text-white transition">
              Features
            </a>
            <a href="/#use-cases" className="hover:text-white transition">
              Use Cases
            </a>
            <a href="/#founder" className="hover:text-white transition">
              Team
            </a>
            <a href="/early-access" className="hover:text-white transition">
              Early Access
            </a>
            <a href="/blog" className="hover:text-white transition">
              Blog
            </a>
          </div>
          <a
            href="/early-access"
            className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white"
          >
            Early Access
          </a>
        </div>
      </nav>

      {/* Back to lims.bot link */}
      <div className="pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#F8F9FA]/40 hover:text-[#2E8B57] transition-colors"
          >
            ← Back to lims.bot
          </a>
        </div>
      </div>

      {/* hero */}
      <section className="relative px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#E67E22]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#1E3A5F]/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/30 mb-8 text-sm text-[#E67E22]">
            <span className="w-2 h-2 bg-[#E67E22] rounded-full animate-pulse" />
            COLA Forum 2026 · Nashville · May 6–8
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-[#F8F9FA]">
            The LIMS purpose-built for{" "}
            <span className="gradient-text">COLA-accredited labs.</span>
          </h1>

          <p className="text-xl text-[#F8F9FA]/60 mb-10 max-w-2xl mx-auto">
            Offline-capable. Audit-ready in minutes. Pass your next COLA
            inspection without spreadsheets, paper logs, or a vendor who won&apos;t
            return your call.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={CALENDLY_COLA}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#E67E22] hover:bg-[#E67E22]/80 rounded-xl font-semibold text-lg transition-all text-white"
            >
              Book 15 minutes at COLA Forum
            </a>
            <a
              href="/#pilot"
              className="px-8 py-4 border border-[#1E3A5F] hover:border-[#2E8B57] rounded-xl font-semibold text-lg transition-all text-[#F8F9FA]"
            >
              See the demo
            </a>
          </div>
        </div>
      </section>
      {/* COLA-specific 4-card section */}
      <section className="py-20 px-6 bg-[#2C3E50]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
            Built for the labs <span className="gradient-text">COLA accredits.</span>
          </h2>
          <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
            Designed around the realities of physician office labs and the COLA
            inspection process — not retrofitted for them.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Physician office labs",
                body: "Waived through moderate-complexity testing, fully managed in one box. Your CLIA director sleeps at night.",
              },
              {
                title: "All CLIA complexity tiers",
                body: "Waived. Moderate. High. The same LIMS handles all of it, with role-based access and complete audit trails.",
              },
              {
                title: "Audit-ready in minutes",
                body: "Every result, every reagent, every QC check — auto-logged with a chain of custody an inspector can follow.",
              },
              {
                title: "No IT department needed",
                body: "Two machines in a rugged case. Plug in. Power on. The AI assistant handles configuration and troubleshooting.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8"
              >
                <h3 className="text-xl font-semibold mb-3 text-[#F8F9FA]">
                  {card.title}
                </h3>
                <p className="text-[#F8F9FA]/60">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <VideoSection
        videoId="2gZf1RnqDWU"
        heading="Watch the film."
        subheading="Two minutes, forty-five seconds. The whole story."
        caption="From the rural-clinic deployment scenario."
        sectionId="film"
      />
      {/* trust signals */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "ISO 17025 Ready",
              "21 CFR Part 11 Compatible",
              "CLIA Compliant",
              "EPA Reporting Built In",
            ].map((label) => (
              <div
                key={label}
                className="text-center px-4 py-5 rounded-xl bg-[#1E3A5F]/15 border border-[#1E3A5F]/40 text-sm font-semibold text-[#F8F9FA]/80"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* additional sections appended in subsequent commits */}

      {/* footer */}
      <footer className="mt-24 py-12 px-6 border-t border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <a href="/" className="text-xl font-bold gradient-text mb-1 block">
              THE LIMS BOX
            </a>
            <div className="text-sm text-[#F8F9FA]/40">
              Modern lab informatics for environmental testing, forensics, food
              safety, and contract labs.
            </div>
            <div className="text-sm text-[#F8F9FA]/30">
              A TombStone Dash LLC product
            </div>
          </div>
          <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">
              Home
            </a>
            <a href="/early-access" className="hover:text-[#2E8B57] transition">
              Early Access
            </a>
            <a href="/blog" className="hover:text-[#2E8B57] transition">
              Blog
            </a>
            <a
              href="mailto:info@lims.bot"
              className="hover:text-[#2E8B57] transition"
            >
              Contact
            </a>
          </div>
          <div className="text-sm text-[#F8F9FA]/30">
            © {new Date().getFullYear()} THE LIMS BOX. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
