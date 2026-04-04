"use client";

import { useState } from "react";

export default function EarlyAccessPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labName: data.get("labName"),
          labSize: data.get("labSize"),
          instruments: data.get("instruments"),
          currentLims: data.get("currentLims"),
          painPoint: data.get("painPoint"),
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
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
    <main className="min-h-screen bg-[#0a0f1a]">
      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent">
            THE LIMS BOX
          </a>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <a href="/early-access" className="text-white transition">Early Access</a>
          </div>
          <a href="mailto:info@lims.bot?subject=LIMS%20BOX%20Demo%20Request" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white">
            Schedule Demo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/20 mb-8 text-sm text-[#E67E22]">
            <span className="w-2 h-2 bg-[#E67E22] rounded-full animate-pulse" />
            5 Spots Available
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F8F9FA] mb-4">
            Early Adopter Program —{" "}
            <span className="bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent">
              5 Labs, Hands-On Support
            </span>
          </h1>
          <p className="text-xl text-[#F8F9FA]/60 max-w-2xl mx-auto">
            We&apos;re selecting a small number of labs to pilot LIMS BOX alongside their current process.
          </p>
        </div>
      </div>

      {/* What You Get / What We Need */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-[#2C3E50]/30 border border-[#2E8B57]/30 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#2E8B57] mb-4">What You Get</h2>
            <ul className="space-y-3 text-[#F8F9FA]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Free pilot period</strong> — run LIMS BOX at no cost during the trial</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Direct access to the founder</strong> — Hudson Taylor, 15 years of LIMS implementation experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Custom configuration</strong> — your methods, your workflows, your instruments</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Priority feature requests</strong> — your needs shape the product roadmap</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Founding partner pricing</strong> — locked in for life after the pilot</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#2C3E50]/30 border border-[#E67E22]/30 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#E67E22] mb-4">What We Need</h2>
            <ul className="space-y-3 text-[#F8F9FA]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span>A real lab willing to run LIMS BOX for <strong className="text-[#F8F9FA]">30 days</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span>Honest feedback on what works and what doesn&apos;t</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span>A designated point of contact (lab manager, QA director, or senior analyst)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span>30 minutes/week for check-in calls during the pilot</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-[#2E8B57]/10 border border-[#2E8B57]/30 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">🧪</div>
              <div className="text-[#2E8B57] text-2xl font-bold mb-2">Application Received</div>
              <p className="text-[#F8F9FA]/60 mb-4">
                Thank you for your interest in the LIMS BOX Early Adopter Program.
                We&apos;ll review your application and reach out within 48 hours.
              </p>
              <p className="text-sm text-[#F8F9FA]/40">
                Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a> | (760) 960-4273
              </p>
            </div>
          ) : (
            <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-[#F8F9FA] mb-2 text-center">Apply for the Pilot Program</h2>
              <p className="text-[#F8F9FA]/50 text-center mb-8">Takes about 2 minutes. We&apos;ll follow up within 48 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Lab Info */}
                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Lab Name *</label>
                  <input
                    type="text"
                    name="labName"
                    required
                    placeholder="Acme Environmental Testing"
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Lab Size *</label>
                    <select
                      name="labSize"
                      required
                      className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white focus:border-[#2E8B57] focus:outline-none transition appearance-none"
                    >
                      <option value="">Select staff count</option>
                      <option value="1-5">1–5 staff</option>
                      <option value="5-15">5–15 staff</option>
                      <option value="15-50">15–50 staff</option>
                      <option value="50+">50+ staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Current LIMS *</label>
                    <select
                      name="currentLims"
                      required
                      className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white focus:border-[#2E8B57] focus:outline-none transition appearance-none"
                    >
                      <option value="">Select current system</option>
                      <option value="None/Excel">None / Excel / Spreadsheets</option>
                      <option value="LabWare">LabWare</option>
                      <option value="STARLIMS">STARLIMS</option>
                      <option value="LIMS*Nucleus">LIMS*Nucleus</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Primary Instruments</label>
                  <input
                    type="text"
                    name="instruments"
                    placeholder="e.g., ICP-MS, GC-MS, HPLC, Ion Chromatography"
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Biggest Pain Point *</label>
                  <textarea
                    name="painPoint"
                    required
                    rows={4}
                    placeholder="What's the one thing you wish your lab did better? (e.g., chain of custody tracking, audit prep, manual data entry from instruments, compliance reporting...)"
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition resize-none"
                  />
                </div>

                {/* Contact Info */}
                <hr className="border-[#1E3A5F]/30" />

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="jane@lab.com"
                      className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Phone <span className="text-[#F8F9FA]/30">(optional)</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 disabled:opacity-50 rounded-xl font-semibold text-lg transition-all text-white"
                >
                  {submitting ? "Submitting..." : "Apply for the Pilot Program →"}
                </button>
              </form>

              <p className="text-xs text-[#F8F9FA]/30 text-center mt-4">🔒 Your information is confidential and will only be used to evaluate your application.</p>
            </div>
          )}

          {/* Contact footer */}
          <div className="text-center mt-8 text-sm text-[#F8F9FA]/40">
            Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a> | (760) 960-4273
          </div>
        </div>
      </div>

      {/* footer */}
      <footer className="py-12 px-6 border-t border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent mb-1">THE LIMS BOX</div>
            <div className="text-sm text-[#F8F9FA]/40">Modern lab informatics for small and mid-size labs.</div>
          </div>
          <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">Home</a>
            <a href="/blog" className="hover:text-[#2E8B57] transition">Blog</a>
            <a href="mailto:info@lims.bot" className="hover:text-[#2E8B57] transition">Contact</a>
          </div>
          <div className="text-sm text-[#F8F9FA]/30">
            © {new Date().getFullYear()} THE LIMS BOX. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
