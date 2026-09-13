# Omarchy Dev Setup Notes

**Machine:** Omarchy (`machineId` `5a081c52-bc37-469c-8f99-1e3fb52a3dd3`)  
**Project:** `/home/jack/Projects/moon-landing-timeline`  
**User:** `jack`  
**Checked:** 2026-09-13 PT

## Already present (data work can proceed)

| Tool | Notes |
|------|--------|
| **git** | 2.55.0 |
| **Node** | v26.8.1 via mise (`~/.local/share/mise/installs/node/...`) |
| **Python** | 3.14.7 |
| **Project dirs** | `docs/`, `data/{events,actors,sources}/`, `research/`, `app/` |

No extra runtime install is required to edit or validate JSON/Markdown for this phase.

```bash
cd ~/Projects/moon-landing-timeline
python3 -c 'import json; json.load(open("data/events/events.json")); print("ok")'
node -e 'JSON.parse(require("fs").readFileSync("data/events/events.json","utf8")); console.log("ok")'
```

## Still needed for full agent / app development

### 1. Cursor install
- Install the Cursor desktop app on Omarchy so local agents and the IDE share this tree.
- Open `~/Projects/moon-landing-timeline` as the workspace.

### 2. Docker daemon + docker group for `jack`
- Docker package may be installed, but **daemon not usable yet** and **`jack` is not in the `docker` group**.
- Typical fix (run with appropriate privileges):

```bash
# ensure service
sudo systemctl enable --now docker
# allow jack to talk to the daemon without root
sudo usermod -aG docker jack
# then log out/in (or newgrp docker) before docker ps
```

- Verify: `docker ps` as `jack` with no permission error.

### 3. SSH keys
- Generate or install SSH keys for GitHub/GitLab and any remote deploy hosts.
- Example:

```bash
ssh-keygen -t ed25519 -C "jack@omarchy" -f ~/.ssh/id_ed25519
# add ~/.ssh/id_ed25519.pub to GitHub/GitLab
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519
```

## Suggested next tooling (when building `app/`)

- Package manager already via Node/mise; pick a simple stack later (e.g. Vite + static JSON fetch).
- Optional: `jq` for CLI JSON queries; Docker only when you want containerized preview/deploy.
- Do **not** block data curation on Docker/Cursor — JSON + git + editor is enough for phase 1.

## Safety / ops

- Do not commit secrets (`.env`, keys). Keep SSH private keys out of the repo.
- This box is shared among agents; avoid destructive `docker system prune` without intent.
