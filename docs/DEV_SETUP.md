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

## Validate data

```bash
cd ~/Projects/moon-landing-timeline
python3 -c 'import json; json.load(open("data/events/events.json")); print("ok")'
```

## Safety

- Do not commit secrets (`.env`, private keys).
- Avoid destructive `docker system prune` without intent.
