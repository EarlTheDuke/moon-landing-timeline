# Moon Landing Timeline — Project Brief

**Path:** `/home/jack/Projects/moon-landing-timeline` (Omarchy)  
**Audience:** Public interactive timeline for [@TheLimitingFctr](https://twitter.com/TheLimitingFctr) and general readers  
**Status:** Data foundation (no interactive UI yet)  
**Research snapshot:** 2026-09-13 (PT)

## Goals

1. Compile a **source-cited**, structured timeline of significant lunar exploration from **~2025 through 2031**, stretching to **~2035** where public dates exist.
2. Cover **international** programs with equal seriousness: NASA Artemis + US commercial, China (CLEP / ILRS / crewed), Russia (Luna), ESA/JAXA/ISRO/UAE/Korea/Canada and partnership roles.
3. Prefer **primary sources** (NASA, ESA, CNSA/CMSA, ISRO, company blogs) and high-quality secondary (SpaceNews, Spaceflight Now, NASASpaceflight).
4. Enable a future **interactive UI** without inventing precision that agencies have not published.

## Scope

### In scope
- NASA Artemis II–VI+, SLS/Orion, HLS (Starship HLS, Blue Moon), xEVA suits, Moon Base / LTV
- Gateway (including pause/cancel and HALO/PPE repurposing)
- CLPS and related commercial landers/rovers (SpaceX, Blue Origin, Astrobotic, Intuitive Machines, Firefly, Draper, ispace, etc.)
- China: Chang’e, Queqiao, CMSA crewed architecture (LM-10 / Mengzhou / Lanyue), ILRS
- Russia: Luna-26+, ILRS cooperation, nuclear power concepts if dated
- Other agencies: ESA (Moonlight, Argonaut, MAGPIE, Orion ESM), JAXA (LUPEX), ISRO (Chandrayaan-4/5), UAE Rashid, Korea payloads, CSA crew/robotics
- Infrastructure with dates: lunar relays, power, habitats, ISRU demos

### Out of scope (for now)
- Full interactive front-end / viz polish
- Every CubeSat or unnamed rideshare
- Mars-only missions (except where Moon-to-Mars architecture is the lunar event itself)
- Speculative fan timelines without agency/company attribution

## Data rules

| Rule | Practice |
|------|----------|
| Cite sources | Every event has ≥1 `sources[]` entry with URL, title, publisher, `accessed` date |
| No invented days | If only a year is known → `date_precision: "year"`. Month only → `"month"`. Ranges → `"range"` + `date_end` |
| Confidence | `confirmed` (occurred / official firm fact), `planned` (agency/company published target), `rumored` (secondary/inferred/conceptual) |
| Status honesty | Use `slipped`, `cancelled`, `conceptual` when schedules change or are notional |
| Prefer primary | NASA/ESA/CNSA/ISRO/company releases over aggregators; aggregators OK for discovery then verify |
| Contradictions | Do not silently pick a side — document in `research/NOTES.md` and keep wider precision |
| Quality over filler | Target ~40–80 high-signal events (current dataset in that band) |

## Deliverables (this phase)

| Path | Purpose |
|------|---------|
| `docs/PROJECT.md` | This brief |
| `docs/SCHEMA.md` | Event / actor / source field definitions |
| `docs/DEV_SETUP.md` | Omarchy tooling notes |
| `data/events/events.json` | Timeline events |
| `data/actors/actors.json` | Orgs / agencies / companies |
| `data/sources/sources.json` | Canonical reference URLs |
| `research/NOTES.md` | Open questions & schedule contradictions |
| `app/` | Reserved for future UI |

## Success criteria (phase 1)

- [x] Files exist on Omarchy under `/home/jack/Projects/moon-landing-timeline/`
- [x] JSON validates (`json.load`)
- [x] Events cite sources and mark confidence / date precision
- [ ] Interactive timeline UI (deferred)
