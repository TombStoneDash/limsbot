import { NextRequest, NextResponse } from "next/server";

/**
 * LIMS BOT v0 — Demo Drafting API
 *
 * Narrow, safe, human-in-the-loop lab documentation assistant.
 * - NOT a diagnostic tool.
 * - NOT a clinical decision tool.
 * - NOT auto-commit.
 * Drafts records for human review.
 *
 * If OPENAI_API_KEY is set in env, generates "Live AI draft".
 * Otherwise, deterministic template generation from mock data ("Demo template draft").
 * Demo never blocks on missing keys.
 */

type Workflow =
  | "field_sample"
  | "chain_of_custody"
  | "instrument_maintenance"
  | "reagent_lot"
  | "asset_scan"
  | "pilot_summary";

type LimsBotRequest = {
  workflow: Workflow;
  userMessage?: string;
  context?: Record<string, unknown>;
};

type LimsBotResponse = {
  draftTitle: string;
  draftRecord: string;
  structuredFields: Record<string, string | number | boolean>;
  requiresHumanApproval: boolean;
  safetyNote: string;
  suggestedNextAction: string;
  mode: "live" | "template";
};

const SAFETY_NOTE =
  "AI draft only. Human review required before committing.";
const NEXT_ACTION = "Approve, edit, or reject this draft.";

