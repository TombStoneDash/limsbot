"use client";

import { useState } from "react";

export default function EarlyAdopterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/early-adopter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labName: data.get("labName"),
          labType: data.get("labType"),
          contactName: data.get("contactName"),
          email: data.get("email"),
          testVolume: data.get("testVolume"),
          painPoint: data.get("painPoint"),
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
            LIMS BOX
          </a>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <a href="/early-adopter" className="text-white transition">Early Adopter</a>
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
            🧪 Now Accepting Applications
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F8F9FA] mb-4">
            Early-Adopter{" "}
            <span className="bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent">
              Pilot Program
            </span>
          </h1>
          <p className="text-xl text-[#F8F9FA]/60 max-w-2xl mx-auto">
            Be one of 5 labs to deploy LIMS BOX before general release.
          </p>
        </div>
      </div>

      {/* What You Get / What We Need */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-[#2C3E50]/30 border border-[#2E8B57]/30 rounded-lg p-8">
            <h2 className="text-xl font-bold text-[#2E8B57] mb-4">What You Get</h2>
            <ul className="space-y-3 text-[#F8F9FA]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Hardware at pilot pricing</strong> — Significant discount on LIMS BOX unit during the pilot period</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Direct founder access</strong> — Weekly check-ins with Hudson Taylor, 15 years of LIMS experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Priority feature requests</strong> — Your workflows shape the roadmap</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">White-glove onboarding</strong> — We don&apos;t just ship a box; we help you go live</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">Founding partner pricing</strong> — Lock in early-adopter rates before general availability</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#2E8B57] mt-0.5">✓</span>
                <span><strong className="text-[#F8F9FA]">No long-term commitment</strong> — Pilot period is 90 days. If it&apos;s not working, no hard feelings.</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#2C3E50]/30 border border-[#E67E22]/30 rounded-lg p-8">
            <h2 className="text-xl font-bold text-[#E67E22] mb-4">What We Ask</h2>
            <ul className="space-y-3 text-[#F8F9FA]/70">
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span><strong className="text-[#F8F9FA]">Honest feedback</strong> — What works, what doesn&apos;t, what&apos;s missing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span><strong className="text-[#F8F9FA]">Defined success metrics</strong> — We&apos;ll agree on measurable goals together</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span><strong className="text-[#F8F9FA]">Permission to use as case study</strong> — Anonymized unless you opt in to named reference</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E67E22] mt-0.5">▸</span>
                <span><strong className="text-[#F8F9FA]">30-minute weekly sync</strong> — Quick touchbase during pilot period</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-[#2E8B57]/10 border border-[#2E8B57]/30 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🧪</div>
              <div className="text-[#2E8B57] text-2xl font-bold mb-2">Application Received</div>
              <p className="text-[#F8F9FA]/60 mb-4">
                Thank you for your interest in LIMS BOX Early-Adopter Pilot Program.
                We&apos;ll review your application and reach out within 48 hours.
              </p>
              <p className="text-sm text-[#F8F9FA]/40">
                Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a> | (760) 960-4273
              </p>
            </div>
          ) : (
            <div className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-lg p-8 md:p-12">
              <h2 className="text-2xl font-bold text-[#F8F9FA] mb-2 text-center">Apply for the Pilot</h2>
              <p className="text-[#F8F9FA]/50 text-center mb-8">Takes about 2 minutes. We&apos;ll follow up within 48 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Lab Info */}
                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Lab Name *</label>
                  <input
                    type="text"
                    name="labName"
                    required
                    placeholder="e.g., Acme Environmental Testing"
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Lab Type *</label>
                  <select
                    name="labType"
                    required
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white focus:border-[#2E8B57] focus:outline-none transition appearance-none"
                  >
                    <option value="">Select lab type</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Forensic">Forensic</option>
                    <option value="Research">Research</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Cannabis">Cannabis</option>
                    <option value="Food Safety">Food Safety</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      name="contactName"
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
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Estimated Monthly Test Volume *</label>
                  <select
                    name="testVolume"
                    required
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white focus:border-[#2E8B57] focus:outline-none transition appearance-none"
                  >
                    <option value="">Select volume</option>
                    <option value="<100">Less than 100/month</option>
                    <option value="100-500">100–500/month</option>
                    <option value="500-1000">500–1,000/month</option>
                    <option value="1000-2000">1,000–2,000/month</option>
                    <option value="2000+">2,000+/month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F8F9FA]/70 mb-1.5">Biggest Current Pain Point *</label>
                  <textarea
                    name="painPoint"
                    required
                    rows={4}
                    maxLength={500}
                    placeholder="What's the one thing you wish your lab did better? (e.g., audit prep takes too long, chain of custody is paper-based, data lives in multiple systems...)"
                    className="w-full px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 disabled:opacity-50 rounded-lg font-semibold text-lg transition-all text-white"
                >
                  {submitting ? "Submitting..." : "Apply for the Pilot →"}
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
            <div className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent mb-1">LIMS BOX</div>
            <div className="text-sm text-[#F8F9FA]/40">Modern lab informatics for small and mid-size labs.</div>
          </div>
          <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">Home</a>
            <a href="/blog" className="hover:text-[#2E8B57] transition">Blog</a>
            <a href="mailto:info@lims.bot" className="hover:text-[#2E8B57] transition">Contact</a>
          </div>
          <div className="text-sm text-[#F8F9FA]/30">
            © {new Date().getFullYear()} LIMS BOX. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
