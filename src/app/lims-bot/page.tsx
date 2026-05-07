"use client";

import { useState } from "react";
import Link from "next/link";

type Workflow =
  | "field_sample"
  | "chain_of_custody"
  | "instrument_maintenance"
  | "reagent_lot"
  | "asset_scan"
  | "pilot_summary";

type Asset = {
  id: string;
  label: string;
  type: string;
  description: string;
};

type AuditEvent = {
  id: string;
  timestamp: string;
  workflow: Workflow;
  draftTitle: string;
  status: "approved" | "rejected" | "edited-approved";
  mode: "live" | "template";
  preview: string;
};

type DraftResult = {
  draftTitle: string;
  draftRecord: string;
  structuredFields: Record<string, string | number | boolean>;
  requiresHumanApproval: boolean;
  safetyNote: string;
  suggestedNextAction: string;
  mode: "live" | "template";
};

const MOCK_ASSETS: Asset[] = [
  {
    id: "sciclone-g3",
    label: "Sciclone G3 NGSx Workstation",
    type: "Liquid handler",
    description: "High-throughput NGS prep — bay 2",
  },
  {
    id: "flipper-scout",
    label: "Flipper Zero Field Scout",
    type: "Discovery / scan tool",
    description: "Authorized lab discovery only",
  },
  {
    id: "lims-router",
    label: "Offline LIMS BOX Router",
    type: "Edge appliance",
    description: "Local-first capture, no internet required",
  },
  {
    id: "centrifuge",
    label: "Bench centrifuge",
    type: "Sample prep",
    description: "Weekly inspection due",
  },
  {
    id: "label-printer",
    label: "Label printer",
    type: "Output device",
    description: "Accessioning bay",
  },
];

const MOCK_REAGENTS = [
  { id: "buffer-a", label: "Buffer A · Lot LOT-2026-001 · Exp 2026-08-15" },
];

const MOCK_SAMPLES = [
  { id: "fc-001", label: "Field Collection 001" },
];

const WORKFLOWS: { id: Workflow; label: string; helper: string }[] = [
  {
    id: "field_sample",
    label: "Field sample documentation",
    helper: "Draft a sample collection record from a field event.",
  },
  {
    id: "chain_of_custody",
    label: "Chain-of-custody event",
    helper: "Draft a custody transfer from the field operator to receiving.",
  },
  {
    id: "instrument_maintenance",
    label: "Instrument maintenance log",
    helper: "Draft a maintenance / inspection log entry.",
  },
  {
    id: "reagent_lot",
    label: "Reagent / lot check",
    helper: "Draft a reagent lot verification record.",
  },
  {
    id: "asset_scan",
    label: "Asset scan explanation",
    helper: "Draft an asset reconciliation note from a scan event.",
  },
  {
    id: "pilot_summary",
    label: "Pilot summary report",
    helper: "Summarize approved/rejected drafts in this demo session.",
  },
];

function shortId() {
  return Math.random().toString(36).slice(2, 8);
}

function nowStamp() {
  return new Date().toLocaleString("en-US", { hour12: false });
}

