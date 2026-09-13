# Research Notes — Open Questions & Contradictions

**Snapshot:** 2026-09-13 PT  
**Method:** WebSearch/WebFetch of NASA, ESA, company, SpaceNews/Spaceflight Now–class sources. Chinese official pages used where available; English state-media/secondary used carefully.

## Top themes (as of this snapshot)

1. **Artemis re-baselined around LEO risk reduction:** Artemis II completed Apr 2026; Artemis III is now a **2027 LEO HLS docking demo**; first crewed landing moved to **Artemis IV early 2028**, Artemis V late 2028.
2. **Gateway → Moon Base pivot:** Orbital Gateway paused/cancelled; HALO/PPE hardware/tech being **repurposed** (LID demos / NEP concepts). International Gateway contributions (ESA I-Hab, Canadarm3, etc.) face redeployment uncertainty.
3. **Dual HLS race:** SpaceX Starship HLS vs Blue Origin Blue Moon — NASA will fly whoever is ready; MK1 cargo flights and LEO demos gate 2028 landing credibility.
4. **CLPS maturation:** Firefly Blue Ghost M1 = first fully successful commercial landing (Mar 2025); IM tip-overs continue; Griffin/MK1/IM-3/BG-2 are the 2026–27 workhorses.
5. **China still targeting pre-2030 crew landing** while **Chang’e-7 slipped** out of its Aug 2026 window into 2027 territory.
6. **Russia Luna program repeatedly delayed**; next orbiter ~2028; sample return pushed into mid-2030s.
7. **ESA infrastructure track:** Lunar Pathfinder (2026) → Moonlight IOC (2028) → FOC (2030) → Argonaut (~2030–31); MAGPIE rover 2029 via ispace.

## Contradictions & uncertainties

### Artemis numbering / landing mission
- **Pre-2026 public narrative:** Artemis III = first landing.
- **Current NASA pages (2026):** Artemis III = LEO demo; **Artemis IV = first landing (early 2028)**; Artemis V = late 2028.
- Some older PDFs/pages may still show pre-restructure numbering — **prefer 2026 architecture releases**.

### Blue Moon MK1 Endurance date
- NASA/Moon Base materials: late 2026 / NET Q3 2026.
- Spaceflight Now (Jun 2026): New Glenn issues may push first MK1 into **2027**.
- Dataset uses `date_precision: range` 2026–2027 and `notes` calling out the slip risk.

### VIPER
- Cancelled once, then revived as **option** on Blue Origin CS-7 for late 2027.
- Not a firm go until option exercised after first MK1 flight — keep status `planned`, not `scheduled`.

### Chang’e-7
- Long planned “around 2026”; rolled to pad Aug 2026 then **scrubbed for 2026 window**.
- Secondary (Thailand NARIT / China-in-Space): early **2027**. Official CNSA re-date not mirrored cleanly in English primary pages at access time.
- Event marked `slipped` with 2027 year.

### Chang’e-8
- Commonly **~2028**; some Apr 2025 Chinese reporting **~2029** (Leibnitz-Beta).
- Dataset uses 2028–2029 range.

### Russia Luna-28 / 29 / 30 ordering
- Statements in 2025–2026 conflict: sample return (Luna-28) variously **2034 or 2036**; Luna-29 **2032**; Luna-30 **2034–2036**.
- Treat mid-2030s as soft; do not invent month precision.

### ispace Mission 3 / 4
- Schedule aggregators list M3 **2028**, M4+MAGPIE **2029**. ESA MAGPIE signing (Sep 2026) supports 2029 rover date; confirm M3 against ispace IR before UI launch.

### LUPEX / Chandrayaan numbering
- LUPEX = Chandrayaan-5 (ISRO lander + JAXA rover); Chandrayaan-4 = separate sample return.
- Some older sources swapped numbers — verify against ISRO/JAXA 2025–2026 materials.
- Sep 2028 LUPEX date from Indian Department of Space parliamentary reporting (secondary news); keep year precision in JSON.

### Gateway status language
- NASA/press use “pause,” “stop work,” “canceled,” and “repurpose” variously. Operationally: **not proceeding as lunar orbital station on prior Artemis IV path**. Event status `cancelled` with notes on LID/NEP reuse.

### Artemis VI+ years
- Only “about once per year thereafter” — any specific year for Artemis VI is **inferred** → `conceptual` / `rumored`.

## Open questions (follow-ups)

