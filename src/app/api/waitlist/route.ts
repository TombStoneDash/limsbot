import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

interface WaitlistEntry {
  name: string;
  email: string;
  organization?: string;
  role?: string;
  timestamp: string;
  source?: string;
}

async function loadEntries(): Promise<WaitlistEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveEntries(entries: WaitlistEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, organization, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    const entry: WaitlistEntry = {
      name,
      email,
      organization: organization || undefined,
      role: role || undefined,
      timestamp: new Date().toISOString(),
      source: "lims.bot",
    };

    // Log submission (Vercel logs capture this)
    console.log("🔔 NEW WAITLIST SIGNUP:", JSON.stringify(entry));

    // Persist to JSON file (works in dev; on Vercel, logs are the fallback)
    try {
      const entries = await loadEntries();
      entries.push(entry);
      await saveEntries(entries);
    } catch (fsErr) {
      // Vercel serverless has read-only filesystem — log only
      console.log("📁 File storage unavailable (serverless), entry logged above");
      console.error(fsErr);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
