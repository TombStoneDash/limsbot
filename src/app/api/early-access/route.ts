import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { labName, labSize, instruments, currentLims, painPoint, name, email, phone } = body;

    if (!labName || !name || !email || !painPoint) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const entry = {
      labName,
      labSize,
      instruments: instruments || undefined,
      currentLims,
      painPoint,
      name,
      email,
      phone: phone || undefined,
      timestamp: new Date().toISOString(),
      source: "lims.bot/early-access",
    };

    // Log submission (Vercel logs capture this)
    console.log("🔔 NEW EARLY ACCESS APPLICATION:", JSON.stringify(entry));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
