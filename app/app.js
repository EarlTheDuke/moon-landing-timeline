/**
 * Moon Landing Timeline — static browser UI.
 * Reads ../data/events/events.json (plus actors.json and images.json when
 * available) and renders: a photo hero, a "Now & next" strip, the graphical
 * overview, the race scoreboard and schedule-change list, then the filterable
 * timeline and the Highlights drafting mode. No build step, no dependencies.
 */

const {
  STATUS_ORDER,
  STATUS_LABELS,
  STATUS_GLOSSARY,
  CATEGORY_LABELS,
  PRECISION_LABELS,
  COUNTRY_NAMES,
  OPEN_STATUSES,
  labelFor,
  el,
  yearOf,
  decadeOf,
  formatDate,
  formatMonth,
  flagNode,
  programColor,
  relativePhrase,
  monthKey,
  isOpen,
  imageFor,
  imageCredit,
  loadEvents,
  loadActors,
  loadImages,
  copyText,
  shareUrlFor,
  initTheme,
} = window.MLT;

const H = window.MLT_HIGHLIGHTS;
const OV = window.MLT_OVERVIEW;

const FILTER_LABELS = {
  q: "Search",
  status: "Status",
  country: "Country",
  category: "Type",
  program: "Program",
  confidence: "Confidence",
  decade: "Decade",
  month: "Month",
};

const els = {
  timeline: document.getElementById("timeline"),
  resultMeta: document.getElementById("result-meta"),
  search: document.getElementById("search"),
  filters: document.getElementById("filters"),
  filterDrawer: document.getElementById("filter-drawer"),
  filterCount: document.getElementById("filter-count"),
  activeFilters: document.getElementById("active-filters"),
  quickChips: document.getElementById("quick-chips"),
  yearRail: document.getElementById("year-rail"),
  statusChips: document.getElementById("status-chips"),
  decadeBars: document.getElementById("decade-bars"),
  headlineStats: document.getElementById("headline-stats"),
  glossary: document.getElementById("glossary"),
  heroEyebrow: document.getElementById("hero-eyebrow"),
  heroCredit: document.getElementById("hero-credit"),
  toolbar: document.getElementById("toolbar"),
  reset: document.getElementById("reset"),
  stats: document.querySelector(".stats"),
  highlights: document.getElementById("highlights"),
  highlightList: document.getElementById("highlight-list"),
  highlightMeta: document.getElementById("highlight-meta"),
  highlightSort: document.getElementById("highlight-sort"),
  beatRow: document.getElementById("beat-row"),
  draftDate: document.getElementById("draft-date"),
  draftHashtag: document.getElementById("draft-hashtag"),
  copyLive: document.getElementById("copy-live"),
  nowStrip: document.getElementById("now-strip"),
  thisMonth: document.getElementById("this-month"),
  upcoming: document.getElementById("upcoming"),
  overview: document.getElementById("ov"),
  overviewLegend: document.getElementById("ov-legend"),
  raceCols: document.getElementById("race-cols"),
  slipList: document.getElementById("slip-list"),
  dialog: document.getElementById("event-dialog"),
  dialogBody: document.getElementById("dialog-body"),
  footerCount: document.getElementById("footer-count"),
};

const state = {
  q: "",
  status: "",
  country: "",
  category: "",
  program: "",
  confidence: "",
  decade: "",
  month: "",
  sort: "asc",
  view: "detailed",
  mode: "timeline",
  beat: "",
  hsort: "score",
  past: false, // show years fully in the past expanded
  event: "", // id of the event open in the detail dialog
};

let allEvents = [];
let curated = [];
let curatedById = new Map();
let actorsById = new Map();
let overview = null;
/** Per-card overrides of the global compact/detailed default. */
const openOverrides = new Map();
let yearObserver = null;
let revealObserver = null;
const TODAY = new Date();
const THIS_YEAR = TODAY.getFullYear();

/* ------------------------------------------------------------------ utils */

