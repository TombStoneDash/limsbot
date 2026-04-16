import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { labName, labSize, instruments, currentLims, painPoint, name, email, phone } = body;

    if (!labName || !name || !email || !painPoint) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    // Log submission (Vercel logs capture this)
    console.log("🔔 NEW EARLY ACCESS APPLICATION:", JSON.stringify({ labName, name, email, painPoint }));

    // Persist to Supabase
    const { data, error } = await supabase
      .from("limsbox_early_access")
      .insert({
        lab_name: labName,
        lab_size: labSize || null,
        instruments: instruments || null,
        current_lims: currentLims || null,
        pain_point: painPoint,
        name,
        email,
        phone: phone || null,
        source: "lims.bot/early-access",
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      // Still return success to user - don't expose internal errors
    } else {
      console.log("✅ Saved to Supabase:", data);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