function ts(): string {
  return new Date().toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

function templateDraft(
  workflow: Workflow,
  userMessage: string,
  context: Record<string, unknown>
): LimsBotResponse {
  const asset =
    (context.asset as string) ||
    (context.assetName as string) ||
    "Sciclone G3 NGSx Workstation";
  const lot = (context.lot as string) || "Buffer A · Lot LOT-2026-001 · Exp 2026-08-15";
  const sample = (context.sample as string) || "Field Collection 001";
  const operator = (context.operator as string) || "Pending operator sign-off";

  switch (workflow) {
    case "field_sample":
      return {
        draftTitle: `Field Sample Documentation — ${sample}`,
        draftRecord:
          `Sample ID: ${sample}\n` +
          `Collected: ${ts()}\n` +
          `Location: GPS pending operator confirmation\n` +
          `Container: 50 mL conical · sealed · chain-of-custody label affixed\n` +
          `Operator note: ${userMessage || "Routine field collection. Conditions nominal."}\n` +
          `Storage: 4 °C field cooler — verify temp on receipt.\n` +
          `Status: Drafted by LIMS BOT — pending human approval.`,
        structuredFields: {
          sample_id: sample,
          container: "50_mL_conical",
          storage_c: 4,
          collection_method: "field_collection",
          operator_signoff: false,
        },
        requiresHumanApproval: true,
        safetyNote: SAFETY_NOTE,
        suggestedNextAction: NEXT_ACTION,
        mode: "template",
      };

    case "chain_of_custody":
      return {
        draftTitle: `Chain-of-Custody Event — ${sample}`,
        draftRecord:
          `Event: Custody transfer\n` +
          `Sample: ${sample}\n` +
          `From: Field Scout (operator)\n` +
          `To: Receiving lab (pending verification)\n` +
          `Timestamp: ${ts()}\n` +
          `Seal status: Intact (operator-attested)\n` +
          `Operator note: ${userMessage || "Standard handoff."}\n` +
          `Status: Drafted — awaiting receiving-side acknowledgement.`,
        structuredFields: {
          event_type: "custody_transfer",
          sample_id: sample,
          seal_intact: true,
          requires_receiver_ack: true,
        },
        requiresHumanApproval: true,
        safetyNote: SAFETY_NOTE,
        suggestedNextAction: NEXT_ACTION,
        mode: "template",
      };

    case "instrument_maintenance":
      return {
        draftTitle: `Maintenance Log — ${asset}`,
        draftRecord:
          `Asset: ${asset}\n` +
          `Task: ${userMessage || "Weekly inspection"}\n` +
          `Performed: ${ts()}\n` +
          `Findings: No anomalies observed. Surfaces wiped. Fluid levels nominal.\n` +
          `Next due: +7 days from today.\n` +
          `Operator: ${operator}\n` +
          `Status: Drafted by LIMS BOT — pending human approval.`,
        structuredFields: {
          asset_label: asset,
          maintenance_type: "weekly_inspection",
          interval_days: 7,
          findings_clear: true,
        },
        requiresHumanApproval: true,
        safetyNote: SAFETY_NOTE,
        suggestedNextAction: NEXT_ACTION,
        mode: "template",
      };

    case "reagent_lot":
      return {
        draftTitle: `Reagent Lot Check — ${lot}`,
        draftRecord:
          `Reagent: ${lot}\n` +
          `Verified: ${ts()}\n` +
          `Visual inspection: Clear, no precipitate, seal intact.\n` +
          `Storage: 4 °C — within range.\n` +
          `Days to expiry: 100 (calculated from lot expiry vs today).\n` +
          `Operator note: ${userMessage || "Routine lot verification."}\n` +
          `Status: Drafted — pending human approval.`,
        structuredFields: {
          reagent: "Buffer A",
          lot: "LOT-2026-001",
          expiry: "2026-08-15",
          storage_c: 4,
          condition_ok: true,
        },
        requiresHumanApproval: true,
        safetyNote: SAFETY_NOTE,
        suggestedNextAction: NEXT_ACTION,
        mode: "template",
      };

    case "asset_scan":
      return {
        draftTitle: `Asset Scan Explanation — ${asset}`,
        draftRecord:
          `Scanned asset: ${asset}\n` +
          `Discovery context: Authorized lab environment\n` +
          `Identified by: Field Scout (Flipper-assisted) · NFC/QR/barcode tag\n` +
          `Recent activity: Last documented event within 7-day window.\n` +
          `Suggested follow-ups: Confirm location, verify maintenance schedule, check linked sample IDs.\n` +
          `Operator note: ${userMessage || "Routine asset reconciliation."}\n` +
          `Status: Drafted — pending human approval.`,
        structuredFields: {
          asset_label: asset,
          scope: "authorized_lab_environment",
          scan_method: "nfc_qr_barcode",
          followups_count: 3,
        },
        requiresHumanApproval: true,
        safetyNote: SAFETY_NOTE,
        suggestedNextAction: NEXT_ACTION,
        mode: "template",
      };

    case "pilot_summary":
      const approved = (context.approvedCount as number) ?? 0;
      const rejected = (context.rejectedCount as number) ?? 0;
      const total = approved + rejected;
      return {
        draftTitle: `Pilot Summary — Demo Session ${ts()}`,
        draftRecord:
          `Demo session summary\n` +
          `Drafts approved: ${approved}\n` +
          `Drafts rejected: ${rejected}\n` +
          `Total drafts reviewed: ${total}\n` +
          `Approval rate: ${total > 0 ? Math.round((approved / total) * 100) : 0}%\n` +
          `Operator note: ${userMessage || "End-of-session review."}\n` +
          `Note: All drafts in this demo are mock data. No production records were created.\n` +
          `Status: Drafted — pending human approval.`,
        structuredFields: {
          drafts_approved: approved,
          drafts_rejected: rejected,
          drafts_total: total,
          data_source: "demo-mock-only",
        },
        requiresHumanApproval: true,
        safetyNote: SAFETY_NOTE,
        suggestedNextAction: NEXT_ACTION,
        mode: "template",
      };
  }
}

async function liveDraft(
  workflow: Workflow,
  userMessage: string,
  context: Record<string, unknown>
): Promise<LimsBotResponse | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const systemPrompt =
    "You are LIMS BOT, a narrow lab documentation drafting assistant. " +
    "You draft structured records for HUMAN REVIEW. You never make diagnostic, " +
    "clinical, or compliance claims. You never auto-commit. Output JSON only with " +
    "fields: draftTitle, draftRecord (multiline string), structuredFields (object). " +
    "Keep records concise (<=10 lines). Always end the draftRecord with: " +
    "'Status: Drafted by LIMS BOT — pending human approval.'";

  const userPrompt =
    `Workflow: ${workflow}\n` +
    `Operator note: ${userMessage}\n` +
    `Context: ${JSON.stringify(context)}\n\n` +
    `Draft a record for the workflow above. Output strict JSON only.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 600,
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (!parsed.draftTitle || !parsed.draftRecord) return null;
    return {
      draftTitle: parsed.draftTitle,
      draftRecord: parsed.draftRecord,
      structuredFields: parsed.structuredFields || {},
      requiresHumanApproval: true,
      safetyNote: SAFETY_NOTE,
      suggestedNextAction: NEXT_ACTION,
      mode: "live",
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: LimsBotRequest;
  try {
    body = (await req.json()) as LimsBotRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validWorkflows: Workflow[] = [
    "field_sample",
    "chain_of_custody",
    "instrument_maintenance",
    "reagent_lot",
    "asset_scan",
    "pilot_summary",
  ];
  if (!body.workflow || !validWorkflows.includes(body.workflow)) {
    return NextResponse.json(
      { error: "Missing or invalid 'workflow'" },
      { status: 400 }
    );
  }

  const userMessage = (body.userMessage || "").slice(0, 1000);
  const context = body.context || {};

  // Try live AI; fallback to template
  const live = await liveDraft(body.workflow, userMessage, context);
  const result = live || templateDraft(body.workflow, userMessage, context);

  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({
    name: "LIMS BOT v0",
    mode: process.env.OPENAI_API_KEY ? "live-capable" : "template-only",
    safety: [
      "AI drafts. Human approves.",
      "No diagnostic interpretation.",
      "No automatic record commit.",
      "Demo uses mock data.",
      "Designed for lab documentation workflows.",
    ],
    workflows: [
      "field_sample",
      "chain_of_custody",
      "instrument_maintenance",
      "reagent_lot",
      "asset_scan",
      "pilot_summary",
    ],
  });
}