1. Firm NET windows for Griffin-1, IM-3, Blue Ghost M2, Draper APEX once manifests freeze.
2. Which HLS provider NASA designates for Artemis IV after 2027 LEO tests.
3. Whether VIPER option is exercised post–MK1 flight.
4. Official CNSA English confirmation of Chang’e-7/8 years after Aug 2026 scrub.
5. Disposition of ESA Lunar I-Hab / Lunar View / Lunar Link and CSA Canadarm3 after Gateway pause.
6. Blue Origin New Glenn return-to-flight date (gates MK1).
7. Starship orbital refueling demo schedule vs Artemis III/IV.
8. Firefly MoonFall drone demo — firm payload/interface public docs.
9. ILRS partner list beyond CN/RU and contribution hardware dates.
10. Axiom AxEMU flight demo: in-space 2027 claims vs OIG delay warnings (track for suit readiness risk to Artemis IV).

## Source quality notes

- **Prefer:** nasa.gov mission/news pages, esa.int, cnsa.gov.cn, isro.gov.in, company press rooms.
- **Use carefully:** Wikipedia (cross-check), schedule aggregators (next2space), state media translations.
- **Avoid inventing:** Exact launch days for 2027–2035 flights not published as such.

## Dataset hygiene

- Re-run validation after edits: `python3 -c 'import json; json.load(open("data/events/events.json"))'`
- When a planned event completes, flip `status` → `completed`, tighten `date_*`, set `confidence` → `confirmed`, add primary splashdown/landing release.

## Changelog — 2026-09-13 (dataset deepen + UI polish)

### Net-new events (18)
- Historical international balance: `danuri-kplo-2022`, `jaxa-slim-2024`, `change-6-2024`
- China crewed stack gates: `cz10b-first-flight-2026`, `mengzhou-1-orbital`
- UAE: `rashid-2-blue-ghost` (Firefly BG-2 far side)
- ESA infrastructure: `telespazio-moonlight-contract`, `lunanet-interop-2029`, `novamoon-argonaut-2031`, `argonaut-2-2033`, `thales-argonaut-consortium-2025`
- Korea roadmap: `korea-lunar-comms-orbiter-2029`, `korea-private-lander-2030`, `korea-lvrad-clps-2030`, `korea-kpll-2032`
- ILRS partners: `ilrs-partners-policy-2025`, `pakistan-jinnah-1-rover`, `ilrs-extended-model-2040s`

### Key updates to existing events
- `blue-ghost-m2-2026` / `esa-moonlight-pathfinder-2026`: Firefly official page NET **2027**; keep 2026–2027 range; confirmed Rashid 2, Pathfinder, Fleet SPIDER, Volta LightPort manifests.
- `change-8-2028`: added Pakistan SUPARCO / Jinnah-1 context; PK country code.
- `chandrayaan-4-2027`: retargeted to **2028** year (ISRO chair / Hindu site reporting); note warns against secondary “crewed CH-4/5” misquotes.
- `india-crewed-moon-2040`: confidence → planned; better ISRO/NIE sources; docking architecture note.
- `esa-argonaut-1-2030`: Thales Alenia Space LDE prime; NovaMoon candidate; 2030–2031 range retained.
- `luna-28-sample-return`: TASS/RAS preference toward **2036** within 2034–2036 range.
- `ilrs-basic-model-2035` / `ilrs-construction-2031`: CNSA ~17 partners citation.

### New actors / sources
- Actors: KASA, SUPARCO, Telespazio, Thales Alenia Space, Fleet Space, Volta Space, CAST.
- Bibliography expanded with Firefly BG-2, ESA Moonlight/Argonaut pages, CNSA ILRS partners, KASA roadmap PDF, TASS Luna, JAXA SLIM, SpaceNews Argonaut/Pakistan.

### Open questions — status after this pass
1. Firm CLPS NET windows (Griffin-1, IM-3, BG-2 day, Draper APEX) — **still open**; BG-2 now officially NET 2027 per Firefly.
2. HLS provider for Artemis IV — **still open**.
3. VIPER option exercise — **still open**.
4. Official CNSA English re-date for Chang’e-7/8 — **still open** (secondary 2027 / 2028–29 retained).
5. ESA I-Hab / Lunar View / Canadarm3 after Gateway pause — **still open**.
6. New Glenn RT F gating MK1 — **still open**.
7. Starship refueling demo vs Artemis III/IV — **still open**.
8. Firefly MoonFall public ICD — **still open**.
9. Full ILRS partner hardware dates — **partially improved** (Pakistan rover; partner count); detailed partner flight list incomplete.
10. AxEMU in-space demo vs OIG risk — **still open**.
11. **Resolved (enough for dataset):** Rashid 2 confirmed on Firefly BG-2; Pathfinder on same stack; LunaNet interop year 2029 from ESA; Korea 2030/2032 dual lander plan published; Argonaut-2 ~2033 from ESA industrial coverage; Chandrayaan-4 public target year 2028.
12. **New caution:** Economic Times-class quotes calling Chandrayaan-4/5 “crewed” conflict with ISRO sample-return / LUPEX descriptions — treat as misquote; dataset keeps robotic definitions.

