# Moon Landing Timeline — Project Brief

**Live site:** https://earltheduke.github.io/moon-landing-timeline/  
**Repo:** https://github.com/EarlTheDuke/moon-landing-timeline (GitHub Pages from `master`)  
**Audience:** Public interactive timeline for [@TheLimitingFctr](https://x.com/TheLimitingFctr) and general readers  
**Status:** Public v1 — data + interactive UI + sharing tools shipped  
**Research snapshot:** 2026-09-13 (PT)

## Goals

1. Compile a **source-cited**, structured timeline of significant lunar exploration from **2024 through ~2031**, stretching to **~2035** where public dates exist.
2. Cover **international** programs with equal seriousness: NASA Artemis + US commercial, China (CLEP / ILRS / crewed), Russia (Luna), ESA/JAXA/ISRO/UAE/Korea/Canada and partnership roles.
3. Prefer **primary sources** (NASA, ESA, CNSA/CMSA, ISRO, company blogs) and high-quality secondary (SpaceNews, Spaceflight Now, NASASpaceflight).
4. Present it as a **vibrant, pinnable page**: photos, a decade-at-a-glance map, "what's next" answered in the first screen, and share cards that carry the sourcing with them — without inventing precision that agencies have not published.

## Scope

### In scope
- NASA Artemis II–VI+, SLS/Orion, HLS (Starship HLS, Blue Moon), xEVA suits, Moon Base / LTV
- Gateway (including pause/cancel and HALO/PPE repurposing)
- CLPS and related commercial landers/rovers (SpaceX, Blue Origin, Astrobotic, Intuitive Machines, Firefly, Draper, ispace, etc.)
- China: Chang'e, Queqiao, CMSA crewed architecture (LM-10 / Mengzhou / Lanyue), ILRS
- Russia: Luna-26+, ILRS cooperation, nuclear power concepts if dated
- Other agencies: ESA (Moonlight, Argonaut, MAGPIE, Orion ESM), JAXA (LUPEX), ISRO (Chandrayaan-4/5), UAE Rashid, Korea payloads, CSA crew/robotics
- Infrastructure with dates: lunar relays, power, habitats, ISRU demos

### Out of scope (for now)
- Every CubeSat or unnamed rideshare
- Mars-only missions (except where Moon-to-Mars architecture is the lunar event itself)
- Speculative fan timelines without agency/company attribution
- Auto-posting: the site never publishes anything; it only drafts and copies

## Data rules

| Rule | Practice |
|------|----------|
| Cite sources | Every event has ≥1 `sources[]` entry with URL, title, publisher, `accessed` date |
| No invented days | If only a year is known → `date_precision: "year"`. Month only → `"month"`. Ranges → `"range"` + `date_end` |
| Confidence | `confirmed` (occurred / official firm fact), `planned` (agency/company published target), `rumored` (secondary/inferred/conceptual) |
| Status honesty | Use `slipped`, `cancelled`, `conceptual` when schedules change or are notional |
| Prefer primary | NASA/ESA/CNSA/ISRO/company releases over aggregators; aggregators OK for discovery then verify |
| Contradictions | Do not silently pick a side — document in `research/NOTES.md` and keep wider precision |
| Images | Only NASA public-domain or Wikimedia Commons CC images, always credited; provenance in `data/images/images.json` |
| Quality over filler | ~100–130 high-signal events (119 today) |

## Deliverables

| Path | Purpose |
|------|---------|
| `docs/PROJECT.md` | This brief |
| `docs/SCHEMA.md` | Event / actor / source / image field definitions |
| `data/events/events.json` | Timeline events (source of truth) |
| `data/actors/actors.json` | Orgs / agencies / companies |
| `data/sources/sources.json` | Canonical reference URLs |
| `data/images/images.json` | Image provenance and program fallbacks |
| `research/NOTES.md` | Open questions & schedule contradictions |
| `app/` | Static site: main page, decade overview, Highlights drafting, share cards, per-event preview pages |
| `scripts/` | `fetch_images.py`, `fetch_flags.py`, `build_og.py` — regenerate derived assets from the data |

## Success criteria

- [x] JSON validates (`json.load`)
- [x] Events cite sources and mark confidence / date precision
- [x] Interactive timeline UI, hosted publicly
- [x] Visual overview of the decade with milestone images and click-through detail
- [x] Rich link previews (Open Graph / X cards) for the site and for every event
- [ ] Keep the snapshot current: re-verify open events monthly, log slips in `research/NOTES.md`

## Maintenance loop

1. Edit `data/events/events.json` (and `scripts/image_manifest.json` for new pictures).
2. `python scripts/fetch_images.py && python scripts/build_og.py --events --pages`.
3. Commit, push `master`; GitHub Pages redeploys in about a minute.
