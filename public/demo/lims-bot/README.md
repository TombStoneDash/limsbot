# LIMS BOX Chat Shell

Static offline chat shell for LIMS BOT reference support demos.

## Run

```bash
cd /Users/ops/clawd/projects/limsbox-reference/chat
python3 -m http.server 8081 --bind 0.0.0.0
```

Open `http://<mac-ip>:8081/` from a phone on the same SSID.

## Boundary

- No PHI.
- No live LLM.
- No auth.
- No analytics.
- No external CDN.
- No compliance guarantees.

## Files

- `index.html`: static shell and required banner/footer.
- `chat.css`: mobile-first local styling.
- `canned-router.js`: keyword router.
- `chat.js`: local fetch/render behavior.
- `canned/*.md`: placeholder vetted-content stubs for Daisy replacement.
