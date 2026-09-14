# Omarchy Dev Setup Notes

**Machine:** Omarchy (`machineId` `5a081c52-bc37-469c-8f99-1e3fb52a3dd3`)  
**Project:** `/home/jack/Projects/moon-landing-timeline`  
**User:** `jack`  
**Updated:** 2026-09-13 PT

## Done (Omar automated)

| Tool | Status |
|------|--------|
| **Cursor** | `cursor-bin` 3.20.10 + `cursor-cli` installed; launched on this project |
| **git** | 2.55.0; identity `jack snider` / `findlife42@gmail.com`; repo initialized |
| **SSH** | ed25519 key at `~/.ssh/id_ed25519`; `~/.ssh/config` has `github.com` |
| **Docker** | daemon enabled; `jack` in `docker` group (new login needed for group in terminals) |
| **Node / Python** | Node via mise; Python 3.x present |
| **App preview** | Static UI in `app/` — serve from repo root |

## You must do (sign-in / human)

1. **Cursor:** Sign in, then pick the **best / strongest** model on your plan for serious coding.
2. **Docker (optional now):** Log out/in once so terminals pick up the `docker` group (`docker ps` without permission errors).
3. **Remotes (later):** Add `~/.ssh/id_ed25519.pub` to GitHub/Origin when we push.

## Preview the timeline UI

```bash
cd ~/Projects/moon-landing-timeline
python3 -m http.server 8765
# open http://127.0.0.1:8765/app/
```

Serve the **repo root**, not `app/`: the page fetches `../data/events/events.json`
(and `../data/actors/actors.json` for actor links). Opening the file directly with
`file://` fails because browsers block those fetches.

`app/` is plain HTML + CSS + vanilla JS — no build, no dependencies, no install
step. Edit `app/index.html`, `app/styles.css` or `app/app.js` and reload.

Handy while developing:

| Thing | How |
|-------|-----|
| Focus search | Press `/` |
| Reproduce a view | Filters live in the URL, e.g. `?status=slipped&sort=desc&view=compact` |
| Scan quickly | **Compact** view toggle; click any card to expand just that one |
| Sanity-check a render | Filter chips + "Showing N of M events" line under the stats strip |
| Draft an X post | **Highlights** toggle → beat chip → **Copy draft** (`?mode=highlights`) |
| Screenshot one event | `app/share.html?event=<id>`, or **Share card ↗** on any card |

`app/data.js` holds the shared labels and date formatting, `app/highlights.js` the curation rules
and the ≤280 character draft builder, `app/app.js` the timeline and Highlights UI, `app/share.js`
the single-event card. Curation is pure functions over `events.json`, so it is easy to try in node:

```bash
node -e 'const fs=require("fs"),vm=require("vm");global.window=global;
for (const f of ["app/data.js","app/highlights.js"]) vm.runInThisContext(fs.readFileSync(f,"utf8"));
const events=JSON.parse(fs.readFileSync("data/events/events.json","utf8"));
for (const item of window.MLT_HIGHLIGHTS.curate(events)) console.log(item.score, item.beat, item.event.title);'
```

## Validate data

```bash
cd ~/Projects/moon-landing-timeline
python3 -c 'import json; json.load(open("data/events/events.json")); print("ok")'
```

## Safety

- Do not commit secrets (`.env`, private keys).
- Avoid destructive `docker system prune` without intent.
