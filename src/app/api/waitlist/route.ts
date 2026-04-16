import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, organization, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // Log submission (Vercel logs capture this)
    console.log("🔔 NEW WAITLIST SIGNUP:", JSON.stringify({ name, email, organization, role }));

    // Persist to Supabase
    const { data, error } = await supabase
      .from("limsbox_waitlist")
      .upsert(
        {
          name,
          email,
          organization: organization || null,
          role: role || null,
          source: "lims.bot",
        },
        { onConflict: "email" }
      )
      .select();

    if (error) {
      console.error("Supabase error:", error);
      // Still return success to user - don't expose internal errors
      // Log will capture the submission regardless
    } else {
      console.log("✅ Saved to Supabase:", data);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