export default function LimsBotPage() {
  const [workflow, setWorkflow] = useState<Workflow>("field_sample");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(MOCK_ASSETS[0]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [scanned, setScanned] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [editedRecord, setEditedRecord] = useState<string>("");
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string>("");

  const approvedCount = audit.filter(
    (e) => e.status === "approved" || e.status === "edited-approved"
  ).length;
  const rejectedCount = audit.filter((e) => e.status === "rejected").length;

  async function generateDraft() {
    setError("");
    setLoading(true);
    setDraft(null);
    try {
      const context: Record<string, unknown> = {
        asset: selectedAsset.label,
        assetType: selectedAsset.type,
        sample: MOCK_SAMPLES[0].label,
        lot: MOCK_REAGENTS[0].label,
        operator: "Demo operator",
      };
      if (workflow === "pilot_summary") {
        context.approvedCount = approvedCount;
        context.rejectedCount = rejectedCount;
      }
      const r = await fetch("/api/lims-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow,
          userMessage,
          context,
        }),
      });
      if (!r.ok) {
        setError(`API error: ${r.status}`);
        setLoading(false);
        return;
      }
      const data: DraftResult = await r.json();
      setDraft(data);
      setEditedRecord(data.draftRecord);
    } catch (e) {
      setError("Network error generating draft.");
    } finally {
      setLoading(false);
    }
  }

  function commitAudit(status: "approved" | "rejected" | "edited-approved") {
    if (!draft) return;
    const event: AuditEvent = {
      id: shortId(),
      timestamp: nowStamp(),
      workflow,
      draftTitle: draft.draftTitle,
      status,
      mode: draft.mode,
      preview: editedRecord.split("\n")[0]?.slice(0, 80) || draft.draftTitle,
    };
    setAudit((prev) => [event, ...prev].slice(0, 50));
    setDraft(null);
    setEditedRecord("");
    setUserMessage("");
    setScanned(false);
  }

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA]">
      <header className="border-b border-[#1E3A5F]/40 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-xs text-[#F8F9FA]/40 hover:text-[#F8F9FA]/70"
            >
              ← lims.bot
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              LIMS <span className="gradient-text">BOT</span>{" "}
              <span className="text-base font-normal text-[#F8F9FA]/40">
                v0 · demo
              </span>
            </h1>
            <p className="text-sm text-[#F8F9FA]/60 mt-2 max-w-2xl">
              A narrow, safe, human-in-the-loop lab documentation assistant.
              Try a mock scan, generate a documentation draft, edit it, and
              approve it into the demo audit log.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E85D3B]/10 border border-[#E85D3B]/40 text-xs text-[#E85D3B]">
              Human approval required
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1E3A5F]/30 border border-[#1E3A5F]/60 text-xs text-[#F8F9FA]/70">
              Demo uses mock data
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1E3A5F]/30 border border-[#1E3A5F]/60 text-xs text-[#F8F9FA]/70">
              No diagnostic interpretation
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* LEFT: workflow + scan + chat */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-lg border border-[#1E3A5F]/40 p-5 bg-[#1E3A5F]/10">
            <h2 className="text-sm uppercase tracking-wide text-[#2DBDB6] mb-3">
              1. Choose workflow
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {WORKFLOWS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setWorkflow(w.id);
                    setDraft(null);
                  }}
                  className={`text-left px-3 py-2 rounded border text-sm transition ${
                    workflow === w.id
                      ? "border-[#2DBDB6] bg-[#2DBDB6]/10 text-[#F8F9FA]"
                      : "border-[#1E3A5F]/60 hover:border-[#2DBDB6]/60 text-[#F8F9FA]/80"
                  }`}
                >
                  <div className="font-medium">{w.label}</div>
                  <div className="text-xs text-[#F8F9FA]/50 mt-0.5">{w.helper}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#1E3A5F]/40 p-5 bg-[#1E3A5F]/10">
            <h2 className="text-sm uppercase tracking-wide text-[#2DBDB6] mb-3">
              2. Mock scan / select asset
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => setScanned(true)}
                className="px-4 py-2 rounded bg-[#E85D3B] hover:bg-[#E85D3B]/90 text-white text-sm font-medium"
              >
                Mock scan ▶
              </button>
              {scanned && (
                <span className="text-xs text-[#2DBDB6]">
                  ✓ Scanned · authorized lab environment
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {MOCK_ASSETS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAsset(a)}
                  className={`text-left px-3 py-2 rounded border text-sm transition ${
                    selectedAsset.id === a.id
                      ? "border-[#E85D3B] bg-[#E85D3B]/10"
                      : "border-[#1E3A5F]/60 hover:border-[#E85D3B]/60"
                  }`}
                >
                  <div className="font-medium">{a.label}</div>
                  <div className="text-xs text-[#F8F9FA]/50 mt-0.5">
                    {a.type} · {a.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#1E3A5F]/40 p-5 bg-[#1E3A5F]/10">
            <h2 className="text-sm uppercase tracking-wide text-[#2DBDB6] mb-3">
              3. Operator note (optional)
            </h2>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="e.g., Routine field collection, conditions nominal."
              rows={3}
              className="w-full bg-[#0a0f1a] border border-[#1E3A5F]/60 rounded px-3 py-2 text-sm text-[#F8F9FA] placeholder:text-[#F8F9FA]/30 focus:border-[#2DBDB6] focus:outline-none"
            />
            <button
              disabled={loading}
              onClick={generateDraft}
              className="mt-3 px-5 py-2 rounded bg-[#2DBDB6] hover:bg-[#2DBDB6]/90 text-[#0a0f1a] text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Drafting…" : "Generate draft"}
            </button>
            {error && (
              <p className="mt-2 text-xs text-[#E85D3B]">{error}</p>
            )}
          </div>

          {draft && (
            <div className="rounded-lg border border-[#2DBDB6]/40 p-5 bg-[#2DBDB6]/5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-sm uppercase tracking-wide text-[#2DBDB6]">
                  4. Draft preview
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    draft.mode === "live"
                      ? "bg-[#2E8B57]/20 text-[#2E8B57] border border-[#2E8B57]/40"
                      : "bg-[#1E3A5F]/40 text-[#F8F9FA]/70 border border-[#1E3A5F]/60"
                  }`}
                >
                  {draft.mode === "live"
                    ? "Live AI draft"
                    : "Demo template draft"}
                </span>
              </div>
              <div className="text-base font-semibold mb-2">{draft.draftTitle}</div>
              <textarea
                value={editedRecord}
                onChange={(e) => setEditedRecord(e.target.value)}
                rows={Math.min(14, Math.max(8, editedRecord.split("\n").length + 1))}
                className="w-full bg-[#0a0f1a] border border-[#1E3A5F]/60 rounded px-3 py-2 text-sm font-mono text-[#F8F9FA] focus:border-[#2DBDB6] focus:outline-none"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() =>
                    commitAudit(
                      editedRecord !== draft.draftRecord
                        ? "edited-approved"
                        : "approved"
                    )
                  }
                  className="px-4 py-2 rounded bg-[#2E8B57] hover:bg-[#2E8B57]/90 text-white text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => setEditedRecord(draft.draftRecord)}
                  className="px-4 py-2 rounded border border-[#1E3A5F]/60 hover:border-[#2DBDB6]/60 text-sm"
                >
                  Reset edits
                </button>
                <button
                  onClick={() => commitAudit("rejected")}
                  className="px-4 py-2 rounded border border-[#E85D3B]/60 text-[#E85D3B] hover:bg-[#E85D3B]/10 text-sm"
                >
                  Reject
                </button>
              </div>
              <p className="mt-3 text-xs text-[#F8F9FA]/50 italic">
                {draft.safetyNote} {draft.suggestedNextAction}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: audit log */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-[#1E3A5F]/40 p-5 bg-[#1E3A5F]/10 sticky top-4">
            <h2 className="text-sm uppercase tracking-wide text-[#2DBDB6] mb-3">
              Demo audit log
            </h2>
            <div className="text-xs text-[#F8F9FA]/60 mb-3 flex flex-wrap gap-3">
              <span>Approved: <strong className="text-[#2E8B57]">{approvedCount}</strong></span>
              <span>Rejected: <strong className="text-[#E85D3B]">{rejectedCount}</strong></span>
              <span>Total: <strong>{audit.length}</strong></span>
            </div>
            {audit.length === 0 ? (
              <p className="text-xs text-[#F8F9FA]/40 italic">
                No events yet. Generate a draft and approve or reject it.
              </p>
            ) : (
              <ul className="space-y-2 max-h-[28rem] overflow-y-auto">
                {audit.map((e) => (
                  <li
                    key={e.id}
                    className="text-xs border-l-2 pl-2 py-1"
                    style={{
                      borderColor:
                        e.status === "rejected"
                          ? "#E85D3B"
                          : e.status === "edited-approved"
                          ? "#2DBDB6"
                          : "#2E8B57",
                    }}
                  >
                    <div className="text-[#F8F9FA]/40">{e.timestamp}</div>
                    <div className="font-medium text-[#F8F9FA]">
                      {e.draftTitle}
                    </div>
                    <div className="text-[#F8F9FA]/50">
                      {e.workflow} ·{" "}
                      <span
                        className={
                          e.status === "rejected"
                            ? "text-[#E85D3B]"
                            : "text-[#2E8B57]"
                        }
                      >
                        {e.status}
                      </span>{" "}
                      · {e.mode === "live" ? "live" : "template"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-[#1E3A5F]/40 p-5 bg-[#1E3A5F]/10 text-xs text-[#F8F9FA]/60 leading-relaxed">
            <div className="font-semibold text-[#F8F9FA]/80 mb-2">Safety posture</div>
            <ul className="space-y-1">
              <li>· AI drafts. Human approves.</li>
              <li>· No diagnostic interpretation.</li>
              <li>· No automatic record commit.</li>
              <li>· Demo uses mock data.</li>
              <li>· Designed for lab documentation workflows.</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-[#1E3A5F]/40">
              Related:{" "}
              <Link href="/field-scout" className="text-[#2DBDB6] hover:underline">
                Field Scout
              </Link>{" "}
              ·{" "}
              <Link
                href="/lab-operations-logs"
                className="text-[#2DBDB6] hover:underline"
              >
                Lab Operations Logs
              </Link>{" "}
              ·{" "}
              <Link
                href="/ai-pathology"
                className="text-[#2DBDB6] hover:underline"
              >
                AI Pathology
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