function searchTokens() {
  return state.q.toLowerCase().split(/\s+/).filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Text content with search matches wrapped in <mark>, built without innerHTML. */
function highlighted(text, tokens) {
  const frag = document.createDocumentFragment();
  const value = String(text || "");
  if (!tokens.length || !value) {
    frag.appendChild(document.createTextNode(value));
    return frag;
  }
  const re = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  let last = 0;
  for (const match of value.matchAll(re)) {
    if (match.index > last) frag.appendChild(document.createTextNode(value.slice(last, match.index)));
    frag.appendChild(el("mark", null, match[0]));
    last = match.index + match[0].length;
  }
  if (last < value.length) frag.appendChild(document.createTextNode(value.slice(last)));
  return frag;
}

function reduceMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMilestone(event) {
  const item = curatedById.get(event.id);
  if (event.category === "crewed_landing") return true;
  return Boolean(item && item.why.some((w) => w.id === "first" || w.id === "sample-return" || w.id === "nuclear"));
}

/* --------------------------------------------------------- filter + sort */

function inMonth(event, month) {
  const start = String(event.date_start || "");
  if (start.startsWith(month)) return true;
  if (event.date_end) {
    const s = start.slice(0, 7);
    const e = String(event.date_end).slice(0, 7);
    return s <= month && month <= e;
  }
  return false;
}

function matchesFilters(event, ignore) {
  if (ignore !== "status" && state.status) {
    if (state.status === "open" ? !isOpen(event) : event.status !== state.status) return false;
  }
  if (ignore !== "country" && state.country && !(event.countries || []).includes(state.country)) return false;
  if (ignore !== "category" && state.category && event.category !== state.category) return false;
  if (ignore !== "program" && state.program && event.program !== state.program) return false;
  if (ignore !== "confidence" && state.confidence && event.confidence !== state.confidence) return false;
  if (ignore !== "decade" && state.decade && decadeOf(event) !== state.decade) return false;
  if (ignore !== "month" && state.month && !inMonth(event, state.month)) return false;
  if (ignore !== "q") {
    for (const token of searchTokens()) {
      if (!event.__haystack.includes(token)) return false;
    }
  }
  return true;
}

function filterEvents(ignore) {
  return allEvents.filter((event) => matchesFilters(event, ignore));
}

function sortEvents(events) {
  const dir = state.sort === "desc" ? -1 : 1;
  return [...events].sort((a, b) => {
    const byDate = String(a.date_start || "").localeCompare(String(b.date_start || ""));
    if (byDate) return byDate * dir;
    const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (byStatus) return byStatus;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

function activeFilterEntries() {
  return Object.keys(FILTER_LABELS)
    .filter((key) => state[key])
    .map((key) => [key, state[key]]);
}

function hasAnyFilter() {
  return activeFilterEntries().length > 0;
}

/* ------------------------------------------------------------- URL state */

function readStateFromUrl() {
  const params = new URLSearchParams(location.search);
  for (const key of [...Object.keys(FILTER_LABELS), "sort", "view", "mode", "beat", "hsort"]) {
    const value = params.get(key);
    if (value != null) state[key] = value;
  }
  state.past = params.get("past") === "1";
  if (state.sort !== "desc") state.sort = "asc";
  if (state.view !== "compact") state.view = "detailed";
  if (state.mode !== "highlights") state.mode = "timeline";
  if (state.hsort !== "date") state.hsort = "score";
  if (state.beat && !H.beatById(state.beat)) state.beat = "";
  if (state.month && !/^\d{4}-\d{2}$/.test(state.month)) state.month = "";
  return params.get("event") || (location.hash.startsWith("#event-") ? location.hash.slice(7) : "");
}

function writeStateToUrl() {
  const params = new URLSearchParams();
  for (const [key, value] of activeFilterEntries()) params.set(key, value);
  if (state.sort !== "asc") params.set("sort", state.sort);
  if (state.view !== "detailed") params.set("view", state.view);
  if (state.mode !== "timeline") params.set("mode", state.mode);
  if (state.beat) params.set("beat", state.beat);
  if (state.hsort !== "score") params.set("hsort", state.hsort);
  if (state.past) params.set("past", "1");
  if (state.event) params.set("event", state.event);
  const query = params.toString();
  history.replaceState(null, "", `${query ? `?${query}` : location.pathname}${location.hash}`);
}

/* --------------------------------------------------------------- card UI */

function isCardOpen(event) {
  if (openOverrides.has(event.id)) return openOverrides.get(event.id);
  return state.view === "detailed";
}

function badge(text, className) {
  return el("li", `badge ${className || ""}`.trim(), text);
}

function badgesFor(event, { withProgram = true } = {}) {
  const badges = el("ul", "badges");
  if (event.status) badges.appendChild(badge(labelFor("status", event.status), `status-${event.status}`));
  if (event.category) badges.appendChild(badge(labelFor("category", event.category), "badge-category"));
  if (withProgram && event.program) {
    const b = badge(event.program, "badge-program");
    const colour = programColor(event.program);
    if (colour) b.style.setProperty("--p", colour);
    badges.appendChild(b);
  }
  if (event.confidence) {
    badges.appendChild(badge(labelFor("confidence", event.confidence), `confidence-${event.confidence}`));
  }
  return badges;
}

function actorChip(name) {
  const actor = actorsById.get(name);
  if (!actor || !actor.url) return el("li", "chip", name);
  const item = el("li", "chip chip-link");
  const link = el("a", null, name);
  link.href = actor.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  if (actor.notes) link.title = actor.notes;
  item.appendChild(link);
  return item;
}

function countryChip(code) {
  const chip = el("li", "chip chip-flag");
  chip.appendChild(flagNode(code));
  chip.appendChild(document.createTextNode(COUNTRY_NAMES[code] || code));
  return chip;
}

function flagRow(codes, className = "flag-row") {
  const row = el("span", className);
  for (const code of codes) row.appendChild(flagNode(code));
  return row;
}

function definitionRow(term, valueNode) {
  const frag = document.createDocumentFragment();
  frag.appendChild(el("dt", null, term));
  const dd = el("dd");
  dd.appendChild(valueNode);
  frag.appendChild(dd);
  return frag;
}

function pictureFor(event, size, className) {
  const src = imageFor(event, size);
  if (!src) return null;
  const figure = el("figure", className);
  const img = el("img");
  img.src = src;
  img.loading = "lazy";
  img.decoding = "async";
  const credit = imageCredit(event);
  img.alt = (event.image && event.image.alt) || "";
  figure.appendChild(img);
  if (credit && credit.credit) {
    const cap = el("figcaption", "pic-credit");
    const generic = !(event.image && event.image.file);
    cap.textContent = `${generic ? "Program image · " : ""}${credit.credit}`;
    if (credit.license && !/public domain/i.test(credit.license)) cap.textContent += ` · ${credit.license}`;
    if (credit.source_url) {
      const link = el("a", null, " ↗");
      link.href = credit.source_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.title = "Image source";
      cap.appendChild(link);
    }
    figure.appendChild(cap);
  }
  return figure;
}

/** Summary, facts, notes, sources and the action row; shared by cards and the dialog. */
function eventBody(event, tokens = []) {
  const body = document.createDocumentFragment();

  if (event.summary) {
    const summary = el("p", "summary");
    summary.appendChild(highlighted(event.summary, tokens));
    body.appendChild(summary);
  }

  const facts = el("dl", "event-facts");
  const countries = event.countries || [];
  if (countries.length) {
    const list = el("ul", "chip-list");
    for (const code of countries) list.appendChild(countryChip(code));
    facts.appendChild(definitionRow("Countries", list));
  }
  const actors = event.actors || [];
  if (actors.length) {
    const list = el("ul", "chip-list");
    for (const name of actors) list.appendChild(actorChip(name));
    facts.appendChild(definitionRow("Actors", list));
  }
  if (facts.childElementCount) body.appendChild(facts);

  if (event.notes && String(event.notes).trim()) {
    const notes = el("p", "notes");
    notes.appendChild(el("span", "notes-label", "Note "));
    notes.appendChild(document.createTextNode(event.notes));
    body.appendChild(notes);
  }

  const sources = event.sources || [];
  if (sources.length) {
    const wrap = el("div", "sources");
    wrap.appendChild(el("h4", "sources-title", `Sources (${sources.length})`));
    const list = el("ul", "source-list");
    for (const source of sources) {
      const item = el("li");
      const link = el("a", "source-link", source.title || source.url);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.appendChild(link);
      const metaBits = [source.publisher, source.accessed && `accessed ${source.accessed}`].filter(Boolean);
      if (metaBits.length) item.appendChild(el("span", "source-meta", ` — ${metaBits.join(" · ")}`));
      list.appendChild(item);
    }
    wrap.appendChild(list);
    body.appendChild(wrap);
  }

  body.appendChild(draftActions(event));
  return body;
}

function renderEvent(event, tokens) {
  const card = el("article", `event status-${event.status || "planned"}`);
  card.id = `event-${event.id}`;
  const colour = programColor(event.program);
  if (colour) card.style.setProperty("--p", colour);
  if (isMilestone(event)) card.classList.add("is-milestone");

  const bodyId = `body-${event.id}`;
  const open = isCardOpen(event);
  card.classList.toggle("is-collapsed", !open);

  const heading = el("h3", "event-heading");
  const toggle = el("button", "event-toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-controls", bodyId);

  const dateLine = el("span", "event-date");
  dateLine.appendChild(document.createTextNode(formatDate(event)));
  const precision = PRECISION_LABELS[event.date_precision];
  if (precision) dateLine.appendChild(el("span", "precision", `≈ ${precision}`));
  if (isOpen(event) && event.date_precision !== "range") {
    dateLine.appendChild(el("span", "relative", relativePhrase(event, TODAY)));
  }

  const title = el("span", "event-title");
  title.appendChild(highlighted(event.title || event.id, tokens));

  toggle.append(dateLine, title, el("span", "event-chevron"));
  heading.appendChild(toggle);

  const head = el("div", "event-head");
  head.appendChild(heading);
  const thumb = pictureFor(event, "sm", "event-thumb");
  if (thumb) {
    thumb.querySelector("figcaption")?.remove();
    thumb.addEventListener("click", () => openDialog(event));
    thumb.title = "Open details";
    head.appendChild(thumb);
  }

  const badges = badgesFor(event);
  if (isMilestone(event)) badges.prepend(badge("★ Milestone", "badge-milestone"));

  const body = el("div", "event-body");
  body.id = bodyId;
  if (!open) body.hidden = true;
  body.appendChild(eventBody(event, tokens));

  toggle.addEventListener("click", () => {
    const next = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(next));
    body.hidden = !next;
    card.classList.toggle("is-collapsed", !next);
    openOverrides.set(event.id, next);
  });

  card.append(head, badges, body);
  return card;
}

/* -------------------------------------------------------------- dialog */

function openDialog(event) {
  if (!els.dialog || typeof els.dialog.showModal !== "function") {
    focusEvent(event.id);
    return;
  }
  els.dialogBody.replaceChildren();

  const pic = pictureFor(event, "lg", "dialog-pic");
  if (pic) els.dialogBody.appendChild(pic);

  const head = el("div", "dialog-head");
  const eyebrow = el("p", "dialog-eyebrow");
  const colour = programColor(event.program);
  if (colour) eyebrow.style.setProperty("--p", colour);
  const beat = curatedById.get(event.id);
  eyebrow.textContent = [event.program, beat ? H.beatById(beat.beat)?.label : labelFor("category", event.category)]
    .filter(Boolean)
    .join(" · ");
  head.appendChild(eyebrow);
  const title = el("h2", "dialog-title", event.title || event.id);
  title.id = "dialog-title";
  head.appendChild(title);
  const when = el("p", "dialog-when");
  const precision = PRECISION_LABELS[event.date_precision];
  when.textContent = [H.whenPhrase(event), precision && `≈ ${precision}`, isOpen(event) && relativePhrase(event, TODAY)]
    .filter(Boolean)
    .join("  ·  ");
  head.appendChild(when);
  head.appendChild(badgesFor(event));
  els.dialogBody.appendChild(head);

  const body = el("div", "dialog-content");
  body.appendChild(eventBody(event));
  els.dialogBody.appendChild(body);

  const jump = el("button", "btn-ghost", "Show in timeline ↓");
  jump.type = "button";
  jump.addEventListener("click", () => {
    els.dialog.close();
    focusEvent(event.id);
  });
  body.querySelector(".event-actions")?.appendChild(jump);

  state.event = event.id;
  writeStateToUrl();
  els.dialog.showModal();
  els.dialog.scrollTop = 0;
}

/* ------------------------------------------------------------- hero etc */

function renderHeadlineStats() {
  const years = allEvents.map(yearOf).filter((y) => y !== "Unknown");
  const citations = allEvents.reduce((total, e) => total + (e.sources || []).length, 0);
  const countries = new Set(allEvents.flatMap((e) => e.countries || []));
  const open = allEvents.filter(isOpen).length;
  const stats = [
    ["Events", String(allEvents.length)],
    ["Upcoming", String(open)],
    ["Span", years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—"],
    ["Countries", String(countries.size)],
    ["Citations", String(citations)],
  ];
  els.headlineStats.replaceChildren();
  for (const [term, value] of stats) {
    const item = el("div", "headline-stat");
    item.append(el("dt", null, term), el("dd", null, value));
    els.headlineStats.appendChild(item);
  }

  const accessed = allEvents
    .flatMap((e) => (e.sources || []).map((s) => s.accessed))
    .filter(Boolean)
    .sort()
    .pop();
  if (accessed) {
    const [y, m] = accessed.split("-");
    els.heroEyebrow.textContent = `Sourced · updated ${window.MLT.MONTHS[Number(m) - 1]} ${y}`;
  }
  if (els.footerCount) els.footerCount.textContent = `${allEvents.length} events · ${citations} citations`;

  els.glossary.replaceChildren(el("strong", null, "How to read the dates: "));
  const order = ["completed", "in_progress", "planned", "slipped", "conceptual"];
  order.forEach((status, index) => {
    const term = el("span", `gloss status-${status}`);
    term.append(el("b", null, STATUS_LABELS[status]), document.createTextNode(` ${STATUS_GLOSSARY[status]}`));
    els.glossary.appendChild(term);
    if (index < order.length - 1) els.glossary.appendChild(document.createTextNode(" "));
  });

  const hero = window.MLT_IMAGES && window.MLT_IMAGES.hero;
  if (hero && els.heroCredit) {
    els.heroCredit.textContent = `Photo: ${hero.credit}${hero.alt ? ` — ${hero.alt}` : ""}`;
  }
}

/* ------------------------------------------------------------ now & next */

/**
 * What a visitor means by "what's next": flights, landers, rovers, hardware
 * tests and infrastructure with a target from this month forward. Paperwork
 * (policy / other) stays in the timeline but out of this strip. Year-only
 * targets sort after month-level ones in the same year so precise dates lead.
 */
function isUpcomingMission(e) {
  if (!isOpen(e) || e.status === "conceptual") return false;
  if (e.category === "policy" || e.category === "other") return false;
  const nowKey = monthKey(TODAY);
  const start = String(e.date_start || "");
  const end = String(e.date_end || "");
  if (start.length >= 7) return start.slice(0, 7) >= nowKey || end.slice(0, 7) >= nowKey;
  return start >= String(THIS_YEAR);
}

function bySoonest(a, b) {
  const ad = String(a.date_start).padEnd(10, "9");
  const bd = String(b.date_start).padEnd(10, "9");
  return ad.localeCompare(bd) || (curatedById.get(b.id)?.score || 0) - (curatedById.get(a.id)?.score || 0);
}

function upcomingEvents(limit = 8) {
  return allEvents.filter(isUpcomingMission).sort(bySoonest).slice(0, limit);
}

function renderNowNext() {
  const items = upcomingEvents(8);
  els.nowStrip.replaceChildren();
  for (const event of items) {
    const card = el("button", `now-card status-${event.status}`);
    card.type = "button";
    const colour = programColor(event.program);
    if (colour) card.style.setProperty("--p", colour);
    const src = imageFor(event, "sm");
    if (src) {
      const img = el("img", "now-pic");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      card.appendChild(img);
    }
    const body = el("span", "now-body");
    const top = el("span", "now-top");
    top.append(
      flagRow((event.countries || []).slice(0, 3), "now-flags"),
      el("span", `now-status status-${event.status}`, STATUS_LABELS[event.status] || event.status)
    );
    body.appendChild(top);
    body.appendChild(el("span", "now-title", event.title));
    const when = el("span", "now-when");
    when.appendChild(el("b", null, relativePhrase(event, TODAY)));
    if (event.date_precision !== "range") when.appendChild(document.createTextNode(` · ${formatDate(event)}`));
    body.appendChild(when);
    body.appendChild(el("span", "now-program", event.program || ""));
    card.appendChild(body);
    card.addEventListener("click", () => openDialog(event));
    els.nowStrip.appendChild(card);
  }
  if (!items.length) {
    els.nowStrip.appendChild(el("p", "empty-hint", "Nothing open on the calendar — check the timeline below."));
  }
}

/* --------------------------------------------------------------- race */

const BLOCS = [
  {
    id: "us",
    label: "United States",
    sub: "Artemis · CLPS · commercial",
    flags: ["US"],
    test: (e) => (e.countries || []).includes("US"),
  },
  {
    id: "cn",
    label: "China & partners",
    sub: "CMSA · CLEP · ILRS (with Russia)",
    flags: ["CN", "RU"],
    test: (e) => (e.countries || []).some((c) => c === "CN" || c === "RU") && !(e.countries || []).includes("US"),
  },
  {
    id: "rest",
    label: "Europe, Japan, India, Korea…",
    sub: "ESA · JAXA · ISRO · KASA · UAE · CSA",
    flags: ["EU", "JP", "IN", "KR"],
    test: (e) => !(e.countries || []).some((c) => c === "US" || c === "CN" || c === "RU"),
  },
];

function nextCrewedLanding(events) {
  const candidates = events
    .filter((e) => e.category === "crewed_landing" && isOpen(e))
    .filter((e) => !/window|readiness|operational/i.test(e.title || ""))
    .sort((a, b) => String(a.date_start).localeCompare(String(b.date_start)));
  return candidates.find((e) => e.status !== "conceptual") || candidates[0];
}

function renderRace() {
  els.raceCols.replaceChildren();
  for (const bloc of BLOCS) {
    const mine = allEvents.filter(bloc.test);
    const done = mine.filter((e) => e.status === "completed");
    const landings = done.filter((e) => e.category === "uncrewed_lander" || e.category === "crewed_landing");
    const open = mine.filter(isOpen);
    const next = mine.filter(isUpcomingMission).sort(bySoonest)[0];
    const crew = nextCrewedLanding(mine);
    const slipped = mine.filter((e) => e.status === "slipped").length;

    const col = el("article", `race-col race-${bloc.id}`);
    const head = el("header", "race-head");
    head.append(
      flagRow(bloc.flags, "race-flags"),
      el("h3", "race-title", bloc.label),
      el("p", "race-sub", bloc.sub)
    );
    col.appendChild(head);

    const big = el("div", "race-big");
    const goalOnly = crew && crew.status === "conceptual";
    big.append(
      el("span", "race-big-label", goalOnly ? "Crewed landing goal" : "Crewed landing target"),
      el("span", "race-big-value", crew ? `${yearOf(crew)}${goalOnly ? "?" : ""}` : "—"),
      el("span", "race-big-note", crew ? `${crew.title}${goalOnly ? " — stated goal, no mission assigned" : ""}` : "No dated crewed landing in the data")
    );
    if (crew) {
      big.classList.add("is-link");
      big.tabIndex = 0;
      big.setAttribute("role", "button");
      big.addEventListener("click", () => openDialog(crew));
      big.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") openDialog(crew);
      });
    }
    col.appendChild(big);

    const nums = el("dl", "race-nums");
    for (const [k, v] of [
      ["Completed", done.length],
      ["Landing attempts", landings.length],
      ["Upcoming", open.length],
      ["Slipped", slipped],
    ]) {
      const item = el("div");
      item.append(el("dt", null, k), el("dd", null, String(v)));
      nums.appendChild(item);
    }
    col.appendChild(nums);

    if (next) {
      const nextRow = el("button", "race-next");
      nextRow.type = "button";
      nextRow.append(
        el("span", "race-next-label", "Next up"),
        el("span", "race-next-title", next.title),
        el("span", "race-next-when", `${relativePhrase(next, TODAY)} · ${formatDate(next)}`)
      );
      nextRow.addEventListener("click", () => openDialog(next));
      col.appendChild(nextRow);
    }
    els.raceCols.appendChild(col);
  }
}

/* --------------------------------------------------------------- slips */

function renderSlips() {
  const changed = allEvents
    .filter((e) => e.status === "slipped" || e.status === "cancelled")
    .sort((a, b) => String(a.date_start).localeCompare(String(b.date_start)));
  els.slipList.replaceChildren();
  for (const event of changed.slice(0, 10)) {
    const item = el("li", `slip status-${event.status}`);
    const button = el("button", "slip-btn");
    button.type = "button";
    button.append(
      el("span", `slip-status status-${event.status}`, STATUS_LABELS[event.status]),
      el("span", "slip-title", event.title),
      el("span", "slip-when", formatDate(event))
    );
    const note = String(event.notes || "").trim();
    if (note) button.appendChild(el("span", "slip-note", note.length > 150 ? `${note.slice(0, 148).trimEnd()}…` : note));
    button.addEventListener("click", () => openDialog(event));
    item.appendChild(button);
    els.slipList.appendChild(item);
  }
  if (!changed.length) els.slipList.appendChild(el("li", "empty-hint", "No slips or cancellations recorded."));
}

/* ------------------------------------------------------------ overview */

function renderOverview() {
  overview = OV.render(els.overview, allEvents, {
    curated,
    onSelect: (event) => openDialog(event),
    onYear: (year) => {
      state.past = true;
      update();
      const target = document.getElementById(`year-${year}`);
      if (target) target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    },
  });
  els.overviewLegend.replaceChildren();
  for (const status of ["completed", "in_progress", "planned", "slipped", "conceptual", "cancelled"]) {
    if (!allEvents.some((e) => e.status === status)) continue;
    const item = el("span", `legend-item status-${status}`);
    item.append(el("i"), document.createTextNode(STATUS_LABELS[status]));
    els.overviewLegend.appendChild(item);
  }
  const star = el("span", "legend-item legend-featured");
  star.append(el("i"), document.createTextNode("Milestone card"));
  els.overviewLegend.appendChild(star);
}

/* --------------------------------------------------------------- renders */

function renderStatusChips() {
  const pool = filterEvents("status");
  const counts = new Map();
  for (const event of pool) counts.set(event.status, (counts.get(event.status) || 0) + 1);

  els.statusChips.replaceChildren();

  const makeChip = (value, label, count) => {
    const chip = el("button", `stat-chip${value ? ` status-${value}` : ""}`);
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(state.status === value));
    chip.append(el("span", "stat-chip-label", label), el("span", "stat-chip-count", String(count)));
    if (!count && value) chip.classList.add("is-empty");
    chip.addEventListener("click", () => {
      state.status = state.status === value ? "" : value;
      syncControls();
      update();
    });
    return chip;
  };

  els.statusChips.appendChild(makeChip("", "All", pool.length));
  for (const status of STATUS_ORDER) {
    if (!allEvents.some((e) => e.status === status)) continue;
    els.statusChips.appendChild(makeChip(status, STATUS_LABELS[status] || status, counts.get(status) || 0));
  }
}

function renderDecadeBars() {
  const pool = filterEvents("decade");
  const decades = [...new Set(allEvents.map(decadeOf))].sort();
  const counts = new Map();
  for (const event of pool) {
    const decade = decadeOf(event);
    counts.set(decade, (counts.get(decade) || 0) + 1);
  }
  const max = Math.max(1, ...counts.values());

  els.decadeBars.replaceChildren();
  for (const decade of decades) {
    const count = counts.get(decade) || 0;
    const row = el("button", "bar-row");
    row.type = "button";
    row.setAttribute("aria-pressed", String(state.decade === decade));
    row.append(el("span", "bar-label", `${decade}s`));
    const track = el("span", "bar-track");
    const fill = el("span", "bar-fill");
    fill.style.width = `${Math.round((count / max) * 100)}%`;
    track.appendChild(fill);
    row.append(track, el("span", "bar-count", String(count)));
    row.addEventListener("click", () => {
      state.decade = state.decade === decade ? "" : decade;
      update();
    });
    els.decadeBars.appendChild(row);
  }
}

function renderQuickChips() {
  const chips = [
    ["status", "open", "Upcoming"],
    ["status", "completed", "Completed"],
    ["country", "US", "US", "US"],
    ["country", "CN", "China", "CN"],
    ["country", "EU", "Europe", "EU"],
    ["category", "crewed_landing", "Crewed"],
  ];
  els.quickChips.replaceChildren();
  for (const [key, value, label, flag] of chips) {
    const chip = el("button", "quick-chip");
    if (flag) chip.appendChild(flagNode(flag));
    chip.appendChild(document.createTextNode(label));
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(state[key] === value));
    chip.addEventListener("click", () => {
      state[key] = state[key] === value ? "" : value;
      syncControls();
      update();
    });
    els.quickChips.appendChild(chip);
  }
}

