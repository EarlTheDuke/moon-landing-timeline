# Data Schema

All JSON is UTF-8, pretty-printed, trailing newline. Arrays are unordered unless noted; UI should sort events by `date_start`.

## `data/events/events.json`

Array of **Event** objects:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Stable kebab-case unique id (e.g. `artemis-iv-2028`) |
| `title` | string | yes | Short human title |
| `date_start` | string | yes | ISO-8601 date fragment: `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` |
| `date_end` | string \| null | yes | End of range / multi-day mission; `null` if single instant/year |
| `date_precision` | enum | yes | `day` \| `month` \| `year` \| `range` |
| `status` | enum | yes | `planned` \| `scheduled` \| `in_progress` \| `completed` \| `slipped` \| `cancelled` \| `conceptual` |
| `category` | enum | yes | `crewed_landing` \| `crewed_orbit` \| `uncrewed_lander` \| `rover` \| `orbiter` \| `infrastructure` \| `demo` \| `policy` \| `other` |
| `actors` | string[] | yes | Display names of agencies/companies (match `actors.json` when possible) |
| `countries` | string[] | yes | ISO 3166-1 alpha-2 codes; use `EU` for ESA multinational |
| `program` | string | yes | Program label: `Artemis`, `CLPS`, `ILRS`, `Luna`, `Moonlight`, `CLEP`, etc. |
| `summary` | string | yes | 1–4 sentence factual summary |
| `sources` | SourceRef[] | yes | Inline citations for this event |
| `confidence` | enum | yes | `confirmed` \| `planned` \| `rumored` |
| `notes` | string | no | Uncertainty, contradictions, UI caveats |

### SourceRef (inline)

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Canonical URL |
| `title` | string | Page/article title |
| `publisher` | string | Org or outlet |
| `accessed` | string | ISO date `YYYY-MM-DD` when checked |

### Status guidance
- **scheduled** — firm launch window / NET with countdown-level confidence (rare for lunar)
- **planned** — published target year/window, still subject to slip
- **slipped** — previously published date missed or officially deferred
- **conceptual** — architecture intent without firm flight assignment
- **cancelled** — program/element stopped (retain for history)

### Confidence vs status
- A **completed** event should normally be `confidence: confirmed`
- A **planned** event can still be `confidence: planned` (default) or `rumored` if only secondary inference
- Do not mark `confirmed` for future flights

## `data/actors/actors.json`

Array of **Actor** objects:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | kebab-case id |
| `name` | string | Display name |
| `type` | enum | `agency` \| `company` \| `consortium` \| `other` |
| `country` | string | Primary HQ / flag country code |
| `programs` | string[] | Associated program labels |
| `url` | string | Official site |
| `notes` | string | Short role blurb |

## `data/sources/sources.json`

Array of **canonical Source** objects (bibliography), distinct from per-event SourceRefs:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable id |
| `url` | string | URL |
| `title` | string | Title |
| `publisher` | string | Publisher |
| `topics` | string[] | Tags for filtering |
| `accessed` | string | Access date |

## Conventions

- Times in source prose may be UTC or local; store **calendar dates** only unless a day-precision event needs a known civil date (launch/splashdown).
- User-facing UI should convert any displayed clock times to **America/Los_Angeles (PT)** and label them.
- Prefer extending existing `id`s over renames; if an event fundamentally changes meaning, add a new id and mark the old one `cancelled`/`slipped` with notes.
