# Moon Landing Timeline

**Live:** https://earltheduke.github.io/moon-landing-timeline/

What's happening on the Moon, in one sourced, interactive timeline: NASA Artemis and
US commercial landers, China's Chang'e / ILRS / crewed programme, Russia's Luna,
ESA, India, Japan, Korea, the UAE and partners — 2024 through the mid-2030s. Every
event cites its sources and states how precise the date is and how confident we are.
Built for [@TheLimitingFctr](https://x.com/TheLimitingFctr) and anyone who wants the
real schedule rather than the press-release one.

## What's on the page

- **Now & next** — the missions coming up soonest, with pictures and "in 5 days" style
  countdowns. *This month* and *All upcoming* filter the full list.
- **The decade at a glance** — a horizontal, draggable map of 2024–2035. Milestone
  picture cards sit above the axis; lanes below show every event by program (Artemis,
  CLPS, China, Russia, Europe, others) with a *Today* line. Hover a dot for a tooltip,
  click anything for the full detail dialog.
- **Race to the Moon** — a scoreboard: next crewed landing target for the US-led bloc vs
  China / ILRS partners, landing attempts so far, missions in the pipeline.
- **Schedule changes** — every slipped or cancelled item, newest first.
- **The full timeline** — 119 cards with photos, flags, program colours and milestone
  callouts. Past years are folded by default. Search, filter by status / country /
  type / program / confidence / month, sort, compact view, year rail, light and dark
  themes. Every view is a shareable URL (`?status=slipped&country=CN`,
  `?event=artemis-iv-2028` opens the dialog).
- **Highlights mode** — curated story beats with ready-to-edit ≤280-character drafts,
  built verbatim from the data (see below).
- **Share cards** — `app/share.html?event=<id>` shows one event on a photo card,
  downloadable as a 1200×675 or 1080×1080 PNG. Every event also has a stub page at
  `app/e/<id>.html` with its own preview image, so pasting that link into X shows the
  card.

## Layout

- `data/events` — timeline events (JSON, the source of truth)
- `data/actors` — agencies, companies, nations
- `data/sources` — canonical references
- `data/images` — provenance for every picture used
- `research` — notes, contradictions, open questions
- `docs` — schema, project brief, Omarchy dev setup
- `app` — the static site (plain HTML/CSS/JS, no build step)
  - `app.js` main page, `overview.js` decade map, `highlights.js` curation + drafts,
    `share.js` share cards, `data.js` shared helpers
  - `assets/img` photos (NASA public domain / Wikimedia Commons, credited),
    `assets/flags` SVG flags, `assets/share` per-event preview cards, `e/` stub pages
- `scripts` — Python helpers (Pillow required) that regenerate derived assets

## Run it locally

The app reads `../data/events/events.json` directly, so serve the **repo root**:

```bash
python -m http.server 8000
# then open http://127.0.0.1:8000/app/
```

Opening `app/index.html` straight from the filesystem will not work — browsers block
`fetch` on `file://` URLs.

## Updating the data

1. Edit `data/events/events.json` following `docs/SCHEMA.md` (cite sources, never
   invent day-level dates). Add an `image` block or a query in
   `scripts/image_manifest.json` if the event deserves its own picture.
2. Regenerate derived assets:

   ```bash
   pip install pillow
   python scripts/fetch_images.py            # download/resize/dedupe pictures from the manifest
   python scripts/fetch_flags.py             # SVG flags for any new country codes
   python scripts/build_og.py --events --pages   # og.png, per-event cards, app/e/*.html
   ```

3. Commit and push; GitHub Pages redeploys from `master`.

## Highlights mode — drafting posts for X

Switch the toolbar toggle from **Timeline** to **Highlights** (or open `…/app/?mode=highlights`).
Chips group curated events into *Crew on the Moon*, *Firsts & debuts*, *Power &
infrastructure gates*, *Policy, money & contracts* and *Next up (24 months)*; curation is
derived from fields already in `events.json` (see `app/highlights.js`).

**Copy draft** puts a ≤280 character post on the clipboard: the event title, its date (or
status + date for anything not yet completed), a blank line, and the first sentence of the
summary **verbatim**. Nothing is invented or rewritten. Each card says why it was picked and
links its first source so the claim can be checked before posting. **Copy link** copies the
event's stub URL (with preview card); **Share card ↗** opens the downloadable picture card.

Nothing is ever posted anywhere: the app has no backend and no API keys. It only writes to
your clipboard when you press a copy button.

## Contributing

Spotted a wrong date or a missing mission?
[Open an issue](https://github.com/EarlTheDuke/moon-landing-timeline/issues) with a link to a
primary source, or edit `data/events/events.json` and send a pull request.
