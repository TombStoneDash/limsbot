import { NextResponse } from "next/server";
import { SCRIPTED, DEFAULT_REPLY } from "@/lib/assistant/persona";

// Prototype site-assistant endpoint — rule-based, no LLM call, no secrets.
// See docs/bots/SITE_ASSISTANT_BOT_PLAN.md for the LLM upgrade path.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>(); // per-instance; fine for serverless prototype

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many messages — give it a minute." }, { status: 429 });
  }

  let body: { message?: unknown; sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId =
    typeof body.sessionId === "string" && /^[a-z0-9-]{6,40}$/i.test(body.sessionId)
      ? body.sessionId
      : "anon";
  if (!message || message.length > 1000) {
    return NextResponse.json({ error: "Message must be 1-1000 characters." }, { status: 400 });
  }

  const matched = SCRIPTED.find((s) => s.match.test(message));
  const reply = matched?.reply ?? DEFAULT_REPLY;
  const intent = matched?.intent ?? "default";

  // Proof/logging: Vercel logs capture this for review at info@lims.bot,
  // same pattern as /api/waitlist and /api/early-access.
  console.log(
    JSON.stringify({
      type: "assistant_transcript",
      ts: new Date().toISOString(),
      sessionId,
      intent,
      user: message,
      assistant: reply,
    })
  );

  return NextResponse.json({ reply, intent, mode: "scripted" });
}
