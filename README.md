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
- `app` — static timeline browser + Highlights post drafting (plain HTML/CSS/JS, no build step)

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
- **Share a view**: mode, filters, sort and view are stored in the URL, so
  `…/app/?status=planned&country=US` or `…/app/?mode=highlights&beat=power` reopens the same slice.

### Highlights mode — drafting posts for X

Switch the toolbar toggle from **Timeline** to **Highlights** (or open `…/app/?mode=highlights`)
to get a curated slice of the timeline built for @TheLimitingFctr story beats.

Drafting a post, start to finish:

1. Serve the repo root, open `/app/`, click **Highlights**.
2. Pick a beat chip (say *Power & infrastructure gates*) and skim the cards.
3. Hit **Copy draft** on the one you want — that is the post, already under 280 characters.
4. Paste into X, edit in your own voice, and follow the card's **Source** link to double-check
   the claim before sending.
5. Want a picture with it? **Share card ↗** opens `share.html` for that event, framed 16:9 for a
   screenshot.

The details:

- **Story beats.** Chips group the curated events into *Crew on the Moon*, *Firsts & debuts*,
  *Power & infrastructure gates*, *Policy, money & contracts* and *Next up (24 months)*. Curation
  is derived from fields already in `events.json` (category, status, dates, keywords such as
  "first"/"reactor"/"sample return", citation count) — see `app/highlights.js`.
- **Copy blurb.** Every card shows the draft it will copy and a `NN/280` counter. **Copy draft**
  puts a ≤280 character post on the clipboard: the event title, its recorded date (or status +
  date for anything not yet completed), a blank line, and **the first sentence of the summary in
  the data, verbatim**. Nothing is invented or rewritten — if a claim is not in `events.json`,
  it will not be in the draft.
- **Draft options.** *Date / status line* (on by default) and *#Program tag* (off) change every
  draft at once. The same **Copy draft** button also sits at the bottom of each expanded card in
  Timeline mode, so any of the 119 events can be grabbed, not just the curated ones.
- **Why it was picked.** Each card lists the rules that matched ("Crewed landing", "Called a
  first", "Nuclear surface power", "Money attached"…) plus a link to the event's first source, so
  a draft can be checked before it is posted.
- **Search and filters still apply**, so `?mode=highlights&country=CN` highlights only China.

Nothing is ever posted anywhere: the app has no backend and no API keys. It only writes to your
clipboard when you press a copy button.

### Share card for screenshots

`app/share.html` renders a single event large enough to screenshot, and is deep-linkable:

```
http://127.0.0.1:8765/app/share.html?event=artemis-iv-2028
```

It has an event picker, prev/next, 16:9 / 1:1 / fit framing for the image crop, an **editable**
draft textarea with a live character count, and the event's sources listed underneath for a
last check. `…/app/?event=<id>` does the reverse: it opens the timeline scrolled to that event.

## Omarchy status (2026-09-13)
- Path: `~/Projects/moon-landing-timeline`
- Present: git, Node 26, Python, Docker package (daemon not usable yet; jack not in docker group)
- Missing for full agent-dev: Cursor app, SSH keys, Docker group/daemon

## Workflow
1. Finish Omarchy tooling (Cursor, Docker, SSH)
2. Grow `data/` as the source of truth
3. Build interactive timeline on top of that data
