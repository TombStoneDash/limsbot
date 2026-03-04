import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, organization, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Log submission (Vercel logs capture this)
    console.log("🔔 NEW WAITLIST SIGNUP:", JSON.stringify({ name, email, organization, role, timestamp: new Date().toISOString() }));

    // Store in Vercel KV or external service in future — for now, log is sufficient
    // Submissions visible in Vercel dashboard → Logs

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
