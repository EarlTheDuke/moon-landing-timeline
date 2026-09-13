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
7. **ESA infrastructure track:** Lunar Pathfinder (NET 2027) → Moonlight IOC (2028) → FOC (2030) → Argonaut (~2030–31); MAGPIE rover 2029 via ispace (€65M Phase 2 contract signed).
8. **The procurement layer now drives the timeline:** NASA's March 2026 "Ignition" event created a three-phase Moon Base program (~$30B+), a target of up to 30 robotic landings a year from 2027, and the CS-8 / CS-6 / CT-4 / CX-2 task orders plus a CLPS 2.0 follow-on. Several 2028–2036 dataset entries are downstream of these instruments.
9. **Consolidation on all sides:** Voyager Technologies absorbed Astrobotic (now Voyager Lunar Systems); CMSA took the Chinese Lunar Exploration Program over from CNSA; ispace merged its US and Japanese lander lines into a single ULTRA design and renumbered its missions.
10. **Surface hardware is internationalizing:** Italy's MPH habitat (2033), Canada's Canadarm3-derived Lunar Utility Vehicle, JAXA's pressurized rover, Chang'e-8's ten-partner payload manifest, and NASA's open invitation to all **71** Artemis Accords signatories (Djibouti signing as the 72nd on 14 Sep 2026) to contribute Moon Base hardware.
11. **Surface power is now its own procurement race:** a Dec 18, 2025 executive order, the Jan 13, 2026 NASA–DOE MOU, the Aug 30, 2026 SPARC draft RFP for **Lunar Reactor-1** (20 kWe, HALEU, land in 2030) and NASA's NextSTEP-3 Appendix B "Initial Surface Power" call sit on the US side; Roscosmos/CNSA's 2036 lunar power plant (Selena, from Kurchatov/Rosatom's Elena-AM) sits on the ILRS side. Both programs treat power, not landers, as the gate to permanence.

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

1. Firm **day** NETs for Griffin-1 and Blue Ghost M2; IM-3 day inside company Jan–Mar 2027 window.
2. Which HLS provider NASA designates for Artemis IV after 2027 LEO tests.
3. Whether VIPER option is exercised post–MK1 Endurance flight.
4. Official CNSA English confirmation of Chang’e-7/8 years after Aug 2026 scrub.
5. Flight assignments for ESA I-Hab / Lunar View after Gateway pause (Lunar Link now in Phase A/B1 study with Q4 2029 schedule-support target).
6. Blue Origin New Glenn return-to-flight actual date (gates MK1).
7. Firm calendar date for Starship ship-to-ship propellant transfer (GAO documents slip; still no countdown).
8. Firefly MoonFall drone demo — firm payload/interface public docs.
9. ILRS partner hardware contribution flight dates (partner count improved; detailed flights partial).
10. AxEMU 2027 demo venue (ISS vs Artemis III) and whether it closes OIG margin risk for Artemis IV 2028.
11. Canadarm3 lunar-surface deployment year / contract value.
12. Exact MK1 Endurance civil window inside Q1 2027 once New Glenn RTF flies.

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

## Changelog — 2026-09-13 (priority deepen: CLPS windows, HLS/Artemis III–IV, Starship refuel, AxEMU, Gateway Lunar Link, 2032–33 cargo)

### Net-new events (6)
- `axemu-flight-demo-2027` — Axiom Apr 2026 Space Symposium: 2027 in-space AxEMU test on ISS **or** Artemis III (venue TBD).
- `esa-lunar-link-repurpose-itt-2026` — ESA 27 Jul 2026 ITT for Lunar Link Phase A/B1 studies; schedules must support possible **Q4 2029** launch.
- `starship-orbital-refuel-demo` — GAO-26-108556: ship-to-ship cryogenic transfer not demonstrated as of May 2026; already delayed >1 year; **no firm date** (2026–2027 range / slipped).
- `jaxa-pressurized-rover-2032` — NASA–Japan rover + NASA cargo assignment: Starship cargo delivery **NET FY2032** for Artemis VII+.
- `blue-origin-lunar-habitat-2033` — companion NASA cargo assignment: Blue Origin surface habitat **NET FY2033**.
- `im-altus-constellation-2028` — IM earnings: Altus-2–5 four-satellite lunar relay deploy together in **2028** (after Altus-1 on IM-3).

### Key updates to existing events
- `im-3-2026` → **slipped** to **2027-01–2027-03** per CEO Altemus Q2 FY2026 earnings (Jan–Mar Falcon 9); Altus-1 on same stack; NASA event page still shows 2026 (treated as stale).
- `im-4-2027` → company still **late 2027** on track.
- `blue-ghost-m2-2026` / `esa-moonlight-pathfinder-2026` / `rashid-2-blue-ghost` → Firefly official **NET 2027**; status **slipped** vs earlier 2026 materials.
- `artemis-iii-2027` → NASA Jun 2026 crew: Bresnik / Parmitano (ESA) / Douglas / Rubio (+ Hines backup); Blue Moon enterable, Starship test article **not** enterable.
- `artemis-iv-2028` → notes refreshed for III demo gate + AxEMU 2027 demo path.
- `esa-gateway-modules-posture-2026` / `gateway-pause-2026` → Lunar Link ITT + Q4 2029 schedule-support language folded in.
- `starship-hls-crew-window` → GAO propellant-transfer finding cited; cross-ref new refuel demo event.
- `axiom-axemu-lcvg-2026` / `axemu-oig-readiness-risk-2026` → cross-ref `axemu-flight-demo-2027`.

### New actors / sources
- Actors: Toyota.
- Bibliography: NASA Artemis III crew release + crew page; NASA cargo lander assignment; NASA–Japan pressurized rover agreement; IM Q2 FY2026 earnings transcript; SpaceNews AxEMU 2027 flight; SpaceNews/ISS Tracker Lunar Link ITT; GAO-26-108556; Spaceflight Now Artemis III crew.

### Skipped because weak / thin
- Firm **day** NETs for Griffin-1 (still late/Q4 2026 company language; aggregator November dates unused).
- VIPER CS-7 option exercise — still gated on Endurance / base-task review; no exercise news.
- HLS provider designation for Artemis IV — still readiness-based.
- Official CNSA English Chang’e-7/8 re-date — still open.
- New Glenn actual RTF flight — end-2026 goal unchanged; not flown.
- Firefly MoonFall public ICD — still absent.
- Canadarm3 surface deployment year / contract value — still open.
- Exact MK1 Endurance civil day inside Q1 2027 — company expectation only.
- Dedicated Starship refuel **calendar day** — still unpublished (event uses range + slipped, not a countdown).

### Open questions — status after this pass
1. Firm CLPS **day** windows (Griffin-1, IM-3 day inside Jan–Mar 2027, BG-2 day) — **still open** (IM-3 now has company month-range; Griffin still year/Q4).
2. HLS provider for Artemis IV — **still open**.
3. VIPER option exercise — **still open** (gated on Endurance).
4. Official CNSA English Chang’e-7/8 years — **still open**.
5. ESA I-Hab/View/Link **flight** assignments — **partially improved** (Lunar Link ITT + Q4 2029 study target; I-Hab/View flights TBD). Dec 2026 interim ministerial may clarify.
6. New Glenn RTF actual date — **still open** (end-2026 goal).
7. Starship ship-to-ship refueling **firm date** — **partially improved** (GAO slip documented; no countdown).
8. Firefly MoonFall public ICD — **still open**.
9. ILRS partner hardware flight list — **still partial**.
10. AxEMU in-space demo venue (ISS vs Artemis III) — **partially improved** (2027 intent confirmed; venue TBD).
11. Canadarm3 surface deployment year / contract value — **still open**.
12. Blue Moon MK1 Endurance exact Q1 2027 window — **still open** until New Glenn flies.
13. **Resolved enough for dataset:** IM-3 company window Q1 2027; BG-2/Pathfinder/Rashid NET 2027; Artemis III crew named; Lunar Link study path with Q4 2029 schedule support; JAXA pressurized rover NET FY2032 + Blue Origin habitat NET FY2033 cargo assignments; Altus constellation 2028 plan.

## Changelog — 2026-09-13 (procurement-layer pass: Ignition/Moon Base, CS-8, ULTRA, ILRS hardware)

**Counts:** events 80 → **105** (+25 net-new, 49 updated); actors 38 → **58**; bibliography 61 → **139**.

### What this pass was actually about

The previous passes tracked *missions*. The biggest gap they left was the **procurement and architecture layer** that now
determines which missions exist at all. NASA's March 24, 2026 "Ignition" event created a phased Moon Base program, a
target of up to 30 robotic landings a year from 2027, new CLPS task orders (CX-2, CS-8), a CLPS 2.0 follow-on, and a
budget envelope (at least $30B across three phases). None of that was in the dataset; several 2028–2036 events in the
dataset are downstream of it. This pass adds that layer and then uses it to sharpen the mission entries.

### Net-new events (25)

**Moon Base architecture & procurement (9)**
- `nasa-ignition-moon-base-2026` — Mar 24, 2026 Ignition event; Moon Base at the south pole, Gateway paused, ~30 robotic landings/yr from 2027, CX-2 + CS-8 draft task orders, RFI for rapidly adaptable surface demos.
- `moon-base-phase-1-2029` / `moon-base-phase-2-2032` / `moon-base-phase-3-2036` — NASA's own phase numbers from the Moon Base Architecture User's Guide: 25 launches / 21 landings / ~4,000 kg → 27 / 24 / ~60,000 kg (CLPS to 5 t) → 29 / 28 / ~150,000 kg (CLPS to 8 t, continuous crew, ISRU).
- `clps-cs8-awards-2026` — Jun 30, 2026: Astrobotic $297.9M (two Peregrines), Firefly $144.2M, Intuitive Machines $148.3M; four late-2028 landings, each carrying SCALPSS + LRA + LETS; NASA counted 17 surface deliveries on contract.
- `clps-2-0-procurement-2026` — April 2026 announcement of the ~10-year multi-award CLPS follow-on that opens competition beyond the CLPS 1.0 pool.
- `promise-rover-study-2026` — NASA studying a hybrid Perseverance/Curiosity engineering development model for lunar prospecting. No lander, date or budget.
- `sr1-freedom-ppe-repurpose-2026` — the one concrete Gateway repurposing with a name: Space Reactor 1 (SR-1) Freedom, a nuclear electric propulsion demo reusing the Gateway PPE. Dated to the announcement; **no launch year published**.
- `hls-oig-report-2026` — NASA OIG IG-26-004 (Mar 2026): $6.9B obligated / $18.3B through FY2030, propellant-transfer and Artemis IV slips, Blue Origin MK2 uncrewed demo in Feb 2029.

**US commercial (6)**
- `voyager-astrobotic-acquisition-2026` — Voyager Technologies closed its Astrobotic acquisition Jul 13, 2026; the lunar business is now Voyager Lunar Systems.
- `peregrine-2-2028` — CS-8 Peregrine-2 to the Gruithuisen Domes with three NASA payloads.
- `blue-ghost-m4-2029` — CS-6, $176.7M (Jul 29, 2025): two rovers + three instruments to the Haworth crater rim, ~40 km south of Mons Malapert, >12 surface days.
- `im-ct4-nova-d-2029` — CT-4, first Nova-D (~500 kg to surface), six NASA payloads to the south pole.
- `darpa-lasso-2026` — Apr 30, 2026 Phase 1 awards to Benchmark Space Systems, Quantum Space and Revolution Space for a very-low-lunar-orbit water-ice mapper (>5% concentration at ≤4 km²).
- `falcon9-stage-lunar-impact-2026` — Aug 5, 2026 uncontrolled impact of the Blue Ghost 1 launch's Falcon 9 upper stage near Einstein crater, and the resulting NASA/SpaceX work on high-energy disposal.

**International (10)**
- `asi-mph-habitat-2033` — Italy's Multi-Purpose Habitation module: 2033 launch, two crew for 7–30 days, ≥10-year life, mobile; NASA SDR/SRR cleared May 19, 2026, PDR in 2027.
- `italy-nasa-lunar-soi-2026` — Italy–NASA Statement of Intent on the surface base, including at least one Italian Artemis seat.
- `esa-rome-ministerial-2026` — ESA Intermediate Ministerial in Rome, December 2026: the decision point for I-Hab / Lunar View / Lunar Link and for a possible European crew-transport mandate.
- `csa-lunar-utility-vehicle` — Canada's reported Phase 3 surface contribution; three CSA concept teams (Canadensys, Mission Control, MDA Space). Entered `conceptual` / `rumored` on a single trade source.
- `kasa-lunar-budget-2027-request` — Sep 1, 2026: ₩279.4B lunar (≈3× 2026), new ₩106.3B small-lander program for a 2030 landing, ₩13B lunar-orbit comms satellite.
- `ispace-ultra-restructure-2026` — Mar 27, 2026 ULTRA consolidation and mission renumbering (this is why "ispace Mission 3" means different things in different sources).
- `ispace-mission-2-5-2027` — new Lunar Connect relay satellite, as early as 2027; five satellites by 2030.
- `lanyue-landing-ascent-test-2025` — Aug 6, 2025 integrated landing-and-ascent test at Huailai; first Chinese extraterrestrial landing/takeoff test of a crewed spacecraft. Filled a real historical gap.
- `clep-cmsa-reorganization-2026` — CMSA took over the Chinese Lunar Exploration Program from CNSA beginning with Chang'e-7; integration announced May 23, 2026.
- `ilrs-nuclear-power-plant-2036` — Roscosmos–CNSA memorandum (May 8, 2025) plus the Dec 2025 NPO Lavochkin contract for a lunar power station by 2036 via missions in 2033, 2034 and 2035.

### Key updates to existing events (49 touched)

**Dates / precision tightened**
- `griffin-1-moon-base-ii-2026` → **2026-11** (month precision). Voyager's Jul 13, 2026 release says NET November 2026; Spaceflight Now says Q4 2026. Aggregator "November 30" placeholders were **not** adopted.
- `moon-base-ltv-awards-2026` → **2026-05-26** (day precision) with the full award structure: Astrolab $219M CLV-1, Lunar Outpost $220M Pegasus, Blue Origin $188M base + $280.4M options across two task orders; Intuitive Machines not selected.
- `hls-uncrewed-lunar-demos-2027` → range widened to **2026–2029**, because OIG puts the Starship uncrewed lunar demo at end-2026 and Blue Origin's MK2 uncrewed demo at Feb 2029.

**Artemis / HLS**
- `artemis-iii-2027` → NET **late** 2027 (was mid-2027); April 2026 decision to fly a non-propulsive spacer instead of ICPS to reserve the last ICPS for Artemis IV; core stage at KSC Apr 27, booster stacking from July, RS-25 install from Aug 24, 2026; Blue Origin's MK2-based test lander is enterable, Starship V3 is docking-adapter-only.
- `artemis-iv-2028` → OIG: lander development slipped ≥6 months (Mar → Oct 2027), PDR/CDR each ~a year late; NASA "tapped SpaceX but may pivot to Blue Origin"; SpaceX would fly the TLI with Starship.
- `artemis-v-2028` → Centaur V debut; flagged the OIG-implied Artemis V baseline conflict (see contradictions).
- `sls-standardization-2028` → March 2026 contract replacing ICPS with **ULA Centaur V**, debuting on Artemis V.
- `starship-orbital-refuel-demo` / `starship-hls-crew-window` → OIG detail (Mar 2025 → 2026 slip, CDR to Aug 2026, ≥15 tanker launches), SpaceX's Aug 2026 "2026 target," and Flight 13 (Jul 24, 2026) flying with no second vehicle.
- `blue-moon-mk2-crew-lander` → Feb 2029 uncrewed demo; MK2-based crew cabin flies on Artemis III.
- `axiom-axemu-lcvg-2026` / `axemu-flight-demo-2027` → xEVAS $3.5B ceiling / $228.5M first task order for four suits, five suits in manufacture, ~1-year qualification to mid-2027, venue decision due "way before" mid-2027.
- `new-glenn-rtf-2026` → BE-4 main-oxygen-valve root cause named Aug 5, 2026 with retrofit hardware ready end of August; LC-36A rebuild by late 2026, LC-36B by late 2027; transporter-erector dropped for a vertical conops.

**CLPS manifest**
- `blue-moon-mk1-endurance-2026` → task order **CT-3** ($6.1M for SCALPSS + LRA), MK1-SN001 Endurance in quiescent storage, Q1 2027; four MK1 landers in production (Endurance, VIPER, two LTV carriers).
- `viper-blue-moon-2027` → CS-7 total potential value **$190M**; option still unexercised; 100-day science window forces a landing by late 2027 while Endurance has moved to Q1 2027.
- `ltv-surface-delivery-2028` → two additional MK1 landers under construction for the Astrolab and Lunar Outpost rovers, launches scheduled 2028.
- `im-3-2026` → Jul 2026 initial FRR, Oct 2026 delta FRR, engine hot fire pending; Q1 2027 window reaffirmed.
- `im-4-2027` → late 2027 on track; $14.7M EAC adjustment for payload changes; CP-22 / Mons Mouton.
- `im-altus-constellation-2028` → FOC pulled from mid-2029 to 2028 via a dedicated four-satellite launch specifically to support Artemis IV; K/X/S-band plus planned PNT broadcast.
- `blue-ghost-m2-2026` → Firefly's official "Riders 2 the Dark" detail: CS-3/4, ~44-day transit, far-side landing near Nassau crater, six payloads from five countries, LuSEE-Night operating up to two years, Elytra Dark on station five years for Ocula. Countries extended to US/EU/AE/AU/CA/GB.
- `blue-ghost-m3-2028` → CP-21, six payloads, and an explicit note that Peregrine-2 targets the same Gruithuisen region.
- `draper-apex-2026` → $73M CP-12; NASA's stated reason (lander redesign delays projecting a 2030–31 landing); ispace's ~¥3.7B impairment; the full slip chain 2025 → 2026 → 2027 → 2030.
- `firefly-moonfall-drones-2028` → **substantially resolved**: $75M JPL subcontract (May 26, 2026), four JPL drones on Elytra Dark, 45-day transit, release ~50 km above the pole, ~250 kg / 7 ft / 4 ft each, 10 cameras, ~50 km range, 14-day sortie plus a survive-the-night payload, captive-carry tests late 2026, integration late summer 2027.

**China**
- `change-7-slipped-2026` → the Aug 23, 2026 scrub hours before launch, the CMSEO wording, the Aug 26 rollback and reported year delay, the CNSA AO spacecraft breakdown (orbiter + lander + relay + rover + flyby/hopper), the >85°S South Pole–Aitken site, and the NARIT MATCH / ILOA ILO-C payloads. Actors and countries extended to TH and US.
- `change-8-2028` → **CNSA official English says "around 2029"** plus the complete ten-project international payload list (Hong Kong robot, Pakistan/ISTVS rover, Türkiye rover, South Africa + Peru radio astronomy, Italian retroreflectors, Russian plasma/dust and particle detectors, Thai neutron analyser, Bahrain–Egypt imager, Iranian potential monitor). Countries extended to 11 codes.
- `china-crewed-landing-2030` / `mengzhou-1-orbital` → the official wording is "**before** 2030"; hardware gate list; CMSA's Feb 27, 2026 annual plan; Isaacman's May 19, 2026 prediction of a Chinese crewed circumlunar flight in 2027 recorded as context, not as a dated mission.
- `ilrs-partners-policy-2025` / `ilrs-basic-model-2035` → partner counts reconciled (CNSA's 17 countries+organizations vs Roscosmos's 13 sovereign states) plus the lunar power plant.

**Russia**
- `luna-26-2028` → IKI primary source: 2028 from Vostochny, 2–3 m global map for autonomous navigation, relay duty for the 2029/2030 landers.
- `luna-27a-2029` / `luna-27b-2030` → Zelyony's "this time 2029, that's the real date," **plus the caveat that the north/south pole assignment between the two landers is undetermined** — so our A=south / B=north split is provisional.
- `luna-28-sample-return` → Krasnikov's "three to four years" after 2030 (2033–34) recorded against the 2034/2036 alternatives.

**Europe / India / Korea**
- `esa-argonaut-1-2030` → full industrial split (TAS-I prime; TAS France data handling; OHB System GNC/comms/power; TAS UK propulsion; **Nammo main engine**), ~1.5 t cargo, five-year surface life, first mission 2030 then every 2–3 years. Actors and countries extended.
- `esa-moonlight-pathfinder-2026` → SSTL build, CLPS-sponsored ride on the BGM2 stack, dual S-band + X-band, JPL user terminal for commissioning.
- `esa-gateway-modules-posture-2026` / `gateway-pause-2026` → 347th Council (Jun 17, 2026) decisions plus the December 2026 Rome ministerial as the resolution point; SR-1 Freedom named as the PPE destination.
- `canadarm3-moon-base-repurpose-2026` → Aug 6, 2026 CSA decision; **contract value is the existing CDN $1B MDA award, scope unchanged, no new deployment year**; Phase A-through-D contract runs to Dec 31, 2029.
- `chandrayaan-5-lupex-2028` → ISRO primary page (Mar 10, 2025 financial sanction, H3-24L, MHI rover, ESA/NASA instruments) plus the Mar 26, 2026 Joint PDR and the April 2026 Tanegashima site visit; Sept 2028 target kept at year precision.
- `ispace-m3-2028` / `ispace-m4-magpie-2029` → renumbering explained; MAGPIE's €65M Phase 2 contract (Jul 24, 2026), the Sep 1, 2026 Copenhagen signing, the instrument suite (drill, volatile analyser, GPR, neutron detector), ~10-day ops, and Japan's ¥20B Space Strategy Fund support.
- `korea-kpll-2032` / `korea-private-lander-2030` / `korea-lunar-comms-orbiter-2029` → actual budget lines (₩80.9B → ₩93.7B Phase 2; new ₩106.3B small lander; ₩13B comms satellite).
- `artemis-accords-ongoing` → **71 signatories** (Türkiye, Aug 31, 2026; Mauritius 70th, Jul 17, 2026) and NASA's invitation to every signatory to contribute Moon Base hardware.

### New actors / bibliography

- **Actors (+20):** Voyager Technologies, ASI, Altec, DARPA, Benchmark Space Systems, Quantum Space, Revolution Space, JPL, Maxar, ULA, US State Department, ArianeGroup, OHB System, Nammo, IKI, Rosatom, Canadensys Aerospace, Mission Control, NARIT, ILOA. Also normalized dangling references from earlier passes ("Surrey Satellite" → `SSTL`, `NASA JPL` → `JPL`).
- **Bibliography (+78):** NASA Ignition set (release, fact sheet, Ignition page, Moon Base about page, Architecture User's Guide, phase PDF), NASA CS-8 award release, NASA CLPS deliveries + CS-6 science pages, NASA OIG IG-26-004, NASA Artemis III blog, NASA Falcon 9 impact page, NASA/State Artemis Accords pages, JPL MoonFall, Firefly MoonFall/BG4/south-pole pages, Astrobotic-Voyager release, ispace ULTRA/schedule/Q1-FY2027 pages, ESA MAGPIE + Argonaut family pages, Thales Alenia MPH release, CNSA Chang'e-8 and Chang'e-7 AO, NARIT, gov.cn Lanyue and Chang'e-7, IKI Luna-26, Interfax/Reuters/World Nuclear News on the ILRS power plant, ISRO LUPEX TIM, DARPA LASSO, Yonhap/SEDaily/DongA on KASA budgets, plus SpaceNews / Spaceflight Now / Ars Technica / Payload / Aerospace America / European Spaceflight / SpaceQ / SpacePolicyOnline secondaries.

### Newly resolved (enough for the dataset)

1. **Griffin-1 window** — NET **November 2026** from the company (month precision), not just "Q4/late 2026."
2. **Chang'e-8 year** — CNSA's own English release says **around 2029**, with the full international payload manifest. The 2028–2029 range is kept only because Chinese state TV said NET 2028 in Sept 2026.
3. **ILRS partner hardware** — the Chang'e-8 cooperation list is the concrete answer to "which partner brings what": 10 named projects across 11 countries/regions plus one international organization, from 41 proposals against 200 kg.
4. **MoonFall reality** — a funded mission with a prime, a delivery vehicle, a drone count, a deployment altitude and a milestone schedule. (The *ICD* is still not public — see skips.)
5. **Canadarm3 contract value** — CDN $1B, existing, scope unchanged. The **deployment year is still open**, so this is a half-resolution.
6. **MK1 Endurance / VIPER / LTV lander assignments** — four MK1 landers, in order: Endurance (Q1 2027), VIPER (later 2027), two LTV carriers (2028).
7. **CS-8 / CS-6 / CT-4 task orders** — three previously missing 2028–2029 CLPS deliveries now have vendors, values and destinations.
8. **ESA decision date** — December 2026, Rome, for I-Hab / Lunar View / Lunar Link.
9. **ispace mission numbering** — resolved and documented, which also fixes cross-source confusion about "Mission 3."

### Skipped because weak / thin

- **Exact launch days** for Griffin-1 (aggregators show a November 30 placeholder), IM-3 inside Jan–Mar 2027, Blue Ghost Mission 2, and MK1 Endurance inside Q1 2027. None are company- or NASA-published.
- **Starship ship-to-ship propellant transfer calendar date** — still only "2026" from SpaceX and a Wikipedia-class "NET late 2026." Not entered as a countdown.
- **HLS provider designation for Artemis IV** — NASA remains explicitly readiness-based. No designation event created.
- **VIPER CS-7 option exercise** — no news of exercise; still gated on the Endurance flight.
- **MoonFall payload interface document** — no public ICD or connector/power spec; NASA's Artemis PIDD is a template, not MoonFall-specific.
- **SR-1 Freedom launch year** — announced with no date; entry is dated to the announcement and flagged as such.
- **Chang'e-8 reconfiguration specifics** — SpaceNews (Sep 10, 2026) reports the mission is being altered under CMSA, but the readable portion gives no detail. Recorded as a caveat, not as a changed mission definition.
- **Official CNSA English re-date for Chang'e-7** — still absent after the August scrub; the "year delay" is SpaceNews's characterization, so the entry keeps 2027 at year precision.
- **Canadensys rover on Blue Ghost Mission 4** — secondary/wiki reporting says CSA de-funded it in March 2026; no primary CSA statement found, so the BGM4 rover manifest is left unspecified.
- **ESA ministerial exact date** — media report 15 December 2026; ESA had not officially announced the day as of 9 Sept 2026, so the entry stays at month precision.
- **Korea lunar comms orbiter launch year** — the 2027 budget request funds it but names no year; the 2029 date still rests on the earlier roadmap.
- **PROMISE rover flight** — under consideration only; no lander, date or budget, so status is `conceptual`.
- **CSA Lunar Utility Vehicle** — single trade-press source, no year or value; entered `conceptual` / `rumored` rather than omitted, because it is the named destination for the Canadarm3 pivot.
- **Second Astrobotic CS-8 delivery** — the $297.9M award covers two Peregrine missions but only Peregrine-2 has been publicly detailed. Not split into two events.

### Contradictions worth carrying forward

- **Artemis V baseline.** NASA publicly targets late 2028. NASA OIG places Blue Origin's MK2 uncrewed demo — a prerequisite — in **February 2029**, "roughly one year before the planned Artemis V mission," implying an internal baseline near 2030. Both are recorded; the dataset keeps NASA's public date with the conflict in `notes`.
- **Moon Base phase boundaries.** NASA's Moon Base reference page says Phase 1 "Now–2029" and Phase 3 "2032 and Beyond"; March 2026 briefing material says Phase 1 to 2028 and Phase 3 2033–2036. The dataset uses the briefing spans and notes the discrepancy.
- **Peregrine-2 and Blue Ghost 3 both target the Gruithuisen Domes in 2028** under different task orders (CS-8 vs CP-21) with different payload counts. Not a duplicate; cross-referenced in both `notes`.
- **ispace Mission 5.** March 2026 material says 2030; the August 2026 Q1 FY2027 release describes ispace "pursuing new contracts for Mission 5 in 2029." Recorded in `ispace-ultra-restructure-2026` notes; no separate Mission 5 event created until the year settles.
- **CS-8 delivery timing language.** NASA says "late 2028," Astrobotic "by 2028," Firefly "in 2028," Intuitive Machines "no later than 2028." Dataset uses 2028 at year precision.
- **Luna-27 pole assignment.** Russian officials confirm one north-pole and one south-pole lander but say the order is undetermined; the dataset's A=south / B=north split is provisional and flagged.
- **Chang'e-8 year.** CNSA English "around 2029" vs CCTV "no earlier than 2028." Range retained.

### Open questions after this pass

1. **Firm launch days** for Griffin-1 (inside November 2026), IM-3 (inside Jan–Mar 2027), Blue Ghost Mission 2, and MK1 Endurance (inside Q1 2027) — **still open**.
2. **HLS provider for Artemis IV** — **still open**; NASA remains readiness-based and the Artemis III demo is the gate.
3. **VIPER CS-7 option exercise** — **still open**; now doubly tight because Endurance moved to Q1 2027 against a required late-2027 landing.
4. **Starship ship-to-ship propellant transfer date** — **still open**; SpaceX still says only "2026."
5. **Official CNSA English Chang'e-7 re-date** — **still open**. Chang'e-8's year is now **resolved at the official level** ("around 2029").
6. **ESA I-Hab / Lunar View / Lunar Link flight assignments** — **still open**, but the decision now has a venue and a month: Rome, December 2026.
7. **Canadarm3 lunar-surface deployment year** — **still open** (value resolved at CDN $1B; no year disclosed).
8. **MoonFall public interface documentation** — **still open** (mission itself now well characterized).
9. **New Glenn actual return-to-flight date** — **still open**; company target end-2026, independent assessments lean Q1 2027.
10. **AxEMU 2027 demo venue (ISS EVA vs Artemis III)** — **still open**; Axiom expects to know well before mid-2027.
11. **SR-1 Freedom launch year and HALO's final destination** — **new open question** created by this pass.
12. **CLPS 2.0 awards** — **new open question**: targeted by the end of US government FY2026, no announcement found.
13. **Second Astrobotic CS-8 mission**, **CX-2 LTV delivery task order outcome**, and the four previewed Moon Base solicitations (power/avionics demo, additional science manifest, south pole optical imager, comm/nav relay constellation) — **new open questions**.
14. **Chang'e-8 reconfiguration specifics under CMSA** — **new open question**.
15. **ispace Mission 5 year (2029 vs 2030)** and whether ispace-U.S. wins a CLPS 2.0 task order — **new open question**.

## Changelog — 2026-09-13 (opens pass: surface power, CLPS windows, CS-8 completion, ESA small missions)

**Counts:** events 105 → **119** (+14 net-new, 46 updated); actors 58 → **61**; bibliography 139 → **186** (+48 new entries, minus one merged duplicate).
All `accessed` values are 2026-09-13, the real fetch date for this pass.

### What actually moved

Six of the thirteen priority opens moved on real evidence; the rest are re-verified and still open, with the specific
reason recorded rather than papered over with a placeholder date.

1. **CLPS day-or-better windows — partially moved, no fake days.** Griffin-1 stays at **2026-11** (Voyager's NET November;
   the lander had completed four of five JPL acceptance tests with thermal vacuum remaining, then returns to Pittsburgh
   before Cape Canaveral). IM-3 stays **2027-01 → 2027-03** (company guidance reaffirmed on the Aug 13, 2026 Q2 FY2026
   call). Blue Ghost 2 stays **2027** (Firefly's own page). MK1 Endurance stays **Q1 2027**. Every candidate "day" found
   this pass was a tracker placeholder and is now explicitly cited as *not adopted* in the relevant `notes`:
   T-Minus Zero's Mar 30–31 2027 for IM-3, Next Spaceflight's Dec 2026 and RocketRadar's Dec 31 2026 for BG-2,
   the Mar 31 2027 listing for Endurance, and end-of-November listings for Griffin-1.
2. **Artemis IV HLS provider — still open, but better bounded.** NASA's own architecture release says "Lander readiness
   will determine which provider," the HLS contracts still read SpaceX/Artemis IV (Appendix H Option B) and
   Blue Origin/Artemis V, and the new Sortie Suit is being built for initial landings on *both* landers. No designation
   event created.
3. **VIPER CS-7 option — still unexercised** as of Sep 13, 2026, and now doubly tight: CS-7 does not cover launch, the
   option decision follows the Endurance flight (Q1 2027), and the 100-day science window still requires a landing by
   late 2027.
4. **Chang'e-7 — moved in specificity, not in precision.** China in Space (Aug 31, 2026) reports the one-month slip was
   abandoned and that Long March 5 readiness is being explored for the **February and March 2027** windows, with dates
   unfinalised pending investigations; NARIT says the probe sits in storage at Wenchang and some instruments may be
   removed. Entry stays `slipped` / 2027 at year precision. Countries extended to EG, BH, IT, RU, CH for the confirmed
   international payload set.
5. **ESA I-Hab / Lunar View — still no flight assignment**, but the decision now has a date, venue and framing: ESA's own
   release says December 2026 in Italy, trade coverage gives **15 December** at ESRIN Frascati under the Italian
   presidency, and ESA's exploration director has published the two-axis roadmap (European end-to-end robotics +
   continued Artemis/Moon Base participation for astronaut surface access). Lunar Link ITT mechanics added: TAS-FR is a
   mandatory subcontractor with ≥€750k reserved per study, out of a €296M 2021 contract covering Link and View together.
6. **New Glenn RTF → MK1 — sharpened by retargeting, not by a date.** `new-glenn-rtf-2026` is now a **2026–2027 range
   with status `slipped`**: the company target is still end-2026, but the vehicle was grounded through September, Ars
   Technica (Sep 4) noted no meaningful update in about a month and "good reason for skepticism," and an independent
   assessment expects Q1 2027. Added the LC-36B groundbreaking, the Vertical Integration Facility and the 120,000 sq ft
   Payload Processing Facility (opening early 2028) as the hardware evidence either way.
7. **Starship orbital refuel — still no firm date, but the gate is now dated.** New event `starship-flight-14-2026`:
   first orbital-insertion attempt, FAA airspace window **18 Sep 2026, 12:15–14:14 UTC** (backup 19 Sep), after an
   Aug 28 33-engine Super Heavy static fire. Entered as `planned`, not `scheduled`, because the window is FAA planning
   data and SpaceX had not confirmed it.
8. **MoonFall ICD — still absent.** Re-checked: no MoonFall-specific interface document exists; Firefly publishes generic
   launch-vehicle payload user's guides that treat mission ICDs as a service item, and JPL's page gives instruments
   without interfaces. Recorded with the Alpha PUG cited as evidence of what *does* exist.
9. **ILRS partner hardware — one real addition.** The Russian Academy of Sciences approved Russia's ILRS **segment
   concept** (announced Apr 1, 2026 by Bakanov), and Lavochkin's published station work list (relay satellite, research
   satellite, telecom module, robotic assembly/repair modules, energy modules, science modules, mobile lab with ascent
   rocket) is the closest thing to a Russian hardware manifest. Reactor lineage traced to Kurchatov/Rosatom's Elena-AM
   (~68 kWe terrestrial) with a four-phase 2033–2036 roadmap.
10. **AxEMU venue — still undecided**, but the suit program changed underneath the question: NASA directed Axiom in early
    September 2026 to build a simplified **"Sortie Suit"** variant for the first landings, with shortened certification
    duration requirements and six-days-a-week NASA/Axiom meetings disclosed at the Aerospace Safety Advisory Panel.
11. **Canadarm3 surface year — still open.** CSA's own August 6 release names no funding change, amendment or timeline;
    CSA's Canadarm3 pages (updated Apr 24, 2026) still say delivery "no earlier than 2029" against the Gateway baseline;
    Canadian analysis puts a Canadarm3-derived arm on a Lunar Utility Vehicle in Moon Base Phase 3 (2033+).
12. **Artemis V vs OIG — no published resolution, but the contradiction is now precisely dated.** NASA moved Artemis V to
    **no later than March 2030** in December 2024 (the baseline OIG audited, and the reason Blue Origin got 15 extra
    months) while the March 2026 architecture release targets **late 2028**. Left as a recorded conflict.
13. **Other high-value 2026–2035 items — the big one was power, and it was missing entirely.** See net-new below.

### Net-new events (14)

**US surface power / policy layer (5)** — the largest gap this pass closed
- `us-space-policy-eo-2025` — Dec 18, 2025 executive order: Americans on the Moon by 2028, a permanent base, and nuclear
  reactors on the Moon and in orbit including a lunar surface reactor by 2030. Cited by both the NASA–DOE MOU and NASA's
  own Moon Base solicitations as their authority.
- `nasa-doe-fsp-mou-2026` — Jan 13, 2026 NASA–DOE memorandum of understanding on Fission Surface Power (MOU published
  Feb 2, 2026; NASA funds and manages, DOE handles nuclear safety/fuel).
- `nasa-sparc-lr1-drfp-2026` — Aug 30, 2026 SPARC draft RFP (80GRC026R0009), amended Sep 1, responses due Sep 28, 2026;
  LR-1 Phase 1 task orders intended for two or more contractors alongside the MAIDIQ, with NASA reserving zero awards.
- `lunar-reactor-1-2030` — LR-1 itself: 20 kWe, HALEU, closed Brayton, five years unattended, <15 t, ~4.5 m stowed in a
  7.8 m fairing, intended to land in 2030; NSTM-3 (Apr 14, 2026) requires ≥20 kWe for ≥5 surface years, one design
  extensible to 100 kWe, downselect to ≤2 designs within a year.
- `moon-base-demos-baa-2026` — NextSTEP-3 Appendix B reissued Jul 16, 2026 as "Moon Base Demonstrations"
  (80MSFC26R0003); Directed-Topic Call 1 = Initial Surface Power, white papers due Aug 24, 2026 after an extension.

**CLPS manifest completion (2)**
- `im-cs8-nova-c-2028` — Intuitive Machines' sixth CLPS award: production-line-qualified Nova-C no later than 2028,
  $68.6M base + $79.7M product-line-qualification incentive.
- `firefly-cs8-blue-ghost-2028` — Firefly's $144.2M CS-8 delivery, late 2028, same three NASA payloads.
  (Both titled by task order because trackers disagree on mission numbers.)

**Commercial / gates (3)**
- `starship-flight-14-2026` — first Starship orbital-insertion attempt; the precondition for propellant transfer.
- `ispace-mission-5-2029` — post-CP-12 Mission 5 retargeted to **2029** in the Aug 7, 2026 Q1 FY2027 materials.
- `ispace-starship-mcs-2030` — ispace's secured **500 kg** allocation on a Starship lunar landing "as early as 2030"
  plus the new Mobile Cargo System service; a commercial manifest position, not a SpaceX-published flight.

**Suits (1)**
- `axemu-sortie-suit-2026` — NASA's simplified Sortie Suit directive for the first landings.

**Europe (2)**
- `esa-small-lunar-missions-2025` — ESA's Terrae Novae small-lunar-mission line: €50M target, <4.5 years, eight
  proposals selected Dec 2025, seven at €150k concept maturation, MAGPIE on a direct implementation path.
- `esa-mani-lunar-mapper-2029` — Máni, Denmark's first lunar mission and the first ESA mission led from Denmark:
  polar 3D mapping smallsat, approved Dec 16, 2025 at the 342nd Council, Phase A/B1, launch target 2029,
  Space Inventor prime, ~€50M with Polish/Dutch/Slovenian/French partners.

**ILRS (1)**
- `ilrs-russia-segment-concept-2026` — RAS approval of Russia's ILRS segment concept.

### Key updates to existing events (46 ids)

- **CLPS windows / placeholders:** `griffin-1-moon-base-ii-2026` (manifest: 10 payloads/6 countries, FLIP ~500 kg,
  CubeRover, BEACON with Mission Control, ESA LandCam-X, Nobile Crater, ~$323M, ≥5 surface days; +CA),
  `im-3-2026`, `blue-ghost-m2-2026`, `esa-moonlight-pathfinder-2026`, `rashid-2-blue-ghost`,
  `blue-moon-mk1-endurance-2026` (seven Blue Moon vehicles in production; "Moon Base 1" naming), `viper-blue-moon-2027`,
  `peregrine-2-2028` (second CS-8 Astrobotic delivery still undetailed), `clps-cs8-awards-2026`.
- **Artemis / HLS:** `artemis-iii-2027` (June 2027 statements, RS-25 install complete Sep 1, wet dress before end of
  2026, New Glenn-first sequence), `artemis-iv-2028`, `artemis-v-2028`, `hls-oig-report-2026`,
  `hls-uncrewed-lunar-demos-2027`, `starship-orbital-refuel-demo`, `starship-hls-crew-window`, `new-glenn-rtf-2026`
  (now 2026–2027 `slipped`).
- **Suits:** `axemu-flight-demo-2027`, `axiom-axemu-lcvg-2026`, `axemu-oig-readiness-risk-2026` (original 2025/2026
  demos → late 2027, ~18-month slips; OIG worst case 2031; Dec 31, 2027 recommendation targets).
- **Procurement:** `clps-2-0-procurement-2026` (solicitation 80JSC026R0015; proposals due Jun 30, 2026 actual; award
  planned **Sep 8, 2026**, contract start Oct 1, 2026; schedule last updated Aug 24, 2026; **no award announced** as of
  Sep 13), `moon-base-ltv-awards-2026` (CX-2B, contract 80JSC026F7015, $25.38M obligated + $6.58M on Aug 6, 2026; rover
  specs), `nasa-ignition-moon-base-2026`, `moon-base-phase-1-2029`, `sr1-freedom-ppe-repurpose-2026` (SR-1 named as
  LR-1's precursor: HALEU, 20 kWe closed Brayton).
- **Russia:** `luna-26-2028`, `luna-27a-2029`, `luna-27b-2030` (pole assignment now attributed to Lavochkin's DG:
  A=south 2029, B=north 2030), `luna-28-sample-return` (2034 per Lavochkin), `luna-30-roving-2034` (Space Atom sequence
  2033/2034/2035; needs a 100 t-class launcher Roscosmos is not building), `ilrs-nuclear-power-plant-2036`,
  `ilrs-partners-policy-2025` ('555' plan).
- **China:** `change-7-slipped-2026`, `change-8-2028` (41 proposals → 14 accepted → 10 projects; cancellation rumours
  rebutted), `clep-cmsa-reorganization-2026` (Queqiao-2 moved too; five ILRS cargo missions 2031–2035 in the 2021 plan).
- **India / Japan:** `chandrayaan-4-2027` (Oct 2027 committee target vs chairman's 2028; SC120/SE2000 not flight-ready
  before 2028–29; ₹34.6 crore of ₹150 crore spent), `chandrayaan-5-lupex-2028` (Space Commission approved, Cabinet
  pending; 6,800 kg lander / 350 kg rover), `ispace-m3-2028`, `ispace-ultra-restructure-2026`, `ispace-mission-2-5-2027`
  (Argo Space named).
- **Europe / Canada:** `esa-rome-ministerial-2026`, `esa-gateway-modules-posture-2026`, `esa-lunar-link-repurpose-itt-2026`,
  `canadarm3-moon-base-repurpose-2026`, `firefly-moonfall-drones-2028`, `artemis-accords-ongoing` (72nd signatory
  ceremony scheduled Sep 14, 2026).

### New actors / bibliography

- **Actors (+3):** US Department of Energy, White House (Executive Office of the President), Space Inventor.
  Kurchatov Institute and Argo Space are named in `notes` rather than as actor records, because neither has a verified
  official URL in this pass's fetches and the dataset requires one.
- **Bibliography (+48, one duplicate merged):** White House NSTM-3, NASA/DOE reactor releases and the signed MOU,
  SAM.gov SPARC and NextSTEP-3 Appendix B postings, NASA JSC's CLPS2 acquisition page, USAspending's CX-2B record,
  Intuitive Machines' sixth-award release, ispace Q1 FY2027 release and deck, ESA's small-lunar-missions page and 347th
  Council outcomes, European Spaceflight / University of Copenhagen / Science in Poland on Máni, Blue Origin's LC-36B
  release, NASASpaceflight's dual-pad piece, Ars Technica (Sortie Suit + Rocket Report 9.09), Spaceflight Now and
  Florida Today on Artemis III timing, CSA's Canadarm3 release and data sheet, TASS on the Russian ILRS segment, NEI on
  the Roscosmos reactor roadmap, China in Space on Chang'e-7, India Today and The Hindu on Chandrayaan-4/5, Voyager's
  Griffin-1 page, Pasadena Now on JPL testing, Firefly's Alpha PUG, plus four tracker listings retained explicitly as
  **rejected placeholders**.

### Skipped because weak / thin (unchanged skips are not re-litigated)

- **Any day-level date** for Griffin-1, IM-3, Blue Ghost 2 or MK1 Endurance — all four remaining candidates were tracker
  placeholders; cited as such instead of adopted.
- **A second Astrobotic CS-8 event** — trackers call it Peregrine Mission Three, but no NASA or Voyager payload/site
  detail exists; kept as a note on `peregrine-2-2028`.
- **Artemis IV provider designation event** — NASA is still explicitly readiness-based.
- **Starship ship-to-ship transfer calendar date** — still unpublished; only the Flight 14 gate is dated.
- **Firefly CS-8 mission number and landing site** — unpublished; entry titled by task order.
- **CT-4 payload count discrepancy** (a trade summary says seven payloads vs NASA's six) — single mid-tier source, not
  entered.
- **A Kurchatov Institute actor record** and **an Argo Space actor record** — no verified official URLs this pass.
- **MoonFall ICD, VIPER option exercise, Canadarm3 surface year, CNSA English Chang'e-7 re-date, New Glenn RTF day,
  AxEMU venue** — all re-checked, all still unpublished.
- **ESA ministerial exact day** — ESA still says only "December 2026 in Italy"; the 15 December date remains media-sourced
  and stays in `notes`, so the event keeps month precision.
- **CLPS 2.0 awards** — NASA's own schedule planned award on Sep 8, 2026 and nothing has been announced; recorded as an
  open item rather than an inferred award.
- **The other previewed Moon Base solicitations** (power-and-avionics delivery, extra science manifest, south pole optical
  imager, comm/nav relay constellation) — not released as of Sep 13, 2026.

### Contradictions worth carrying forward

- **Artemis V: late 2028 (public) vs no later than March 2030 (December 2024 contractual baseline, audited by OIG).**
  Unresolved; dataset keeps the public date and records the conflict.
- **Artemis III: 2027 (NASA pages) vs "as early as June 2027" (Isaacman, Aug 21, 2026) vs "no later than June 2027"
  (contractual).** Dataset keeps year precision.
- **Fission surface power sizing: 100 kW by end-2029 (July 2025 NASA memo) vs 20 kWe landing in 2030 (Aug 2026 LR-1
  procurement), with 10 kW and 40 kW-class descriptions still live on older NASA pages.** Recorded in
  `lunar-reactor-1-2030` notes; the 100 kWe figure survives only as an extensibility requirement.
- **Chandrayaan-4: October 2027 (Department of Space committee material) vs 2028 (ISRO chairman), against a
  semi-cryogenic LVM3 not expected before 2028–29 and separate reporting that two existing LVM3s will be used instead.**
- **ispace Mission 5: 2030 (March 2026 restructure) vs 2029 (August 2026 investor materials).** Now split across
  `ispace-ultra-restructure-2026` (the numbering) and `ispace-mission-5-2029` (the current target).
- **Chang'e-8: "around 2029" (CNSA English) vs "no earlier than 2028" (CCTV, Sept 2026), with an unspecified CMSA
  reconfiguration reported Sep 10, 2026.** Range retained.
- **Luna-27 pole assignment:** Lavochkin's DG assigns A=south/B=north (Feb 2026) while Zelyony said the order was
  undetermined (Aug 2025). Dataset follows Lavochkin and flags it as industry-stated.
- **New: Starship Flight 14 date provenance.** The FAA lists Sep 18, 2026; SpaceX had published nothing. Entered as
  `planned` with day precision and an explicit provenance note — the one place this pass uses a day for an unflown
  mission, and only because the window is a government-published artifact.

### Open questions after this pass

1. **CLPS launch days** for Griffin-1 (inside Nov 2026), IM-3 (inside Q1 2027), Blue Ghost 2 and MK1 Endurance — open.
2. **Artemis IV HLS provider designation** — open; gated on the Artemis III LEO demo.
3. **VIPER CS-7 option exercise** — open; gated on Endurance.
4. **Starship ship-to-ship propellant transfer date** — open; watch whether Flight 14 flies on Sep 18–19, 2026.
5. **CNSA official English Chang'e-7 re-date** — open; Feb/Mar 2027 windows are secondary-sourced.
6. **ESA I-Hab / Lunar View / Lunar Link flight assignments** — open until the Rome ministerial (Dec 2026, day still
   unofficial).
7. **New Glenn actual return-to-flight date** — open; company end-2026 vs independent Q1 2027.
8. **MoonFall public interface documentation** — open.
9. **Canadarm3 lunar-surface deployment year** — open (value resolved earlier at CDN $1B).
10. **AxEMU 2027 demo venue (ISS EVA vs Artemis III)** — open, and now entangled with the Sortie Suit rework and
    shortened certification requirements.
11. **CLPS 2.0 awards** — open past NASA's own planned Sep 8, 2026 award date.
12. **SPARC / LR-1 Phase 1 awards** — new open question: final RFP, source selection and whether NASA awards two or more
    Phase 1 task orders after the Sep 28, 2026 response date.
13. **Which lander delivers LR-1**, and whether a 2030 landing survives an 18-month Phase 1 — new open question.
14. **SR-1 Freedom launch year** — still open; its role as LR-1 precursor is now explicit.
15. **Remaining Moon Base solicitations** (power/avionics delivery, extra science manifest, south pole optical imager,
    comm/nav relay constellation) — open.
16. **Firefly CS-8 mission designation and site**, and the **second Astrobotic CS-8 mission** — open.
17. **Máni's implementation selection** (Phase A/B1 → build) and whether the 2029 target holds — new open question.
18. **Chang'e-8 reconfiguration specifics under CMSA** — still open.
