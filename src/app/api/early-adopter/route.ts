import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "early-adopter.json");

interface EarlyAdopterEntry {
  labName: string;
  labType: string;
  contactName: string;
  email: string;
  testVolume: string;
  painPoint: string;
  timestamp: string;
  source: string;
}

async function loadEntries(): Promise<EarlyAdopterEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveEntries(entries: EarlyAdopterEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { labName, labType, contactName, email, testVolume, painPoint } = body;

    if (!labName || !labType || !contactName || !email || !testVolume || !painPoint) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const entry: EarlyAdopterEntry = {
      labName,
      labType,
      contactName,
      email,
      testVolume,
      painPoint,
      timestamp: new Date().toISOString(),
      source: "lims.bot/early-adopter",
    };

    // Log submission (Vercel logs capture this for monitoring)
    console.log("🔔 NEW EARLY-ADOPTER PILOT APPLICATION:", JSON.stringify(entry));

    // Persist to JSON file (works in dev; on Vercel, logs are the fallback)
    try {
      const entries = await loadEntries();
      entries.push(entry);
      await saveEntries(entries);
      console.log("📁 Entry saved to data/early-adopter.json");
    } catch (fsErr) {
      // Vercel serverless has read-only filesystem — log only
      console.log("📁 File storage unavailable (serverless), entry logged above");
      console.error(fsErr);
    }

    return NextResponse.json({ ok: true, message: "Application received" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  // Simple endpoint to check submissions (requires manual access to Vercel logs for serverless)
  try {
    const entries = await loadEntries();
    return NextResponse.json({ count: entries.length, entries });
  } catch {
    return NextResponse.json({ count: 0, entries: [], note: "Check Vercel logs for submissions" });
  }
}
