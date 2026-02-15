"use client";

import { useState } from "react";

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
  clock: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  bolt: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
  check: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  currency: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  users: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
};

/* ────────── SECTIONS ────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* animated bg blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 max-w-4xl text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 text-sm text-emerald-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Coming 2026 — AI-Native Laboratory Operations
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your Lab&apos;s AI
          <br />
          <span className="gradient-text">Operations Lead</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          On-prem AI agent that reads instruments, writes reports, manages compliance,
          and talks to you on Slack.{" "}
          <span className="text-white font-semibold">Data never leaves the building.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#waitlist"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-lg transition-all animate-pulse-glow"
          >
            Join the Waitlist
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 border border-gray-600 hover:border-emerald-500 rounded-xl font-semibold text-lg transition-all"
          >
            See How It Works
          </a>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span>✓ 21 CFR Part 11</span>
          <span>✓ ISO 17025</span>
          <span>✓ HIPAA</span>
          <span>✓ GxP / cGMP</span>
          <span>✓ CLIA / CAP</span>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const painPoints = [
    { icon: icons.currency, title: "$200K+ setup", desc: "Legacy LIMS costs six figures to implement with 6-18 month deployment timelines." },
    { icon: icons.clock, title: "40% wasted time", desc: "Lab techs spend 40% of their day on documentation and compliance paperwork instead of science." },
    { icon: icons.shield, title: "Data sovereignty crisis", desc: "Cloud LIMS put your regulated data on someone else's servers. 135K exposed instances in 2026 alone." },
    { icon: icons.server, title: "Ancient technology", desc: "\"Most popular LIMS are ancient solutions patched to oblivion.\" — Real lab director, Reddit 2026" },
  ];
  return (
    <section className="py-24 px-6" id="problem">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Labs Deserve Better Than <span className="gradient-text">1986 Software</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
          The LIMS industry is a $5.19B market built on pain. Expensive implementations, terrible UX,
          and zero intelligence. Your lab data deserves better.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {painPoints.map((p) => (
            <div key={p.title} className="card-hover bg-gray-900/60 border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-400">
                <Icon d={p.icon} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
              <p className="text-gray-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Ship a box", desc: "Pre-configured Mac Studio arrives at your lab. Plug in, connect to your network. That's the hardware." },
    { num: "02", title: "Connect instruments", desc: "LIMSBOT speaks ASTM, HL7, and 50+ instrument protocols natively. DiaSorin, HPLC, GC-MS — it knows your equipment." },
    { num: "03", title: "AI learns your lab", desc: "The agent maps your workflows, SOPs, compliance rules, and instrument configurations. Setup in days, not months." },
    { num: "04", title: "Lab runs itself", desc: "Sample tracking, result review, compliance reports, instrument scheduling — all handled. You manage exceptions, not paperwork." },
  ];
  return (
    <section className="py-24 px-6 bg-gray-900/30" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Deploy in <span className="gradient-text">Days, Not Months</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
          While LabWare quotes you 12 months and six figures, LIMSBOT ships a box and gets to work.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="text-5xl font-bold text-emerald-500/20 mb-4">{s.num}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: icons.flask, title: "Instrument Integration", desc: "Native ASTM E1381/E1394 parsers. DiaSorin LIAISON, HPLC, GC-MS, ICP-OES and more. Bidirectional communication." },
    { icon: icons.shield, title: "Compliance-First", desc: "21 CFR Part 11 audit trails, electronic signatures, SOP enforcement, deviation reports — baked in, not bolted on." },
    { icon: icons.chart, title: "Smart Result Review", desc: "Auto-validates routine results against specs. Flags anomalies for human review. 85% accuracy on first pass, 99%+ on routine transcription." },
    { icon: icons.server, title: "100% On-Prem", desc: "Runs on Apple Silicon. Your data never leaves your building. No cloud dependency. Total data sovereignty." },
    { icon: icons.bolt, title: "Multi-Step Workflows", desc: "Instrument reads data → validates → generates CoA → routes for review → emails client → archives → flags anomalies → schedules maintenance." },
    { icon: icons.users, title: "Conversational Interface", desc: "Talk to your LIMS on Slack or Teams. \"Hey LIMSBOT, pull QC results for instrument 3 and flag anything out of spec.\"" },
  ];
  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Not Another LIMS. An <span className="gradient-text">AI Lab Partner</span>.
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
          LIMSBOT doesn&apos;t just store data — it does the work. Eight-step workflows, autonomous result review,
          and compliance that actually works.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="card-hover bg-gray-900/60 border border-gray-800 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                <Icon d={f.icon} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    { feature: "Setup time", legacy: "6-18 months", cloud: "2-6 months", limsbot: "Days" },
    { feature: "Setup cost", legacy: "$100K-500K+", cloud: "$10K-50K", limsbot: "$15K" },
    { feature: "Monthly cost", legacy: "$5K-20K", cloud: "$3K-15K", limsbot: "$2.5K-10K" },
    { feature: "Data location", legacy: "On-prem (yours)", cloud: "Their cloud", limsbot: "On-prem (yours)" },
    { feature: "AI automation", legacy: "None", cloud: "Basic", limsbot: "Full agentic AI" },
    { feature: "Instrument integration", legacy: "Months per instrument", cloud: "API-dependent", limsbot: "Native ASTM/HL7" },
    { feature: "Compliance", legacy: "Manual", cloud: "Partial", limsbot: "AI-automated" },
    { feature: "UX", legacy: "1990s", cloud: "Modern", limsbot: "Conversational" },
  ];
  return (
    <section className="py-24 px-6 bg-gray-900/30" id="comparison">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          The <span className="gradient-text">Honest Comparison</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-4 px-4 text-gray-400 font-medium">Feature</th>
                <th className="py-4 px-4 text-gray-400 font-medium">Legacy LIMS</th>
                <th className="py-4 px-4 text-gray-400 font-medium">Cloud LIMS</th>
                <th className="py-4 px-4 text-emerald-400 font-bold">LIMSBOT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.feature} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition">
                  <td className="py-3 px-4 font-medium">{r.feature}</td>
                  <td className="py-3 px-4 text-red-400">{r.legacy}</td>
                  <td className="py-3 px-4 text-yellow-400">{r.cloud}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">{r.limsbot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Markets() {
  const markets = [
    { emoji: "🧬", name: "Clinical Labs", desc: "Hospitals, diagnostics, reference labs — HIPAA + CLIA compliance built in." },
    { emoji: "🌿", name: "Cannabis Testing", desc: "State compliance, COA generation, chain of custody. Automated." },
    { emoji: "🌍", name: "Environmental", desc: "EPA methods, water quality, food safety. High volume, thin margins — perfect for AI." },
    { emoji: "💊", name: "Pharma QA", desc: "GxP, 21 CFR Part 11, cGMP. Batch release, stability testing, deviation management." },
    { emoji: "🔬", name: "Research / University", desc: "Budget-friendly. No more spreadsheet LIMS. Academic pricing available." },
    { emoji: "🧪", name: "Forensics", desc: "Chain of custody, audit trails, accreditation support. Government-grade compliance." },
  ];
  return (
    <section className="py-24 px-6" id="markets">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Built for <span className="gradient-text">Every Lab</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
          Whether you run 100 samples a day or 100,000 — LIMSBOT scales with your throughput, not your headcount.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {markets.map((m) => (
            <div key={m.name} className="card-hover bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">{m.emoji}</div>
              <h3 className="text-lg font-semibold mb-2">{m.name}</h3>
              <p className="text-gray-400 text-sm">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="py-24 px-6 bg-gray-900/30" id="founder">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Built by Someone Who <span className="gradient-text">Actually Ran a Lab</span>
        </h2>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              <span className="text-white font-semibold">Hudson Taylor</span> isn&apos;t a Silicon Valley founder
              who read a blog post about labs. He spent <span className="text-emerald-400 font-semibold">15 years</span>{" "}
              inside them.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span><strong>Senior LIMS Developer</strong> — State of Alaska Dept. of Health (5.3M+ test results/year, 780K+ samples, 50+ instruments)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span><strong>LIMS Implementation Engineer</strong> — Clinisys/Horizon (the #1 global LIMS vendor)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span><strong>LIMS Developer / Lab Manager</strong> — CalEnergy Operating Corp. (6 years, geothermal power plant lab)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span><strong>MS Biochemistry</strong> — UC San Diego / Salk Institute</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span><strong>Compliance expertise:</strong> 21 CFR Part 11, ISO 17025, HIPAA, GxP, EPA, CLIA/CAP</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">▸</span>
                  <span><strong>Already running</strong> an autonomous AI agent on local hardware in production (24/7)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-300 italic">
              &quot;I wrote the parsers, built the schemas, implemented the compliance rules, and managed the instruments.
              Now I&apos;m building the AI agent that does all of it autonomously.&quot;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ROI() {
  return (
    <section className="py-24 px-6" id="roi">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          The <span className="gradient-text">Math Is Obvious</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-hover bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl font-bold text-red-400 mb-2">$200K+</div>
            <div className="text-gray-400 mb-4">Legacy LIMS setup</div>
            <div className="text-sm text-gray-500">+ 12-18 months deployment<br/>+ $50K+/yr maintenance</div>
          </div>
          <div className="card-hover bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">$80K/yr</div>
            <div className="text-gray-400 mb-4">Per data entry tech</div>
            <div className="text-sm text-gray-500">$40/hr × 2,000 hrs/yr<br/>40% time on paperwork</div>
          </div>
          <div className="card-hover bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-8 text-center animate-pulse-glow">
            <div className="text-4xl font-bold text-emerald-400 mb-2">$15K</div>
            <div className="text-emerald-300 mb-4">LIMSBOT all-in setup</div>
            <div className="text-sm text-emerald-400/70">+ $2.5K-10K/month<br/>Deployed in days</div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-2xl font-semibold">
            Save <span className="text-emerald-400">$340K/year</span> per lab with 5→1 tech reduction
          </p>
          <p className="text-gray-400 mt-2">Lab techs become lab managers. They oversee AI agents instead of doing data entry.</p>
        </div>
      </div>
    </section>
  );
}

function InvestorCTA() {
  return (
    <section className="py-24 px-6 bg-gray-900/30" id="investors">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          For <span className="gradient-text">Investors</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-12">
          $5.19B market. 12.5% CAGR. Fragmented incumbents. Zero AI-native on-prem competitors.
          First-mover in the most defensible vertical in agentic AI.
        </p>
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "TAM", value: "$5.19B", sub: "by 2030" },
            { label: "Growth", value: "12.5%", sub: "CAGR" },
            { label: "Setup savings", value: "90%", sub: "vs legacy LIMS" },
            { label: "Deploy time", value: "Days", sub: "vs 12-18 months" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">{s.label}</div>
              <div className="text-3xl font-bold text-emerald-400">{s.value}</div>
              <div className="text-xs text-gray-500">{s.sub}</div>
            </div>
          ))}
        </div>
        <a
          href="mailto:invest@limsbot.com"
          className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-lg transition-all"
        >
          Get the Pitch Deck →
        </a>
      </div>
    </section>
  );
}

function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to actual form handler (Google Form, Formspree, etc.)
    setSubmitted(true);
  };

  return (
    <section className="py-24 px-6" id="waitlist">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to <span className="gradient-text">Upgrade Your Lab</span>?
        </h2>
        <p className="text-gray-400 mb-8">
          Join the waitlist. We&apos;ll notify you when LIMSBOT is ready for pilot labs.
          Early adopters get priority access and founding member pricing.
        </p>

        {submitted ? (
          <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <div className="text-emerald-400 text-xl font-semibold mb-2">🧪 You&apos;re on the list!</div>
            <p className="text-gray-400">We&apos;ll be in touch when we&apos;re ready for pilot labs.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              required
              placeholder="lab-director@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-all whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span>🔒 No spam. Ever.</span>
          <span>📧 Founding member pricing</span>
          <span>🧪 Priority pilot access</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="text-xl font-bold gradient-text mb-1">LIMSBOT</div>
          <div className="text-sm text-gray-500">A TombStone Dash LLC product</div>
        </div>
        <div className="flex gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-emerald-400 transition">Features</a>
          <a href="#comparison" className="hover:text-emerald-400 transition">Compare</a>
          <a href="#founder" className="hover:text-emerald-400 transition">Team</a>
          <a href="#investors" className="hover:text-emerald-400 transition">Investors</a>
          <a href="mailto:hello@limsbot.com" className="hover:text-emerald-400 transition">Contact</a>
        </div>
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} LIMSBOT. All rights reserved.
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold gradient-text">🧪 LIMSBOT</div>
          <div className="hidden md:flex gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#comparison" className="hover:text-white transition">Compare</a>
            <a href="#founder" className="hover:text-white transition">Team</a>
            <a href="#investors" className="hover:text-white transition">Investors</a>
          </div>
          <a href="#waitlist" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold text-sm transition-all">
            Join Waitlist
          </a>
        </div>
      </nav>

      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Comparison />
      <Markets />
      <ROI />
      <Founder />
      <InvestorCTA />
      <Waitlist />
      <Footer />
    </main>
  );
}