function renderActiveFilters() {
  const entries = activeFilterEntries();
  els.activeFilters.replaceChildren();
  els.activeFilters.hidden = entries.length === 0;
  if (!entries.length) {
    els.filterCount.hidden = true;
    return;
  }

  els.filterCount.hidden = false;
  els.filterCount.textContent = String(entries.length);

  for (const [key, value] of entries) {
    const chip = el("button", "active-chip");
    chip.type = "button";
    const shown = key === "q" ? `“${value}”` : labelFor(key, value);
    chip.append(
      el("span", "active-chip-key", `${FILTER_LABELS[key]}:`),
      el("span", "active-chip-value", shown),
      el("span", "active-chip-x", "×")
    );
    chip.setAttribute("aria-label", `Remove filter ${FILTER_LABELS[key]}: ${shown}`);
    chip.addEventListener("click", () => {
      state[key] = "";
      syncControls();
      update();
    });
    els.activeFilters.appendChild(chip);
  }

  const clear = el("button", "active-chip clear-all", "Clear all");
  clear.type = "button";
  clear.addEventListener("click", resetFilters);
  els.activeFilters.appendChild(clear);
}

function renderYearRail(groups) {
  els.yearRail.replaceChildren();
  els.yearRail.hidden = groups.length < 2;
  if (!groups.length) return;
  const list = el("ul", "year-rail-list");
  for (const [year, items] of groups) {
    const item = el("li");
    const link = el("a", "year-pill");
    link.href = `#year-${year}`;
    if (year === String(THIS_YEAR)) link.classList.add("is-now");
    link.append(el("span", "year-pill-year", year), el("span", "year-pill-count", String(items.length)));
    item.appendChild(link);
    list.appendChild(item);
  }
  els.yearRail.appendChild(list);
}

