"use client";

import { useEffect, useRef, useState } from "react";
import { GREETING } from "@/lib/assistant/persona";

// Floating site-assistant widget (prototype). Renders nothing unless
// NEXT_PUBLIC_ASSISTANT_ENABLED=1 at build time — safe to keep mounted in layout.

type Msg = { role: "user" | "assistant"; text: string };

export default function AssistantWidget() {
  const enabled = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "1";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef(`s-${Math.random().toString(36).slice(2, 10)}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  if (!enabled) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? data.error ?? "Something went wrong — try info@lims.bot." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Connection hiccup — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#0a0f1a] shadow-2xl">
          <div className="flex items-center justify-between bg-[#2E8B57] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Box Tech</p>
              <p className="text-xs text-white/80">LIMS BOX assistant · prototype</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user" ? "ml-auto bg-[#2E8B57] text-white" : "bg-[#1E3A5F]/40 text-[#F8F9FA]"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && <div className="rounded-xl bg-[#1E3A5F]/40 px-3 py-2 text-sm text-[#F8F9FA]/60">…</div>}
          </div>
          <div className="border-t border-[#1E3A5F] p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about pricing, compliance…"
                maxLength={1000}
                className="flex-1 rounded-lg border border-[#1E3A5F] bg-transparent px-3 py-2 text-sm text-[#F8F9FA] placeholder-[#F8F9FA]/40 focus:border-[#2E8B57] focus:outline-none"
              />
              <button
                onClick={send}
                disabled={busy}
                className="rounded-lg bg-[#E67E22] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <a href="/early-access" className="mt-2 block text-center text-xs font-medium text-[#2E8B57] hover:underline">
              Skip the chat — apply for Early Access →
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open LIMS BOX assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2E8B57] text-2xl text-white shadow-lg transition hover:scale-105"
      >
        {open ? "▾" : "🧪"}
      </button>
    </div>
  );
}
