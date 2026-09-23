"use client";

import { useEffect, useRef, useState } from "react";
import { waitlistOutcome, waitlistErrorMessage } from "@/lib/waitlist-submit";

export function WaitlistCompact() {
  const [submitted, setSubmitted] = useState(false);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (submitted) {
      confirmationRef.current?.focus();
    }
  }, [submitted]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
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
      const outcome = waitlistOutcome(res);
      if (outcome === "joined") {
        setSubmitted(true);
      } else {
        setErrorMessage(waitlistErrorMessage(outcome));
      }
    } catch {
      setErrorMessage(waitlistErrorMessage(waitlistOutcome("network-error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-6" id="waitlist-top">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#2C3E50]/40 border border-[#2E8B57]/30 rounded-lg p-8">
          {submitted ? (
            <div className="text-center">
              <h3 ref={confirmationRef} tabIndex={-1} className="text-[#2E8B57] text-2xl font-bold mb-2">✓ You&apos;re on the list.</h3>
              <p className="text-[#F8F9FA]/60">We&apos;ll reach out when pilot deployments begin.</p>
              <p className="text-sm text-[#F8F9FA]/40 mt-2">Questions? <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a></p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-center mb-1 text-[#F8F9FA]">Get Early Access</h3>
              <p className="text-sm text-[#F8F9FA]/50 text-center mb-6">Be first in line for LIMS BOX pilot program.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" name="name" required placeholder="Your name" aria-label="Your name" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                  <input type="email" name="email" required placeholder="your@email.com" aria-label="Email address" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" name="organization" placeholder="Lab name (optional)" aria-label="Lab name (optional)" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                  <input type="text" name="role" placeholder="Your role (optional)" aria-label="Your role (optional)" className="flex-1 px-4 py-3 bg-[#0a0f1a]/60 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition text-sm" />
                </div>
                <button type="submit" disabled={submitting} className="w-full px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 disabled:opacity-50 rounded-lg font-semibold transition-all text-white text-sm">
                  {submitting ? "Joining..." : "Join the Waitlist →"}
                </button>
                {errorMessage && <p role="alert" className="text-sm text-red-300">{errorMessage}</p>}
              </form>
              <p className="text-xs text-[#F8F9FA]/30 text-center mt-3">🔒 No spam. Priority pilot access. Founding partner pricing.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (submitted) {
      confirmationRef.current?.focus();
    }
  }, [submitted]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
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
      const outcome = waitlistOutcome(res);
      if (outcome === "joined") {
        setSubmitted(true);
      } else {
        setErrorMessage(waitlistErrorMessage(outcome));
      }
    } catch {
      setErrorMessage(waitlistErrorMessage(waitlistOutcome("network-error")));
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
          <div className="p-8 bg-[#2E8B57]/10 border border-[#2E8B57]/30 rounded-lg">
            <h3 ref={confirmationRef} tabIndex={-1} className="text-[#2E8B57] text-xl font-semibold mb-2">✓ You&apos;re on the list.</h3>
            <p className="text-[#F8F9FA]/60">Thank you for your interest in LIMS BOX. We&apos;ll reach out to discuss pilot program details.</p>
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
                aria-label="Your name"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="organization"
                placeholder="Lab name (optional)"
                aria-label="Lab name (optional)"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
              <input
                type="text"
                name="role"
                placeholder="Your role (optional)"
                aria-label="Your role (optional)"
                className="flex-1 px-6 py-4 bg-[#2C3E50]/50 border border-[#1E3A5F]/50 rounded-lg text-white placeholder-[#F8F9FA]/30 focus:border-[#2E8B57] focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 disabled:opacity-50 rounded-lg font-semibold transition-all text-white"
            >
              {submitting ? "Submitting..." : "Request Early Access"}
            </button>
            {errorMessage && <p role="alert" className="text-sm text-red-300">{errorMessage}</p>}
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