function groupByYear(events) {
  const groups = new Map();
  for (const event of events) {
    const year = yearOf(event);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(event);
  }
  return [...groups.entries()];
}

function observeYears() {
  if (yearObserver) yearObserver.disconnect();
  const sections = [...els.timeline.querySelectorAll(".year-group")];
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const visible = new Set();
  yearObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      const first = sections.find((section) => visible.has(section));
      for (const pill of els.yearRail.querySelectorAll(".year-pill")) {
        const active = first && pill.getAttribute("href") === `#year-${first.dataset.year}`;
        pill.classList.toggle("is-current", Boolean(active));
        if (active) pill.setAttribute("aria-current", "true");
        else pill.removeAttribute("aria-current");
      }
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  for (const section of sections) yearObserver.observe(section);
}

function observeReveal() {
  if (revealObserver) revealObserver.disconnect();
  if (reduceMotion() || !("IntersectionObserver" in window)) {
    for (const card of els.timeline.querySelectorAll(".event")) card.classList.add("in-view");
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -6% 0px" }
  );
  for (const card of els.timeline.querySelectorAll(".event")) revealObserver.observe(card);
}

function todayMarker() {
  const marker = el("div", "today-marker");
  marker.setAttribute("role", "separator");
  marker.append(el("span", "today-marker-label", `Today · ${formatDate({ date_start: TODAY.toISOString().slice(0, 10) })}`));
  return marker;
}