### UI
- Sticky year group headers; clearer status/confidence badge colors; mobile spacing; notes shown when present; filters/search unchanged (`../data/events/events.json`).

## Changelog — 2026-09-13 (priority-gap pass: CLPS cancels, New Glenn/MK1, Gateway partners, suits, AU)

### Net-new events (5)
- `new-glenn-rtf-2026` — Blue Origin end-2026 RTF goal after May 28 LC-36 BE-4 valve anomaly; gates MK1.
- `axemu-oig-readiness-risk-2026` — NASA OIG IG-26-006 (Apr 20, 2026): AxEMU demos late 2027; Artemis IV 2028 margin risk.
- `canadarm3-moon-base-repurpose-2026` — CSA/MDA Aug 2026 intent to repurpose Canadarm3 for lunar-surface ops (no flight year).
- `esa-gateway-modules-posture-2026` — ESA Jun 2026 Council briefing: I-Hab through CDR; Lunar View slowed; Lunar Link assessed (Moonlight option).
- `australia-roover-2030` — ASA Roo-ver to south pole in 2030 via Intuitive Machines CLPS.

### Key updates to existing events
- `draper-apex-2026` → **cancelled** (Jul 2026 NASA/Draper mutual end of CP-12; ispace PDF + SpaceNews).
- `blue-moon-mk1-endurance-2026` → retargeted to **2027** (company Q1 2027 expectation after New Glenn grounding).
- `griffin-1-moon-base-ii-2026` → Astrobotic late 2026 / Spaceflight Now Q4 2026 Falcon Heavy citations; still year precision.
- `im-3-2026` → NASA 2026 event page reinforced; aggregator NET Mar 2027 **not** adopted.
- `viper-blue-moon-2027` → option still unexercised; tighter because MK1 Endurance now Q1 2027.
- `gateway-pause-2026` → ESA module posture + CSA Canadarm3 language folded into summary/sources.
- `axiom-axemu-lcvg-2026` / `artemis-iv-2028` → OIG suit-margin risk notes + sources.
- `starship-hls-crew-window` → explicit note: no firm NASA public date for ship-to-ship propellant transfer demo.
- `northrop-lid-missions` → Aug 2026 company/CSA repurpose coverage; still conceptual for dates.

### New actors / sources
- Actors: Australian Space Agency; MDA Space.
- Bibliography: ispace CP-12 PDF, SpaceNews Draper terminate, Astrobotic Griffin unveil, SFN Griffin/New Glenn, Blue Origin RTF, NASA OIG AxEMU (news + PDF), ESA Gateway posture coverage, MDA/SpaceNews Canadarm3, ASA Roo-ver pages, NASA IM-3 event.

### Skipped because weak / thin
- Firm day-level NETs for Griffin-1, IM-3, Blue Ghost M2 — still unpublished; keep year/range.
- Starship dedicated orbital refueling demo calendar date — Politico/internal leak and wiki NET late 2026 only; **not** entered as a dated flight.
- UK national lunar lander / Italy MPH flight year — no primary 2026 flight assignment found beyond existing Moonlight/Argonaut/Telespazio coverage.
- JAXA HTV-X lunar cargo firm year — not added without a primary flight date.
- Firefly MoonFall ICD — still no public interface docs.
- Official CNSA English re-date of Chang’e-7/8 — still open; prior slipped/range entries retained.
- HLS provider designation for Artemis IV — NASA still readiness-based; no designation event.

### Open questions — status after this pass
1. Firm CLPS day windows (Griffin-1, IM-3, BG-2) — **still open** (Q4/late 2026 / NET 2027 language only).
2. HLS provider for Artemis IV — **still open**.
3. VIPER option exercise — **still open** (gated on Endurance).
4. Official CNSA English Chang’e-7/8 years — **still open**.
5. ESA I-Hab/View/Link redeploy flight assignments — **partially improved** (posture known; flights TBD). Dec 2026 ESA interim ministerial may clarify.
6. New Glenn RTF actual date — **partially improved** (company end-2026 goal + BE-4 valve finding); flight not yet occurred.
7. Starship ship-to-ship refueling demo NASA date — **still open** (skipped weak dates).
8. Firefly MoonFall public ICD — **still open**.
9. ILRS partner hardware flight list — **still partial**.
10. AxEMU in-space demo vs OIG risk — **partially improved** (OIG findings ingested; 2027 demo still to occur).
11. Canadarm3 surface deployment year / contract value — **still open**.
12. Blue Moon MK1 Endurance exact Q1 2027 window — company expectation only until New Glenn flies.
