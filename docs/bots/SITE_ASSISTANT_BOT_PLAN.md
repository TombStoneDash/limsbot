# BOT_PLAN — LIMS BOT site assistant ("Box Tech")

*Branch `feature/bot-site-assistant-2026-07-04` · 2026-07-04 · prototype is flag-gated and OFF by default. Full build packet: `~/clawd/outbox/factory/lims-box/SPRINT_limsbot-site-assistant_2026-07-04.md`.*

- **product:** THE LIMS BOX / LIMS BOT (lims.bot) — plug-and-play, AI-powered, fully offline LIMS appliance for small labs (5–50 staff, under $500/mo).
- **personality:** "Box Tech" — veteran lab-ops lead. Calm, precise, zero hype; speaks COC/QC/ISO 17025 when the visitor does. Full prompt: `src/lib/assistant/persona.ts`.
- **user jobs:** Is this right for my lab type/size? What does it cost? Does it cover my compliance framework (ISO 17025 / EPA / CLIA / COLA)? How long to deploy / migrate off LabWare-STARLIMS-QBench-spreadsheets? How does on-prem AI work? Book a demo.
- **sales goal:** Qualified Early Access applications. Qualify on lab type, size, instruments, current LIMS, top pain → hand off to `/early-access` (existing form + API). Secondary: demo requests to info@lims.bot.
- **lead capture fields:** reuse `/api/early-access` exactly: labName, labSize, instruments, currentLims, painPoint, name, email, phone. Widget's "skip the chat" link goes there today; phase 2 = bot fills the form conversationally and POSTs to the same endpoint.
- **safety rules:** no compliance/legal/medical rulings (informational only); never invent pricing/certifications/roadmap ("ISO 17025 *ready*", never "certified"); instruct users not to paste PHI/patient data; no competitor bashing; prompt-injection resistant (rules live server-side in system prompt); off-topic → decline + redirect.
- **data it may access:** public site copy (pages, blog), published pricing/positioning, the persona FAQ corpus, its own conversation.
- **data it must not access:** env secrets, other visitors' leads/transcripts, Vercel/infra details, anything not on the public site. No DB access in v1.
- **first UI placement:** floating bubble bottom-right on all pages via root layout, gated by `NEXT_PUBLIC_ASSISTANT_ENABLED=1` (default off → renders nothing). Highest-intent pages (`/`, `/early-access`, blog) get it automatically.
- **backend/API needs:** `POST /api/assistant` (exists, scripted mode). Phase 2: `@anthropic-ai/sdk` + `ANTHROPIC_API_KEY` (Vercel env, Hudson-gated), model via `ASSISTANT_MODEL` env — default `claude-opus-4-8`; `claude-haiku-4-5` ($1/$5 per MTok) is the cheap-tier candidate, Hudson decides. In-route rate limit 20 msg/min/IP (upgrade to durable store later).
- **proof/logging:** every turn logged as `assistant_transcript` JSON to Vercel logs (same channel the lead APIs already use). Phase 2: nightly transcript digest + lead-attribution ("assistant → early-access") via gtag event.
- **Codex/Sonnet build packet:** `~/clawd/outbox/factory/lims-box/SPRINT_limsbot-site-assistant_2026-07-04.md`
- **true Hudson gates:** (class 2) create/set `ANTHROPIC_API_KEY` in Vercel; (class 3) approve LLM spend + model tier; (class 4) privacy-policy line for logged chats + AI disclosure; (class 6) flipping `NEXT_PUBLIC_ASSISTANT_ENABLED=1` in production / merging to main / any deploy.

## Prototype contents (this branch)
| File | What |
|---|---|
| `src/lib/assistant/persona.ts` | System prompt (LLM-ready) + scripted intent table |
| `src/app/api/assistant/route.ts` | Rule-based endpoint: validation, rate limit, transcript logging |
| `src/components/AssistantWidget.tsx` | Floating chat UI, brand colors, early-access handoff |
| `src/app/layout.tsx` | One-line flag-gated mount |

Run locally: `NEXT_PUBLIC_ASSISTANT_ENABLED=1 npm run dev` — no API key needed (scripted mode).