function renderTimeline(events) {
  const tokens = searchTokens();
  const groups = groupByYear(sortEvents(events));
  els.timeline.replaceChildren();
  renderYearRail(groups);

  if (!groups.length) {
    const empty = el("div", "empty");
    empty.append(
      el("p", "empty-title", "No events match those filters."),
      el("p", "empty-hint", "Try a broader search, or clear a filter to widen the timeline.")
    );
    const clear = el("button", "btn-reset", "Clear all filters");
    clear.type = "button";
    clear.addEventListener("click", resetFilters);
    empty.appendChild(clear);
    els.timeline.appendChild(empty);
    return;
  }

  // Years wholly in the past fold away by default (oldest-first, no filters) so
  // the list opens on the current year. Any filter or search shows everything.
  const collapsePast = !state.past && !hasAnyFilter() && state.sort === "asc";
  const pastGroups = collapsePast ? groups.filter(([year]) => Number(year) < THIS_YEAR) : [];
  const shownGroups = collapsePast ? groups.filter(([year]) => Number(year) >= THIS_YEAR) : groups;

  const frag = document.createDocumentFragment();
  if (pastGroups.length) {
    const count = pastGroups.reduce((n, [, items]) => n + items.length, 0);
    const years = pastGroups.map(([y]) => y);
    const fold = el("button", "past-fold");
    fold.type = "button";
    fold.append(
      el("span", "past-fold-title", `Show earlier events (${years[0]}–${years[years.length - 1]})`),
      el("span", "past-fold-count", `${count} completed and historical entries`)
    );
    fold.addEventListener("click", () => {
      state.past = true;
      update();
    });
    frag.appendChild(fold);
  }

  const todayFy = window.MLT.todayFractionalYear(TODAY);
  let markerPlaced = false;
  for (const [year, items] of shownGroups) {
    const section = el("section", "year-group");
    section.id = `year-${year}`;
    section.dataset.year = year;
    section.setAttribute("aria-labelledby", `year-heading-${year}`);
    if (year === String(THIS_YEAR)) section.classList.add("is-now");

    const header = el("div", "year-header");
    const heading = el("h2", "year-heading", year);
    heading.id = `year-heading-${year}`;
    header.append(
      heading,
      el("span", "year-count", `${items.length} event${items.length === 1 ? "" : "s"}`)
    );
    section.appendChild(header);

    const list = el("div", "year-events");
    for (const event of items) {
      if (!markerPlaced && state.sort === "asc" && (window.MLT.fractionalYear(event.date_start) ?? 0) > todayFy) {
        list.appendChild(todayMarker());
        markerPlaced = true;
      }
      list.appendChild(renderEvent(event, tokens));
    }
    if (!markerPlaced && year === String(THIS_YEAR) && state.sort === "asc") {
      list.appendChild(todayMarker());
      markerPlaced = true;
    }
    section.appendChild(list);
    frag.appendChild(section);
  }
  els.timeline.appendChild(frag);
  observeYears();
  observeReveal();
}

