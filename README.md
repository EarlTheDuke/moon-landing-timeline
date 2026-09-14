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
- `app` — static timeline browser (plain HTML/CSS/JS, no build step)

## Preview the timeline

The app reads `../data/events/events.json` directly, so serve the **repo root**:

```bash
python3 -m http.server 8765
# then open http://127.0.0.1:8765/app/
```

Opening `app/index.html` straight from the filesystem will not work — browsers
block `fetch` on `file://` URLs.

### What the browser can do
- **Search** across titles, summaries, notes, actors, programs and country names
  (multiple words are ANDed; matches are highlighted). Press `/` to jump to the box.
- **Filter** by status, country, event type, program and confidence, plus decade
  by clicking a bar in the stats strip. Active filters show as removable chips.
- **Sort** oldest-first or newest-first, and switch between **Detailed** cards
  (summary, countries, actors, notes, sources) and **Compact** rows for fast
  scanning. Any card can be expanded on its own.
- **Jump to a year** with the year rail under the filters.
- **Share a view**: filters, sort and view mode are stored in the URL, so
  `…/app/?status=planned&country=US` reopens the same slice.

## Omarchy status (2026-09-13)
- Path: `~/Projects/moon-landing-timeline`
- Present: git, Node 26, Python, Docker package (daemon not usable yet; jack not in docker group)
- Missing for full agent-dev: Cursor app, SSH keys, Docker group/daemon

## Workflow
1. Finish Omarchy tooling (Cursor, Docker, SSH)
2. Grow `data/` as the source of truth
3. Build interactive timeline on top of that data
