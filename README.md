# Moon Landing Timeline

Interactive, easy-to-read timeline of significant Moon / lunar exploration activity for the next ~5+ years (stretch to ~2035 where public dates exist).

## Goals
- Deep international coverage: NASA Artemis + US commercial, China (ILRS/Chang’e), Russia, ESA/JAXA/ISRO and other partners
- Source-cited events with confidence + date precision (no invented day-level dates)
- Eventually: polished interactive UI for public / @TheLimitingFctr audience

## Layout
- `data/events` — timeline events (JSON)
- `data/actors` — agencies, companies, nations
- `data/sources` — canonical references
- `research` — notes, contradictions, open questions
- `docs` — schema, project brief, Omarchy dev setup
- `app` — future interactive front-end (not started)

## Omarchy status (2026-09-13)
- Path: `~/Projects/moon-landing-timeline`
- Present: git, Node 26, Python, Docker package (daemon not usable yet; jack not in docker group)
- Missing for full agent-dev: Cursor app, SSH keys, Docker group/daemon

## Workflow
1. Finish Omarchy tooling (Cursor, Docker, SSH)
2. Grow `data/` as the source of truth
3. Build interactive timeline on top of that data