/* ------------------------------------------------------------ highlights */

function draftOptions() {
  return { date: els.draftDate.checked, hashtag: els.draftHashtag.checked };
}

function announce(message) {
  els.copyLive.textContent = message;
}

function copyButton(getText, label, className = "btn-copy") {
  const button = el("button", className, label);
  button.type = "button";
  let restore = 0;
  button.addEventListener("click", async () => {
    const ok = await copyText(getText());
    button.textContent = ok ? "Copied ✓" : "Copy failed";
    button.classList.toggle("is-copied", ok);
    announce(ok ? "Copied to clipboard." : "Copy failed — select the text and copy manually.");
    clearTimeout(restore);
    restore = setTimeout(() => {
      button.textContent = label;
      button.classList.remove("is-copied");
    }, 1800);
  });
  return button;
}

/** Copy/share row offered on every event card, using the current draft options. */
function draftActions(event) {
  const draft = H.buildDraft(event, draftOptions());
  const row = el("div", "event-actions");
  row.appendChild(copyButton(() => draft, "Copy draft"));

  const used = H.countChars(draft);
  const count = el("span", `char-count${used > H.DRAFT_LIMIT - 20 ? " is-tight" : ""}`, `${used}/${H.DRAFT_LIMIT}`);
  count.title = "Characters in the draft post, X's limit is 280";
  row.appendChild(count);

  row.appendChild(copyButton(() => shareUrlFor(event), "Copy link", "btn-ghost"));

  const share = el("a", "btn-ghost", "Share card ↗");
  share.href = `./share.html?event=${encodeURIComponent(event.id)}`;
  share.target = "_blank";
  share.rel = "noopener";
  row.appendChild(share);
  return row;
}

