import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LIMS BOX Demo Loop",
  description:
    "Passive 84-second demo reel for booth and conference use. Autoplay, muted, loop, full-screen friendly. No diagnostic interpretation. Demo uses mock data.",
};

export default function DemoLoopPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] text-[#F8F9FA] flex flex-col">
      <header className="px-6 py-4 border-b border-[#1E3A5F]/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-[#F8F9FA]/40 hover:text-[#F8F9FA]/70"
          >
            ← lims.bot
          </Link>
          <h1 className="text-lg md:text-xl font-bold">
            LIMS BOX <span className="gradient-text">Demo Loop</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-[#1E3A5F]/30 border border-[#1E3A5F]/60 text-[#F8F9FA]/70">
            Demo uses mock data
          </span>
          <span className="px-2 py-1 rounded-full bg-[#1E3A5F]/30 border border-[#1E3A5F]/60 text-[#F8F9FA]/70">
            No diagnostic interpretation
          </span>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-6xl">
          <div
            className="relative w-full overflow-hidden rounded-lg border border-[#1E3A5F]/30 bg-black"
            style={{ paddingBottom: "56.25%" }}
          >
            <video
              className="absolute top-0 left-0 w-full h-full"
              src="/videos/lims-box-product-demo.mp4"
              poster="/images/branded-newcase.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls
              aria-label="LIMS BOX 84-second product demo (loop)"
            />
          </div>
          <p className="text-center mt-3 text-xs text-[#F8F9FA]/40">
            84-second loop · muted autoplay · click anywhere on the video to
            toggle controls. Press <kbd className="px-1 py-0.5 rounded bg-[#1E3A5F]/40">F</kbd> for full screen.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
          <Link
            href="/lims-bot"
            className="px-4 py-4 rounded-lg border border-[#2DBDB6]/40 bg-[#2DBDB6]/10 hover:bg-[#2DBDB6]/20 text-center text-sm font-semibold transition"
          >
            <div className="text-[#2DBDB6] text-xs uppercase tracking-wide mb-1">
              Demo
            </div>
            Try LIMS BOT
          </Link>
          <Link
            href="/field-scout/flipper"
            className="px-4 py-4 rounded-lg border border-[#E85D3B]/40 bg-[#E85D3B]/10 hover:bg-[#E85D3B]/20 text-center text-sm font-semibold transition"
          >
            <div className="text-[#E85D3B] text-xs uppercase tracking-wide mb-1">
              Field
            </div>
            Field Scout × Flipper
          </Link>
          <Link
            href="/ai-pathology"
            className="px-4 py-4 rounded-lg border border-[#2E8B57]/40 bg-[#2E8B57]/10 hover:bg-[#2E8B57]/20 text-center text-sm font-semibold transition"
          >
            <div className="text-[#2E8B57] text-xs uppercase tracking-wide mb-1">
              Why
            </div>
            AI Pathology
          </Link>
          <Link
            href="/lab-operations-logs"
            className="px-4 py-4 rounded-lg border border-[#1E3A5F]/60 bg-[#1E3A5F]/20 hover:bg-[#1E3A5F]/40 text-center text-sm font-semibold transition"
          >
            <div className="text-[#F8F9FA]/70 text-xs uppercase tracking-wide mb-1">
              Logs
            </div>
            Lab Operations
          </Link>
        </div>

        <p className="mt-8 text-xs text-[#F8F9FA]/40 max-w-2xl text-center">
          Self-hosted · no third-party embed · no analytics on this loop. Booth
          and conference safe. Pilot deployments start around $5,000.
        </p>
      </section>
    </main>
  );
}
