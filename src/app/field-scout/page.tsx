import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { promises as fs } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Field Scout — LIMS BOX",
  description:
    "Authorized asset discovery for labs. NTAG215 NFC + QR fallback. Demo-only preview, mock data, no PHI. Human approval stays central.",
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
  const file = path.join(process.cwd(), "public", "data", "field_scout_demo_assets.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as DemoRegistry;
}

export default async function FieldScoutPage() {
  const registry = await loadDemoRegistry();

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      {/* Hero */}
      <section className="px-6 pt-20 pb-12 border-b border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E67E22]/10 border border-[#E67E22]/20 mb-6 text-sm text-[#E67E22]">
            Field workflow preview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Field Scout — authorized asset discovery
          </h1>
          <p className="text-lg text-[#F8F9FA]/70 max-w-3xl mb-6">
            Tap an NTAG215 tag (or scan a QR fallback) to log a scan event against
            an authorized asset registry. Mock data, no PHI, no production data.
            Every scan is queued for human approval before it ever touches a
            production LIMS.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Demo-only assets in this preview
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Mock data, no PHI
            </div>
            <div className="border border-[#1E3A5F]/40 bg-[#0a0f1a]/50 rounded-lg p-4 text-sm text-[#F8F9FA]/70">
              <span className="text-[#2E8B57]">✓</span> Human approval stays central
            </div>
          </div>
        </div>
      </section>

      {/* Demo asset table */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Demo asset registry</h2>
          <p className="text-sm text-[#F8F9FA]/60 mb-8">
            Generated {new Date(registry.generated_at).toLocaleDateString()} by{" "}
            {registry.generated_by}. Data classification:{" "}
            <span className="text-[#E67E22]">{registry.data_classification}</span>.
            PHI present: <span className="text-[#2E8B57]">{registry.phi_present ? "yes" : "no"}</span>.
            Production data present:{" "}
            <span className="text-[#2E8B57]">
              {registry.production_data_present ? "yes" : "no"}
            </span>
            .
          </p>

          <div className="grid gap-4">
            {registry.assets.map((a) => (
              <article
                key={a.asset_id}
                className="rounded-lg border border-[#1E3A5F]/40 bg-[#0a0f1a]/60 p-5 hover:border-[#2E8B57]/40 transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span className="text-xs font-mono text-[#E67E22]">{a.asset_id}</span>
                  <h3 className="text-lg font-semibold">{a.asset_name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#2E8B57]/10 text-[#2E8B57] border border-[#2E8B57]/20">
                    {a.asset_type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#1E3A5F]/30 text-[#F8F9FA]/70 border border-[#1E3A5F]/40">
                    {a.tag_type}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-[#F8F9FA]/75 mb-3">
                  <div>
                    <span className="text-[#F8F9FA]/50">Location:</span> {a.location}
                  </div>
                  <div>
                    <span className="text-[#F8F9FA]/50">Owner:</span> {a.owner}
                  </div>
                  <div>
                    <span className="text-[#F8F9FA]/50">Captured by:</span> {a.captured_by}
                  </div>
                  <div>
                    <span className="text-[#F8F9FA]/50">Tag UID:</span>{" "}
                    <span className="font-mono">{a.tag_uid_redacted}</span>
                  </div>
                </div>
                <p className="text-sm text-[#F8F9FA]/85 italic border-l-2 border-[#2E8B57]/40 pl-3">
                  {a.lims_bot_summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What happens on a scan */}
      <section className="px-6 py-16 border-t border-[#1E3A5F]/40 bg-[#2C3E50]/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            What happens when a tag is scanned
          </h2>
          <ol className="space-y-4 text-[#F8F9FA]/85">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2E8B57]/20 border border-[#2E8B57]/40 flex items-center justify-center text-sm text-[#2E8B57]">
                1
              </span>
              <div>
                <strong>Tap NTAG215 (or scan QR fallback).</strong> Field tech
                taps the tag with an authorized phone. The tag holds an
                NDEF text record encoding an asset_id like <code className="font-mono text-[#E67E22]">LIMSBOX-DEMO-ASSET-001</code>.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2E8B57]/20 border border-[#2E8B57]/40 flex items-center justify-center text-sm text-[#2E8B57]">
                2
              </span>
              <div>
                <strong>Match against the authorized registry.</strong> The
                asset_id is looked up in the demo registry. If it isn&apos;t
                there, the scan is rejected. No write happens.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2E8B57]/20 border border-[#2E8B57]/40 flex items-center justify-center text-sm text-[#2E8B57]">
                3
              </span>
              <div>
                <strong>Append to scan event log.</strong> A scan event is
                appended to a local event log on the LIMS BOX. Nothing leaves
                the box without an authorized sync.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2E8B57]/20 border border-[#2E8B57]/40 flex items-center justify-center text-sm text-[#2E8B57]">
                4
              </span>
              <div>
                <strong>LIMS BOT drafts a summary.</strong> A draft note is
                generated locally — calibration status, next-due date,
                tolerances, anything the registry knows. The draft is
                clearly marked as a draft.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2E8B57]/20 border border-[#2E8B57]/40 flex items-center justify-center text-sm text-[#2E8B57]">
                5
              </span>
              <div>
                <strong>Human approval.</strong> A qualified operator reviews
                the draft and either approves it into the record or edits it.
                Nothing auto-commits.
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Authorization scope panel */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/5 p-6">
          <h2 className="text-xl font-bold text-[#E67E22] mb-3">Authorization scope</h2>
          <ul className="space-y-2 text-sm text-[#F8F9FA]/85 list-disc list-inside">
            <li>All assets shown here are mock demo data.</li>
            <li>Operators must be authorized to perform scans.</li>
            <li>No PHI is collected, transmitted, or stored.</li>
            <li>No production data is included in this preview.</li>
            <li>Human approval is required for every scan event before it enters any record system.</li>
            <li>LIMS BOX does not constitute a medical device and does not provide diagnosis.</li>
          </ul>
        </div>
      </section>

      {/* Label sheet preview */}
      <section className="px-6 py-16 border-t border-[#1E3A5F]/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Demo label sheet</h2>
          <p className="text-sm text-[#F8F9FA]/60 mb-6">
            Printable NTAG215 label set used in the Field Scout demo. Each tag is
            paired with a registry row above.
          </p>
          <div className="rounded-lg overflow-hidden border border-[#1E3A5F]/40 bg-[#0a0f1a]">
            <Image
              src="/brand/field-scout-labels-sheet.png"
              alt="Field Scout demo label sheet (mock asset tags)"
              width={1200}
              height={900}
              className="w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-[#1E3A5F]/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want a Field Scout walkthrough for your lab?
          </h2>
          <p className="text-[#F8F9FA]/70 mb-6">
            We&apos;ll bring a LIMS BOX with the demo registry pre-loaded and walk
            your team through the scan-to-approval loop.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/early-adopter"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold transition-all text-white"
            >
              Request a walkthrough
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#1E3A5F]/60 hover:border-[#2E8B57]/60 rounded-lg font-semibold transition-all text-[#F8F9FA]"
            >
              Back to LIMS BOX
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