function highlightCard(item, tokens) {
  const { event } = item;
  const draft = H.buildDraft(event, draftOptions());
  const used = H.countChars(draft);

  const card = el("article", `highlight status-${event.status || "planned"}`);
  card.id = `highlight-${event.id}`;
  const colour = programColor(event.program);
  if (colour) card.style.setProperty("--p", colour);

  const src = imageFor(event, "sm");
  if (src) {
    const pic = el("button", "highlight-pic");
    pic.type = "button";
    pic.title = "Open details";
    const img = el("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    pic.appendChild(img);
    pic.addEventListener("click", () => openDialog(event));
    card.appendChild(pic);
  }

  const top = el("div", "highlight-top");
  // While a beat is selected, label cards with that beat rather than their primary one.
  const beat = H.beatById(state.beat) || H.beatById(item.beat);
  if (beat) top.appendChild(el("span", "beat-tag", beat.label));
  top.appendChild(el("span", "highlight-when", H.whenPhrase(event)));
  card.appendChild(top);

  const title = el("h3", "highlight-title");
  title.appendChild(highlighted(event.title || event.id, tokens));
  card.appendChild(title);

  if (item.why.length) {
    const why = el("ul", "why-list");
    for (const reason of item.why.slice(0, 4)) why.appendChild(el("li", "why-tag", reason.label));
    card.appendChild(why);
  }

  const preview = el("p", "draft-text", draft);
  card.appendChild(preview);

  const actions = el("div", "highlight-actions");
  actions.appendChild(copyButton(() => draft, "Copy draft"));

  const count = el("span", `char-count${used > H.DRAFT_LIMIT - 20 ? " is-tight" : ""}`);
  count.textContent = `${used}/${H.DRAFT_LIMIT}`;
  count.title = "Characters in the draft, X's limit is 280";
  actions.appendChild(count);

  const share = el("a", "btn-ghost", "Share card ↗");
  share.href = `./share.html?event=${encodeURIComponent(event.id)}`;
  share.target = "_blank";
  share.rel = "noopener";
  actions.appendChild(share);

  const details = el("button", "btn-ghost", "Details");
  details.type = "button";
  details.addEventListener("click", () => openDialog(event));
  actions.appendChild(details);

  const source = (event.sources || [])[0];
  if (source && source.url) {
    const link = el("a", "btn-ghost", `Source: ${source.publisher || "link"} ↗`);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (source.title) link.title = source.title;
    actions.appendChild(link);
  }

  card.appendChild(actions);
  return card;
}

function renderBeatRow(pool) {
  const counts = new Map();
  for (const item of pool) {
    for (const id of item.beats) counts.set(id, (counts.get(id) || 0) + 1);
  }

  els.beatRow.replaceChildren();
  const makeChip = (id, label, count) => {
    const chip = el("button", "beat-chip");
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(state.beat === id));
    chip.append(el("span", "beat-chip-label", label), el("span", "beat-chip-count", String(count)));
    const beat = H.beatById(id);
    if (beat) chip.title = beat.blurb;
    if (!count && id) chip.classList.add("is-empty");
    chip.addEventListener("click", () => {
      state.beat = state.beat === id ? "" : id;
      update();
    });
    return chip;
  };

  els.beatRow.appendChild(makeChip("", "All beats", pool.length));
  for (const beat of H.BEATS) {
    els.beatRow.appendChild(makeChip(beat.id, beat.label, counts.get(beat.id) || 0));
  }
}

function renderHighlights(events) {
  const visible = new Set(events.map((event) => event.id));
  const pool = curated.filter((item) => visible.has(item.event.id));
  renderBeatRow(pool);

  const items = (state.beat ? pool.filter((item) => item.beats.includes(state.beat)) : pool).sort((a, b) =>
    state.hsort === "date"
      ? String(a.event.date_start || "").localeCompare(String(b.event.date_start || "")) || b.score - a.score
      : b.score - a.score || String(a.event.date_start || "").localeCompare(String(b.event.date_start || ""))
  );

  const beat = H.beatById(state.beat);
  els.highlightMeta.textContent = beat
    ? `${items.length} highlight${items.length === 1 ? "" : "s"} in “${beat.label}” — ${beat.blurb}`
    : `${items.length} curated highlight${items.length === 1 ? "" : "s"} out of ${allEvents.length} events`;

  els.highlightList.replaceChildren();
  if (!items.length) {
    const empty = el("div", "empty");
    empty.append(
      el("p", "empty-title", "No highlights in this slice."),
      el("p", "empty-hint", "Highlights are a curated subset, so narrow filters can empty it. Clear a filter or pick another beat.")
    );
    els.highlightList.appendChild(empty);
    return;
  }

  const tokens = searchTokens();
  const frag = document.createDocumentFragment();
  for (const item of items) frag.appendChild(highlightCard(item, tokens));
  els.highlightList.appendChild(frag);
}

/* Scrolls the timeline to one event, expanding and flashing it. */
function focusEvent(id) {
  if (state.mode !== "timeline") setMode("timeline");
  let card = document.getElementById(`event-${id}`);
  if (!card && !state.past) {
    // It may be folded into the past; unfold and try again.
    state.past = true;
    update();
    card = document.getElementById(`event-${id}`);
  }
  if (!card) return false;
  const toggle = card.querySelector(".event-toggle");
  if (toggle && toggle.getAttribute("aria-expanded") !== "true") toggle.click();
  card.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  card.classList.add("is-target");
  setTimeout(() => card.classList.remove("is-target"), 2400);
  return true;
}

function setMode(mode) {
  state.mode = mode === "highlights" ? "highlights" : "timeline";
  syncControls();
  update();
}

function update() {
  const events = filterEvents();
  const showHighlights = state.mode === "highlights";

  document.body.dataset.mode = state.mode;
  els.highlights.hidden = !showHighlights;
  els.stats.hidden = showHighlights;
  els.timeline.hidden = showHighlights;
  els.resultMeta.hidden = showHighlights;

  if (showHighlights) {
    renderHighlights(events);
    els.yearRail.hidden = true;
  } else {
    renderTimeline(events);
    renderStatusChips();
    renderDecadeBars();
  }
  renderQuickChips();
  renderActiveFilters();
  writeStateToUrl();

  const years = events.map(yearOf).filter((y) => y !== "Unknown");
  const span = years.length ? ` · ${Math.min(...years)}–${Math.max(...years)}` : "";
  els.resultMeta.textContent = `Showing ${events.length} of ${allEvents.length} events${span}`;
}

