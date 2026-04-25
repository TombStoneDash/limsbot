"use client";

import { useState } from "react";
import Image from "next/image";
import VideoSection from "@/components/VideoSection";

/* ────────── tiny inline icons (Heroicons-style) ────────── */
const Icon = ({ d, className = "w-6 h-6" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const icons = {
  flask: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13A18.142 18.142 0 0 1 12 21a18.142 18.142 0 0 1-7.363-1.557l-.772-.13c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  shield: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  server: "M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z",
  chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  bolt: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
  check: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
  phone: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 18h6",
  wrench: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.653-4.655m5.014-2.024-.001-.002A6.75 6.75 0 0 1 17.06 7.94l.136-.136a6.753 6.753 0 0 0-4.308-1.857",
  users: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  globe: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  document: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
};

/* ────────── SECTIONS ────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* animated bg blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#2E8B57]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1E3A5F]/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 max-w-4xl text-center animate-fade-in-up">
        <a
          href="/cola"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A5F]/15 border border-[#1E3A5F]/40 mb-4 text-xs text-[#F8F9FA]/70 hover:text-[#F8F9FA] hover:border-[#E67E22]/50 transition-colors"
        >
          Meet us at COLA Forum — Nashville, May 6–8 →
        </a>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E8B57]/10 border border-[#2E8B57]/20 mb-8 text-sm text-[#2E8B57]">
          <span className="w-2 h-2 bg-[#2E8B57] rounded-full animate-pulse" />
          Laboratory informatics for small and mid-size labs
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-[#F8F9FA]">
          Plug in. Power on.
          <br />
          <span className="gradient-text">Run your lab.</span>
        </h1>

        <p className="text-xl text-[#F8F9FA]/60 mb-10 max-w-2xl mx-auto">
          Modern lab informatics for environmental testing, forensics, cannabis, food safety, and contract labs.
          Sample tracking, chain of custody, and regulatory compliance — set up in days, not months.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/early-access"
            className="px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-xl font-semibold text-lg transition-all text-white animate-pulse-glow"
          >
            Apply for Early Access
          </a>
          <a
            href="mailto:info@lims.bot?subject=LIMS%20BOX%20Demo%20Request"
            className="px-8 py-4 border border-[#E67E22] hover:border-[#E67E22]/80 hover:bg-[#E67E22]/10 rounded-xl font-semibold text-lg transition-all text-[#E67E22]"
          >
            Schedule a Demo
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 border border-[#1E3A5F] hover:border-[#2E8B57] rounded-xl font-semibold text-lg transition-all text-[#F8F9FA]"
          >
            See How It Works
          </a>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/20 text-sm text-[#E67E22]">
          <span className="w-2 h-2 bg-[#E67E22] rounded-full animate-pulse" />
          Currently selecting 5 pilot labs. Apply now.
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[#F8F9FA]/40">
          <span>✓ Chain of custody</span>
          <span>✓ EPA methods</span>
          <span>✓ AI-powered</span>
          <span>✓ ISO 17025 ready</span>
          <span>✓ Under $500/mo</span>
        </div>
      </div>
    </section>
  );
}

function ProductGallery() {
  const images = [
    { src: "/images/branded-newcase.jpg", alt: "THE LIMS BOX — portable laboratory infrastructure in a rugged Pelican case" },
    { src: "/images/branded-case-logo.jpg", alt: "THE LIMS BOX with branded case logo — deployable lab informatics system" },
    { src: "/images/branded-maclogo.jpg", alt: "THE LIMS BOX powered by Mac Mini — complete lab informatics platform" },
  ];
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img.src}
              className="relative overflow-hidden rounded-2xl border border-[#1E3A5F]/30 group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={1200}
                height={800}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WaitlistCompact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          organization: data.get("organization"),
          role: data.get("role"),
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-6" id="waitlist-top">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#2C3E50]/40 border border-[#2E8B57]/30 rounded-2xl p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-[#2E8B57] text-2xl font-bold mb-2">✓ You&apos;re on the list.</div>
              <p className="text-[#F8F9FA]/60">We&apos;ll reach out when pilot deployments begin.</p>
              <p className="text-sm text-[#F8F9FA]/40 mt-2">Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a></p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-center mb-1 text-[#F8F9FA]">Get Early Access</h3>
              <p className="text-sm text-[#F8F9FA]/50 text-center mb-6">Be first in line for THE LIMS BOX pilot program.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" name="name" required placeholder="Your name" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                  <input type="email" name="email" required placeholder="your@email.com" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" name="organization" placeholder="Lab name (optional)" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                  <input type="text" name="role" placeholder="Your role (optional)" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                </div>
                <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 disabled:opacity-50 rounded-lg font-semibold transition-all text-white text-sm">
                  {submitting ? "Joining..." : "Join the Waitlist →"}
                </button>
              </form>
              <p className="text-xs text-[#F8F9FA]/30 text-center mt-3">🔒 No spam. Priority pilot access. Founding partner pricing.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroQuote() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="grid md:grid-cols-3 gap-8 text-[#F8F9FA]/60">
          <div className="p-6 rounded-2xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20">
            <p className="italic text-lg mb-2">&ldquo;You run the analysis. I handle the paperwork.&rdquo;</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20">
            <p className="italic text-lg mb-2">&ldquo;500 samples a week. Every chain of custody intact.&rdquo;</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20">
            <p className="italic text-lg mb-2">&ldquo;Your auditor will love me. Your spreadsheets won&apos;t miss you.&rdquo;</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-24 px-6" id="problem">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Your Lab Has Outgrown
          <br />
          <span className="gradient-text">Spreadsheets and Paper</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          Labs of every type are drowning in manual processes.
          Sample logs in Excel. Chain of custody on clipboards. Audit prep on prayer.
          THE LIMS BOX was built for exactly this.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: icons.clock, title: "40% paperwork, 60% science", desc: "Your analysts spend nearly half their time on data entry, transcription, and documentation — not the analytical work you hired them for." },
            { icon: icons.document, title: "Audit prep takes weeks", desc: "Records scattered across spreadsheets, email threads, and paper logbooks. When the auditor calls, you scramble — every single time." },
            { icon: icons.users, title: "Knowledge walks out the door", desc: "Every time a senior tech leaves, institutional knowledge goes with them. SOPs live in someone's head. Method tricks aren't documented." },
            { icon: icons.server, title: "Chain of custody gaps", desc: "Paper-based COC means gaps, missing signatures, and custody disputes. Whether it's EPA samples or forensic evidence — gaps kill credibility." },
            { icon: icons.globe, title: "Compliance outgrows manual processes", desc: "ISO 17025, EPA methods, state regulations, and accreditation requirements demand real LIMS — not workaround spreadsheets." },
            { icon: icons.bolt, title: "Enterprise LIMS is overkill", desc: "You've looked at LabWare and STARLIMS. $50K+ and an 18-month implementation? You need 20% of the features at 10% of the cost." },
          ].map((p) => (
            <div key={p.title} className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#E67E22]/10 flex items-center justify-center mb-4 text-[#E67E22]">
                <Icon d={p.icon} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F8F9FA]">{p.title}</h3>
              <p className="text-[#F8F9FA]/60">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Ship a Pelican case", desc: "Pre-configured with two Mac Studios, daisy-chained. AI assistant + full LIMS database. Ready to deploy anywhere." },
    { num: "02", title: "Open the case", desc: "A laminated setup card sits on top: 'Step 1: Plug in. Step 2: Power on. Step 3: Say hello.'" },
    { num: "03", title: "AI comes alive", desc: "Natural language interaction for lab staff. The AI handles complexity so analysts can focus on samples." },
    { num: "04", title: "Start tracking samples", desc: "Full sample tracking, chain of custody, QC, result reporting, and compliance workflows — all running. Immediately." },
  ];
  return (
    <section className="py-24 px-6 bg-[#2C3E50]/10" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Deploy in <span className="gradient-text">Minutes, Not Months</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          No implementation team. No configuration sprints. No IT department.
          Open the case. Plug in. Power on.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="text-5xl font-bold text-[#2E8B57]/20 mb-4">{s.num}</div>
              <h3 className="text-lg font-semibold mb-2 text-[#F8F9FA]">{s.title}</h3>
              <p className="text-[#F8F9FA]/60 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: icons.server, title: "Offline-Capable", desc: "Full functionality without internet. Works in field offices, mobile labs, and remote sites — no cloud dependency required." },
    { icon: icons.chart, title: "AI-Powered QC", desc: "Machine learning flags out-of-spec results, control chart trends, and holding time violations before they become audit findings." },
    { icon: icons.flask, title: "Chain of Custody", desc: "Digital COC from field collection to final report. Every handoff logged, timestamped, and audit-ready." },
    { icon: icons.wrench, title: "Method Tracking", desc: "Built-in method templates for EPA, state, and custom analyses. Holding times, preservation requirements, and QC limits — preconfigured." },
    { icon: icons.shield, title: "Self-Healing Systems", desc: "Auto-calibration, daily QC checks, predictive maintenance alerts. The system maintains itself so analysts don't have to." },
    { icon: icons.bolt, title: "Zero IT Footprint", desc: "No servers, no IT department, no configuration sprints. Open the case. Plug in. Power on. It just works." },
  ];
  return (
    <section className="py-24 px-6 bg-[#2C3E50]/10" id="features">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Built for the <span className="gradient-text">Real World</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          Six core capabilities that make THE LIMS BOX the right LIMS for labs that need results — not IT projects.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#E67E22]/10 flex items-center justify-center mb-4 text-[#E67E22]">
                <Icon d={f.icon} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#F8F9FA]">{f.title}</h3>
              <p className="text-[#F8F9FA]/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-[#F8F9FA]/40">
          Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a>
        </p>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    { emoji: "🌊", title: "Environmental & Water Testing", desc: "EPA method compliance, sample chain of custody for legal defensibility, high-volume routine testing, and seasonal surge management." },
    { emoji: "🔬", title: "Crime & Forensic Labs", desc: "Chain of custody critical for court-admissible evidence. Accreditation tracking, backlog management, and analyst workload optimization." },
    { emoji: "🌿", title: "Cannabis Testing Labs", desc: "State compliance workflows, potency and terpene analysis tracking, rapid turnaround reporting, and regulatory audit trails." },
    { emoji: "🍽️", title: "Food Safety Labs", desc: "FSMA compliance, pathogen testing workflows, supplier qualification tracking, and certificate of analysis generation." },
    { emoji: "🧬", title: "Research Labs", desc: "Grant compliance documentation, data integrity and reproducibility, instrument integration, and electronic lab notebooks." },
    { emoji: "📊", title: "Contract & Commercial Labs", desc: "Multi-client management, automated client reporting, SLA tracking, and branded certificate of analysis delivery." },
  ];
  return (
    <section className="py-24 px-6" id="use-cases">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Where THE LIMS BOX <span className="gradient-text">Goes to Work</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          Built for labs that need compliance, traceability, and speed — without the enterprise price tag.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div key={c.title} className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">{c.emoji}</div>
              <h3 className="text-lg font-semibold mb-2 text-[#F8F9FA]">{c.title}</h3>
              <p className="text-[#F8F9FA]/60 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-[#F8F9FA]/40">
          Have a use case in mind? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a>
        </p>
      </div>
    </section>
  );
}

function VideoEmbed() {
  return (
    <section className="py-24 px-6 bg-[#2C3E50]/10" id="video">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          See THE LIMS BOX <span className="gradient-text">In Action</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-12">
          Watch how a Pelican case transforms sample management for your lab.
        </p>
        <div className="relative w-full overflow-hidden rounded-2xl border border-[#1E3A5F]/30" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube-nocookie.com/embed/2gZf1RnqDWU"
            title="THE LIMS BOX — Lab Informatics in a Pelican Case"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <p className="text-center mt-6 text-sm text-[#F8F9FA]/40">
          Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a>
        </p>
      </div>
    </section>
  );
}

function Capabilities() {
  const features = [
    { icon: icons.flask, title: "Full Sample Tracking", desc: "Barcode scanning, chain of custody, result reporting. Enterprise-grade capabilities in a portable package." },
    { icon: icons.shield, title: "Compliance Built In", desc: "21 CFR Part 11, ISO 17025, EPA methods, TNI standards. Audit trails and electronic signatures — baked in, not bolted on." },
    { icon: icons.chart, title: "AI-Powered Assistance", desc: "Natural language interaction for lab staff. The AI handles complexity so analysts can focus on results." },
    { icon: icons.server, title: "Fully Offline-Capable", desc: "Works in field offices and remote sites. No cloud dependency. No internet required. Total data sovereignty." },
    { icon: icons.bolt, title: "Enterprise-Grade", desc: "Full QC management, inventory tracking, scheduling, result validation, and reporting. Everything a large lab has — at a fraction of the cost." },
    { icon: icons.phone, title: "Client Portal", desc: "Automated result delivery to clients. COAs, compliance reports, and status updates — delivered without phone calls." },
  ];
  return (
    <section className="py-24 px-6" id="capabilities">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Not Just a Lab. An <span className="gradient-text">AI Partner</span>.
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          THE LIMS BOX brings full-stack laboratory capabilities to any lab, anywhere.
          Starting at a fraction of the cost of QBench ($16.5K/yr) or CloudLIMS ($285/user/mo).
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#2E8B57]/10 flex items-center justify-center mb-4 text-[#2E8B57]">
                <Icon d={f.icon} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#F8F9FA]">{f.title}</h3>
              <p className="text-[#F8F9FA]/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Vignettes() {
  const stories = [
    { emoji: "🧑‍🔬", title: "The Contract Lab Manager", capability: "Sample tracking + COC", value: "Zero lost samples", desc: "500 samples a week, every chain of custody intact. No more hunting for paper logs. The auditor walks in and the data is already waiting." },
    { emoji: "💧", title: "The Water Utility", capability: "Compliance reporting", value: "Automated CCR", desc: "Daily compliance tests, monthly reports, annual CCRs — generated automatically. The utility manager stops dreading EPA reporting season." },
    { emoji: "🔧", title: "The Maintenance Tech", capability: "Predictive equipment monitoring", value: "Cost savings", desc: "Before the analyzer fails, THE LIMS BOX flags the pattern. A $12 part gets replaced instead of a $12,000 component." },
    { emoji: "📋", title: "The QA Director", capability: "Audit trail + e-signatures", value: "ISO 17025 ready", desc: "Every result traceable. Every change logged. The QA director sleeps well before assessment week because the audit trail is airtight." },
    { emoji: "⚡", title: "Self-Healing Systems", capability: "Automated QC + calibration", value: "Reliability", desc: "Auto-calibration, daily QC checks, backup syncing — all running autonomously. The system maintains itself so analysts don't have to." },
    { emoji: "🚛", title: "The Field Sampler", capability: "Mobile sample login", value: "Field-to-lab COC", desc: "Samples logged at the collection site. GPS coordinates, timestamps, and preservation checks — captured before the cooler hits the truck." },
  ];
  return (
    <section className="py-24 px-6 bg-[#2C3E50]/10" id="vignettes">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Every Feature Is a <span className="gradient-text">Problem Solved</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          THE LIMS BOX doesn&apos;t just track samples. It eliminates the manual work that slows your lab down.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s) => (
            <div key={s.title} className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-6">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <h3 className="text-lg font-semibold mb-1 text-[#F8F9FA]">{s.title}</h3>
              <div className="text-xs text-[#E67E22] font-medium mb-2">{s.capability} → {s.value}</div>
              <p className="text-[#F8F9FA]/60 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="py-24 px-6" id="founder">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#F8F9FA]">
          Built by Someone Who <span className="gradient-text">Actually Ran a Lab</span>
        </h2>
        <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8 md:p-12">
          <div className="space-y-6 text-[#F8F9FA]/80">
            <p className="text-lg">
              <span className="text-[#F8F9FA] font-semibold">Hudson Taylor</span> spent{" "}
              <span className="text-[#2E8B57] font-semibold">15 years</span> inside laboratories —
              managing instruments, writing parsers, implementing compliance, and watching brilliant
              scientists drown in paperwork.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-[#2E8B57] mt-0.5">▸</span>
                  <span><strong>Senior LIMS Developer</strong> — State of Alaska Dept. of Health (5.3M+ test results/year)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2E8B57] mt-0.5">▸</span>
                  <span><strong>LIMS Implementation Engineer</strong> — Clinisys/Horizon (#1 global LIMS vendor)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2E8B57] mt-0.5">▸</span>
                  <span><strong>Lab Manager</strong> — CalEnergy Operating Corp. (6 years, geothermal power plant)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-[#2E8B57] mt-0.5">▸</span>
                  <span><strong>MS Biochemistry</strong> — UC San Diego / Salk Institute</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2E8B57] mt-0.5">▸</span>
                  <span><strong>Compliance:</strong> 21 CFR Part 11, ISO 17025, HIPAA, GxP, EPA, CLIA/CAP</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#2E8B57] mt-0.5">▸</span>
                  <span><strong>Published researcher</strong> — PLoS ONE (computational biology)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-[#2E8B57]/5 border border-[#2E8B57]/20 rounded-xl text-[#2E8B57] italic">
              &quot;I wrote the parsers, built the schemas, implemented the compliance rules, and managed the instruments.
              Now I&apos;m building the AI that does all of it — and fits in a Pelican case.&quot;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySmallLabs() {
  const reasons = [
    { title: "Set Up in Days, Not Months", desc: "No IT department needed. No 18-month implementation timeline. No consultants billing $250/hour to configure your system. Open the case and start running samples.", icon: icons.bolt },
    { title: "Under $500/Month", desc: "A fraction of the cost of enterprise LIMS platforms like LabWare or STARLIMS. Full functionality at a price that makes sense for labs with 5–50 staff.", icon: icons.chart },
    { title: "Audit-Ready from Day One", desc: "ISO 17025, cGMP, and 21 CFR Part 11 compliance built in — not bolted on. Electronic signatures, full audit trails, and chain of custody tracking come standard.", icon: icons.shield },
  ];
  return (
    <section className="py-24 px-6 bg-[#2C3E50]/10" id="why-lims-box">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#F8F9FA]">
          Why Small Labs Choose <span className="gradient-text">LIMS BOX</span>
        </h2>
        <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-16">
          Enterprise capability without the enterprise headache.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((r) => (
            <div key={r.title} className="card-hover bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#2E8B57]/10 flex items-center justify-center mb-4 text-[#2E8B57]">
                <Icon d={r.icon} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F8F9FA]">{r.title}</h3>
              <p className="text-[#F8F9FA]/60">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EarlyAccessSection() {
  return (
    <section className="py-24 px-6" id="pilot">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/20 mb-8 text-sm text-[#E67E22]">
          <span className="w-2 h-2 bg-[#E67E22] rounded-full animate-pulse" />
          Now Accepting Applications
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#F8F9FA]">
          Early Adopter <span className="gradient-text">Pilot Program</span>
        </h2>
        <p className="text-[#F8F9FA]/60 max-w-2xl mx-auto mb-6 text-lg">
          5 pilot spots available. Hands-on support from the founder.
        </p>
        <p className="text-[#F8F9FA]/50 max-w-2xl mx-auto mb-12">
          We&apos;re selecting a small number of labs to pilot THE LIMS BOX alongside their current process.
          Pilot partners receive a free trial period, direct access to our engineering team, and priority feature requests.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-xl p-6">
            <div className="text-2xl mb-3">🧪</div>
            <h3 className="text-[#F8F9FA] font-semibold mb-2">Environmental & Water Labs</h3>
            <p className="text-[#F8F9FA]/50 text-sm">EPA methods, chain of custody, and seasonal surge handling.</p>
          </div>
          <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-xl p-6">
            <div className="text-2xl mb-3">🔬</div>
            <h3 className="text-[#F8F9FA] font-semibold mb-2">Forensic & Crime Labs</h3>
            <p className="text-[#F8F9FA]/50 text-sm">Court-admissible chain of custody, accreditation, and backlog management.</p>
          </div>
          <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-xl p-6">
            <div className="text-2xl mb-3">🍽️</div>
            <h3 className="text-[#F8F9FA] font-semibold mb-2">Food Safety & Cannabis Labs</h3>
            <p className="text-[#F8F9FA]/50 text-sm">FSMA compliance, state regulations, and rapid turnaround reporting.</p>
          </div>
        </div>
        <a
          href="/early-access"
          className="inline-block px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-xl font-semibold text-lg transition-all text-white"
        >
          Apply for the Pilot Program →
        </a>
        <p className="mt-4 text-sm text-[#F8F9FA]/30">
          Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a> | (760) 960-4273
        </p>
      </div>
    </section>
  );
}

function InvestorCTA() {
  return (
    <section className="py-24 px-6 bg-[#2C3E50]/10" id="investors">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#F8F9FA]/70">
          For Investors
        </h2>
        <p className="text-[#F8F9FA]/50 max-w-2xl mx-auto mb-6">
          Thousands of labs still run on spreadsheets and paper.
          THE LIMS BOX is the first private AI appliance for regulated laboratories.
        </p>
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Env Labs", value: "12K+", sub: "in the US" },
            { label: "LIMS Market", value: "$5.19B", sub: "by 2030" },
            { label: "Growth", value: "12.5%", sub: "CAGR" },
            { label: "Deploy time", value: "Minutes", sub: "not months" },
          ].map((s) => (
            <div key={s.label} className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-xl p-6">
              <div className="text-sm text-[#F8F9FA]/40 mb-1">{s.label}</div>
              <div className="text-3xl font-bold text-[#2E8B57]">{s.value}</div>
              <div className="text-xs text-[#F8F9FA]/40">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:info@lims.bot"
            className="inline-block px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-xl font-semibold text-lg transition-all text-white"
          >
            Get in Touch →
          </a>
          <a
            href="/LIMS_BOX_SELL_SHEET_v5.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 border border-[#1E3A5F] hover:border-[#2E8B57] rounded-xl font-semibold text-lg transition-all text-[#F8F9FA]"
          >
            Download One-Pager (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}

function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          organization: data.get("organization"),
          role: data.get("role"),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // fallback — still show success to not block UX
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-6" id="waitlist">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#F8F9FA]">
          <span className="gradient-text">Request Early Access</span>
        </h2>
        <p className="text-[#F8F9FA]/60 mb-8">
          Join the early access program. We&apos;ll reach out when we&apos;re ready for pilot deployments.
          Early partners get priority access and founding pricing.
        </p>

        {submitted ? (
          <div className="p-8 bg-[#2E8B57]/10 border border-[#2E8B57]/30 rounded-2xl">
            <div className="text-[#2E8B57] text-xl font-semibold mb-2">✓ You&apos;re on the list.</div>
            <p className="text-[#F8F9FA]/60">Thank you for your interest in THE LIMS BOX. We&apos;ll reach out to discuss pilot program details.</p>
            <p className="text-sm text-[#F8F9FA]/40 mt-2">Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="name"
                required
                placeholder="Your name"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-xl text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-xl text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="organization"
                placeholder="Lab name (optional)"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-xl text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
              <input
                type="text"
                name="role"
                placeholder="Your role (optional)"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-xl text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 disabled:opacity-50 rounded-xl font-semibold transition-all text-white"
            >
              {submitting ? "Submitting..." : "Request Early Access"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[#F8F9FA]/40">
          <span>🔒 No spam. Ever.</span>
          <span>🧪 Priority pilot access</span>
          <span>💰 Founding partner pricing</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#1E3A5F]/30">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="text-xl font-bold gradient-text mb-1">THE LIMS BOX</div>
          <div className="text-sm text-[#F8F9FA]/40">Modern lab informatics for environmental testing, forensics, food safety, and contract labs.</div>
          <div className="text-sm text-[#F8F9FA]/30">A TombStone Dash LLC product</div>
        </div>
        <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
          <a href="#capabilities" className="hover:text-[#2E8B57] transition">Capabilities</a>
          <a href="#vignettes" className="hover:text-[#2E8B57] transition">Stories</a>
          <a href="#founder" className="hover:text-[#2E8B57] transition">Team</a>
          <a href="/early-access" className="hover:text-[#2E8B57] transition">Early Access</a>
          <a href="/blog" className="hover:text-[#2E8B57] transition">Blog</a>
          <a href="mailto:info@lims.bot" className="hover:text-[#2E8B57] transition">Contact</a>
        </div>
        <div className="text-sm text-[#F8F9FA]/30">
          © {new Date().getFullYear()} THE LIMS BOX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ────────── PAGE ────────── */

export default function Home() {
  return (
    <main>
      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold gradient-text">THE LIMS BOX</div>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#use-cases" className="hover:text-white transition">Use Cases</a>
            <a href="#vignettes" className="hover:text-white transition">Stories</a>
            <a href="#founder" className="hover:text-white transition">Team</a>
            <a href="/early-access" className="hover:text-white transition">Early Access</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
          </div>
          <a href="/early-access" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white">
            Early Access
          </a>
        </div>
      </nav>

      <Hero />
      <VideoSection
        videoId="2gZf1RnqDWU"
        heading="Watch the film."
        subheading="Two minutes, forty-five seconds. The whole story."
        caption="From the rural-clinic deployment scenario."
        sectionId="film"
      />
      <ProductGallery />
      <WaitlistCompact />
      <HeroQuote />
      <Problem />
      <HowItWorks />
      <Features />
      <UseCases />
      <VideoEmbed />
      <Capabilities />
      <Vignettes />
      <Founder />
      <WhySmallLabs />
      <EarlyAccessSection />
      <InvestorCTA />
      <Waitlist />
      <Footer />
    </main>
  );
}
