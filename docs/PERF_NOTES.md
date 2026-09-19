# Homepage performance notes

Baseline: the existing root `lighthouse-report.json`, collected on 2026-03-25
for `https://lims.bot/`, reports **96/100** performance. This is the existing
measurement, not a score for these changes.

## Targeted audits

- **Unused JavaScript** (`unused-javascript`, score 0): estimated 53 KiB
  (54,495 bytes) unused across two bundles, with 300 ms estimated savings.
  The entire homepage was a client component although only its two waitlist
  forms need state. Move those forms, unchanged, into `src/app/waitlist-forms.tsx`
  with their own client boundary; render the remaining homepage on the server.
  This keeps static sections and their data out of the page's client module.
  The report has no source mapping proving all flagged bytes belong to the
  homepage, so framework overhead and the exact savings remain unverified.
- **Speed Index / LCP** (`speed-index`, score 0.72, 4.5 s;
  `largest-contentful-paint`, score 0.97, 2.0 s): remove the hero's 800 ms
  opacity/translation entrance animation so above-the-fold content is visible
  immediately. The historical LCP element was the navigation text, not an image;
  this change targets current hero visual completion, not a claim that the
  historical LCP element is still present or that its delay is fully resolved.

Image delivery and image sizing do not fail in this report; current homepage
images already use Next.js Image with dimensions or fill/sizes. The 80 ms
render-blocking opportunity is the core stylesheet, and legacy JavaScript is
framework code; avoid risky CSS deferral or browser-support changes for these.
Content, form behavior, and data files are unchanged.

## Verification

Run `npm run build`, `npm run lint`, and `npm test`. A fresh Lighthouse run is
needed to confirm whether the performance score improved. No deployed-URL
Lighthouse run or new score is part of this change.

Local results:

- `npm run lint`: passed (two existing warnings in `layout.tsx` and
  `lims-bot/page.tsx`).
- `npm test`: 31 tests passed across three files.
- `npm run build`: blocked fetching Inter from `fonts.googleapis.com`.
- Exact source comparison against HEAD confirmed both form bodies are unchanged
  and the remaining page differs only in its imports/client boundary and the
  removed hero animation class.

Dependency caveat: network installation stalled and offline `npm ci` failed on
an uncached package. Verification used copied local dependencies (Next 16.1.6)
plus the available Vitest 5.0.0, rather than locked Vitest 4.1.10; some other
local dependency versions also differ from the lockfile. Repeat verification
with `npm ci` in a network-enabled environment. No dependency manifests or
lockfiles were changed.
