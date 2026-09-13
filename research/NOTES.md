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