/* -------------------------------------------------------------- controls */

function fillSelect(select, values, kind) {
  for (const value of values) {
    const option = el("option", null, labelFor(kind, value));
    option.value = value;
    select.appendChild(option);
  }
}

function buildFilterOptions() {
  const statuses = [...new Set(allEvents.map((e) => e.status).filter(Boolean))].sort(
    (a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b)
  );
  const countries = [...new Set(allEvents.flatMap((e) => e.countries || []))].sort((a, b) =>
    (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b)
  );
  const categories = [...new Set(allEvents.map((e) => e.category).filter(Boolean))].sort((a, b) =>
    (CATEGORY_LABELS[a] || a).localeCompare(CATEGORY_LABELS[b] || b)
  );
  const programs = [...new Set(allEvents.map((e) => e.program).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const confidences = [...new Set(allEvents.map((e) => e.confidence).filter(Boolean))].sort();

  fillSelect(document.getElementById("filter-status"), ["open", ...statuses], "status");
  fillSelect(document.getElementById("filter-country"), countries, "country");
  fillSelect(document.getElementById("filter-category"), categories, "category");
  fillSelect(document.getElementById("filter-program"), programs, "program");
  fillSelect(document.getElementById("filter-confidence"), confidences, "confidence");

  // Drop URL values that no longer exist in the data.
  const known = {
    status: ["open", ...statuses],
    country: countries,
    category: categories,
    program: programs,
    confidence: confidences,
    decade: [...new Set(allEvents.map(decadeOf))],
  };
  for (const [key, values] of Object.entries(known)) {
    if (state[key] && !values.includes(state[key])) state[key] = "";
  }
}

function syncControls() {
  els.search.value = state.q;
  for (const select of els.filters.querySelectorAll("select[data-filter]")) {
    select.value = state[select.dataset.filter] || "";
  }
  for (const button of document.querySelectorAll(".view-btn")) {
    button.setAttribute("aria-pressed", String(button.dataset.view === state.view));
  }
  for (const button of document.querySelectorAll(".mode-btn")) {
    button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode));
  }
  els.highlightSort.value = state.hsort;
}

function resetFilters() {
  for (const key of Object.keys(FILTER_LABELS)) state[key] = "";
  syncControls();
  update();
  els.search.focus();
}

function setHeaderOffset() {
  const height = els.toolbar.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--toolbar-h", `${Math.round(height)}px`);
}

function scrollToTimeline() {
  els.toolbar.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
}

function wireEvents() {
  els.filters.addEventListener("submit", (event) => event.preventDefault());

  let searchTimer = 0;
  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = els.search.value.trim();
      update();
    }, 120);
  });

  for (const select of els.filters.querySelectorAll("select[data-filter]")) {
    select.addEventListener("change", () => {
      state[select.dataset.filter] = select.value;
      update();
    });
  }

  for (const button of document.querySelectorAll(".view-btn")) {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      openOverrides.clear();
      syncControls();
      update();
    });
  }

  for (const button of document.querySelectorAll(".mode-btn")) {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  }

  els.highlightSort.addEventListener("change", () => {
    state.hsort = els.highlightSort.value;
    update();
  });

  for (const box of [els.draftDate, els.draftHashtag]) {
    box.addEventListener("change", update);
  }

  els.reset.addEventListener("click", resetFilters);

  els.thisMonth.addEventListener("click", () => {
    state.mode = "timeline";
    state.month = monthKey(TODAY);
    state.status = "";
    syncControls();
    update();
    scrollToTimeline();
  });
  els.upcoming.addEventListener("click", () => {
    state.mode = "timeline";
    state.status = "open";
    state.month = "";
    syncControls();
    update();
    scrollToTimeline();
  });

  els.yearRail.addEventListener("click", (event) => {
    const link = event.target.closest("a.year-pill");
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (els.dialog.open) return;
    event.preventDefault();
    els.search.focus();
    els.search.select();
  });

  // Click on the dialog backdrop closes it; closing drops the ?event= deep link.
  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) els.dialog.close();
  });
  els.dialog.addEventListener("close", () => {
    state.event = "";
    writeStateToUrl();
  });

  const wide = matchMedia("(min-width: 820px)");
  const syncDrawer = () => {
    els.filterDrawer.open = wide.matches;
  };
  syncDrawer();
  wide.addEventListener("change", syncDrawer);

  if ("ResizeObserver" in window) {
    new ResizeObserver(setHeaderOffset).observe(els.toolbar);
  } else {
    addEventListener("resize", setHeaderOffset);
  }
  setHeaderOffset();

  // Re-lay the overview when the viewport class changes (year width depends on it).
  let resizeTimer = 0;
  let lastBucket = innerWidth < 600 ? 0 : innerWidth < 1000 ? 1 : 2;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const bucket = innerWidth < 600 ? 0 : innerWidth < 1000 ? 1 : 2;
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        renderOverview();
      }
    }, 200);
  });
}

/* ------------------------------------------------------------------ boot */

async function boot() {
  initTheme();
  const [events] = await Promise.all([loadEvents(), loadImages()]);
  allEvents = events;
  curated = H.curate(allEvents);
  curatedById = new Map(curated.map((item) => [item.event.id, item]));

  for (const event of allEvents) {
    Object.defineProperty(event, "__haystack", {
      value: [
        event.title,
        event.summary,
        event.program,
        event.notes,
        labelFor("status", event.status),
        labelFor("category", event.category),
        ...(event.actors || []),
        ...(event.countries || []).flatMap((c) => [c, COUNTRY_NAMES[c] || ""]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      enumerable: false,
    });
  }

  actorsById = await loadActors();

  const deepLinkId = readStateFromUrl();
  buildFilterOptions();
  syncControls();
  wireEvents();
  renderHeadlineStats();
  renderNowNext();
  renderOverview();
  renderRace();
  renderSlips();
  update();
  if (deepLinkId) {
    const event = allEvents.find((e) => e.id === deepLinkId);
    if (event) {
      focusEvent(deepLinkId);
      openDialog(event);
    }
  }
}

boot().catch((err) => {
  els.resultMeta.textContent = String(err.message || err);
  els.resultMeta.classList.add("error");
  console.error(err);
});
