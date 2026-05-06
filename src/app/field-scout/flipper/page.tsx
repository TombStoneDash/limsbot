import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Flipper × Field Scout — LIMS BOX",
  description:
    "Flipper Zero scan dashboard for LIMS BOX Field Scout. Demo mode only. Mock lab assets. Human approval required. No PHI, no production data, no access-control or security-theater scenarios.",
};

interface DemoAsset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  tag_type: string;
  tag_uid_redacted: string;
  source: string;
  location: string;
  owner: string;
  authorization_scope: string;
  captured_by: string;
  captured_at: string;
  notes: string;
  lims_bot_summary: string;
}

interface DemoRegistry {
  schema: string;
  generated_at: string;
  generated_by: string;
  data_classification: string;
  phi_present: boolean;
  production_data_present: boolean;
  assets: DemoAsset[];
}

async function loadDemoRegistry(): Promise<DemoRegistry> {
  const file = path.join(
    process.cwd(),
    "public",
    "data",
    "field_scout_demo_assets.json"
  );
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as DemoRegistry;
}

export default async function FlipperDashboardPage() {
  const registry = await loadDemoRegistry();
  // Pick first asset as the "latest demo scan event" for static demo mode
  const latest = registry.assets[0];
  const limsBotDraft = `Asset ${latest.asset_id} (${latest.asset_name}) scanned at ${latest.location}. Last calibration check on file: ${new Date(
    latest.captured_at
  ).toLocaleDateString()}. Suggested next workflow step: schedule operator verification, log scan event in maintenance ledger, attach to today's run sheet. Awaiting human approval before any record is written.`;

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      {/* Hero */}
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/20 mb-6 text-sm text-[#E67E22]">
            Flipper × Field Scout — demo mode
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Flipper-driven asset scan, human-approved write
          </h1>
          <p className="text-lg text-[#F8F9FA]/70 max-w-3xl mb-6">
            Tap a lab asset tag with a Flipper Zero, see it light up in Field
            Scout, and watch LIMS BOT draft the next workflow step — locally,
            offline, with a human operator in the loop. Only mock lab assets
            are shown here. No access-control cards, no security-theater, no
            PHI, no production data.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Flipper connected (demo)
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Mock lab assets only
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Human approval required
            </div>
          </div>
        </div>
      </section>

      {/* Connection status */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#2E8B57]/40 bg-[#2E8B57]/5 p-5">
            <div className="text-xs uppercase tracking-wide text-[#2E8B57]/80 mb-1">
              Flipper status
            </div>
            <div className="text-xl font-semibold text-[#2E8B57] mb-1">
              ● Connected
            </div>
            <div className="text-xs text-[#F8F9FA]/60">
              Demo mode · serial bridge simulated · firmware v0.103.x
            </div>
          </div>
          <div className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5">
            <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/50 mb-1">
              Registry source
            </div>
            <div className="text-xl font-semibold mb-1">
              field_scout_demo_assets.json
            </div>
            <div className="text-xs text-[#F8F9FA]/60">
              Local, read-only · {registry.assets.length} demo assets ·
              classification:{" "}
              <span className="text-[#E67E22]">
                {registry.data_classification}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5">
            <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/50 mb-1">
              Network posture
            </div>
            <div className="text-xl font-semibold mb-1">Offline-first</div>
            <div className="text-xs text-[#F8F9FA]/60">
              No cloud calls · no PHI · no production data · no access-control
              tag scanning
            </div>
          </div>
        </div>
      </section>

      {/* Latest scan event */}
      <section className="px-6 py-12 border-t border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Latest scan event
          </h2>
          <p className="text-sm text-[#F8F9FA]/60 mb-6">
            Static demo. In a live LIMS BOX deployment this card streams from
            the Flipper serial bridge as scans happen.
          </p>

          <div className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-6 grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/50 mb-2">
                Tag read
              </div>
              <div className="font-mono text-sm text-[#E67E22] mb-1">
                {latest.tag_type}
              </div>
              <div className="font-mono text-sm text-[#F8F9FA]/85 mb-1">
                UID {latest.tag_uid_redacted}
              </div>
              <div className="text-xs text-[#F8F9FA]/55">
                NDEF text record · payload: {latest.asset_id}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-[#F8F9FA]/50 mb-2">
                Asset match
              </div>
              <div className="font-semibold text-lg mb-1">
                {latest.asset_name}
              </div>
              <div className="text-sm text-[#F8F9FA]/75 mb-1">
                {latest.asset_type} · {latest.location}
              </div>
              <div className="text-xs text-[#F8F9FA]/55">
                Owner: {latest.owner} · Captured by: {latest.captured_by}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIMS BOT suggested action */}
      <section className="px-6 py-12 border-t border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            LIMS BOT suggested next step
          </h2>
          <p className="text-sm text-[#F8F9FA]/60 mb-6">
            Drafted locally. No write happens until a qualified operator
            approves.
          </p>
          <article className="rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded bg-[#E67E22]/20 text-[#E67E22] border border-[#E67E22]/30">
                DRAFT
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border border-[#1E3A5F]/40">
                Local model · no external call
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border border-[#1E3A5F]/40">
                Awaiting human approval
              </span>
            </div>
            <p className="text-[#F8F9FA]/90 leading-relaxed mb-4">
              {limsBotDraft}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                disabled
                aria-disabled
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#2E8B57]/30 border border-[#2E8B57]/50 text-[#F8F9FA] text-sm cursor-not-allowed"
              >
                Approve (operator role required)
              </button>
              <button
                disabled
                aria-disabled
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#1E3A5F]/40 border border-[#1E3A5F]/60 text-[#F8F9FA] text-sm cursor-not-allowed"
              >
                Edit draft
              </button>
              <button
                disabled
                aria-disabled
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-[#F8F9FA]/20 text-[#F8F9FA]/70 text-sm cursor-not-allowed"
              >
                Reject
              </button>
            </div>
            <div className="text-xs text-[#F8F9FA]/55 mt-3">
              Buttons are demo-only. Real deployment routes through your role
              policy.
            </div>
          </article>
        </div>
      </section>

      {/* Scope / what this is not */}
      <section className="px-6 py-16 border-t border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
          <h2 className="text-xl font-bold text-[#E67E22] mb-3">
            What this demo is — and isn&apos;t
          </h2>
          <ul className="space-y-2 text-sm text-[#F8F9FA]/85 list-disc list-inside">
            <li>
              <strong>Is:</strong> a Flipper Zero used as an NFC reader for{" "}
              <em>your own</em> blank lab asset tags.
            </li>
            <li>
              <strong>Is:</strong> mock lab equipment — pipettes, centrifuges,
              fridges, biosafety cabinets — labelled by you for inventory.
            </li>
            <li>
              <strong>Is:</strong> a draft suggestion that a human operator
              must approve before anything is written.
            </li>
            <li>
              <strong>Is not:</strong> hotel keys, badge cloning, building
              access, or any access-control workflow.
            </li>
            <li>
              <strong>Is not:</strong> Wi-Fi, Bluetooth, or sub-GHz attack
              tooling.
            </li>
            <li>
              <strong>Is not:</strong> a regulated device under FDA authority
              or a clinical interpretation system.
            </li>
            <li>
              <strong>Is not:</strong> a path to PHI, production patient data,
              or any clinical record system.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want a Flipper × Field Scout walkthrough?
          </h2>
          <p className="text-[#F8F9FA]/70 mb-6">
            We&apos;ll bring a LIMS BOX with the demo registry pre-loaded, a
            Flipper Zero with your own blank NTAG tags, and walk your team
            through the scan-to-approval loop end to end.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/early-adopter"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
            >
              Request a walkthrough
            </Link>
            <Link
              href="/field-scout"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#1E3A5F]/60 hover:border-[#2E8B57]/60 rounded-lg font-semibold transition-all text-[#F8F9FA]"
            >
              Back to Field Scout
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
