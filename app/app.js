/**
 * Moon Landing Timeline — static browser UI.
 * Reads ../data/events/events.json (and actors.json when available) and renders
 * a filterable, groupable timeline plus a Highlights mode with post drafts.
 * No build step, no dependencies.
 */

const {
  STATUS_ORDER,
  STATUS_LABELS,
  CATEGORY_LABELS,
  PRECISION_LABELS,
  COUNTRY_NAMES,
  labelFor,
  el,
  yearOf,
  decadeOf,
  formatDate,
  loadEvents,
  loadActors,
  copyText,
} = window.MLT;

const H = window.MLT_HIGHLIGHTS;

const FILTER_LABELS = {
  q: "Search",
  status: "Status",
  country: "Country",
  category: "Type",
  program: "Program",
  confidence: "Confidence",
  decade: "Decade",
};

const els = {
  timeline: document.getElementById("timeline"),
  resultMeta: document.getElementById("result-meta"),
  search: document.getElementById("search"),
  filters: document.getElementById("filters"),
  filterDrawer: document.getElementById("filter-drawer"),
  filterCount: document.getElementById("filter-count"),
  activeFilters: document.getElementById("active-filters"),
  yearRail: document.getElementById("year-rail"),
  statusChips: document.getElementById("status-chips"),
  decadeBars: document.getElementById("decade-bars"),
  headlineStats: document.getElementById("headline-stats"),
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
};

const state = {
  q: "",
  status: "",
  country: "",
  category: "",
  program: "",
  confidence: "",
  decade: "",
  sort: "asc",
  view: "detailed",
  mode: "timeline",
  beat: "",
  hsort: "score",
};

let allEvents = [];
let curated = [];
let actorsById = new Map();
/** Per-card overrides of the global compact/detailed default. */
const openOverrides = new Map();
let yearObserver = null;

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

/* --------------------------------------------------------- filter + sort */

function matchesFilters(event, ignore) {
  if (ignore !== "status" && state.status && event.status !== state.status) return false;
  if (ignore !== "country" && state.country && !(event.countries || []).includes(state.country)) return false;
  if (ignore !== "category" && state.category && event.category !== state.category) return false;
  if (ignore !== "program" && state.program && event.program !== state.program) return false;
  if (ignore !== "confidence" && state.confidence && event.confidence !== state.confidence) return false;
  if (ignore !== "decade" && state.decade && decadeOf(event) !== state.decade) return false;
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

/* ------------------------------------------------------------- URL state */

function readStateFromUrl() {
  const params = new URLSearchParams(location.search);
  for (const key of [...Object.keys(FILTER_LABELS), "sort", "view", "mode", "beat", "hsort"]) {
    const value = params.get(key);
    if (value != null) state[key] = value;
  }
  if (state.sort !== "desc") state.sort = "asc";
  if (state.view !== "compact") state.view = "detailed";
  if (state.mode !== "highlights") state.mode = "timeline";
  if (state.hsort !== "date") state.hsort = "score";
  if (state.beat && !H.beatById(state.beat)) state.beat = "";
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
  const query = params.toString();
  history.replaceState(null, "", `${query ? `?${query}` : location.pathname}${location.hash}`);
}

/* --------------------------------------------------------------- card UI */

function isOpen(event) {
  if (openOverrides.has(event.id)) return openOverrides.get(event.id);
  return state.view === "detailed";
}

function badge(text, className) {
  return el("li", `badge ${className || ""}`.trim(), text);
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

function definitionRow(term, valueNode) {
  const frag = document.createDocumentFragment();
  frag.appendChild(el("dt", null, term));
  const dd = el("dd");
  dd.appendChild(valueNode);
  frag.appendChild(dd);
  return frag;
}

function renderEvent(event, tokens) {
  const card = el("article", `event status-${event.status || "planned"}`);
  card.id = `event-${event.id}`;

  const bodyId = `body-${event.id}`;
  const open = isOpen(event);

  const heading = el("h3", "event-heading");
  const toggle = el("button", "event-toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-controls", bodyId);

  const dateLine = el("span", "event-date");
  dateLine.appendChild(document.createTextNode(formatDate(event)));
  const precision = PRECISION_LABELS[event.date_precision];
  if (precision) dateLine.appendChild(el("span", "precision", `≈ ${precision}`));

  const title = el("span", "event-title");
  title.appendChild(highlighted(event.title || event.id, tokens));

  toggle.append(dateLine, title, el("span", "event-chevron"));
  heading.appendChild(toggle);

  const badges = el("ul", "badges");
  if (event.status) badges.appendChild(badge(labelFor("status", event.status), `status-${event.status}`));
  if (event.category) badges.appendChild(badge(labelFor("category", event.category), "badge-category"));
  if (event.program) badges.appendChild(badge(event.program, "badge-program"));
  if (event.confidence) {
    badges.appendChild(badge(labelFor("confidence", event.confidence), `confidence-${event.confidence}`));
  }

  const body = el("div", "event-body");
  body.id = bodyId;
  if (!open) body.hidden = true;

  if (event.summary) {
    const summary = el("p", "summary");
    summary.appendChild(highlighted(event.summary, tokens));
    body.appendChild(summary);
  }

  const facts = el("dl", "event-facts");
  const countries = event.countries || [];
  if (countries.length) {
    const list = el("ul", "chip-list");
    for (const code of countries) {
      list.appendChild(el("li", "chip", COUNTRY_NAMES[code] || code));
    }
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

  toggle.addEventListener("click", () => {
    const next = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(next));
    body.hidden = !next;
    openOverrides.set(event.id, next);
  });

  card.append(heading, badges, body);
  return card;
}

/* --------------------------------------------------------------- renders */

function renderHeadlineStats() {
  const years = allEvents.map(yearOf).filter((y) => y !== "Unknown");
  const citations = allEvents.reduce((total, e) => total + (e.sources || []).length, 0);
  const countries = new Set(allEvents.flatMap((e) => e.countries || []));
  const programs = new Set(allEvents.map((e) => e.program).filter(Boolean));
  const stats = [
    ["Events", String(allEvents.length)],
    ["Span", years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—"],
    ["Countries", String(countries.size)],
    ["Programs", String(programs.size)],
    ["Citations", String(citations)],
  ];
  els.headlineStats.replaceChildren();
  for (const [term, value] of stats) {
    const item = el("div", "headline-stat");
    item.append(el("dt", null, term), el("dd", null, value));
    els.headlineStats.appendChild(item);
  }
}

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

  const frag = document.createDocumentFragment();
  for (const [year, items] of groups) {
    const section = el("section", "year-group");
    section.id = `year-${year}`;
    section.dataset.year = year;
    section.setAttribute("aria-labelledby", `year-heading-${year}`);

    const header = el("div", "year-header");
    const heading = el("h2", "year-heading", year);
    heading.id = `year-heading-${year}`;
    header.append(
      heading,
      el("span", "year-count", `${items.length} event${items.length === 1 ? "" : "s"}`)
    );
    section.appendChild(header);

    const list = el("div", "year-events");
    for (const event of items) list.appendChild(renderEvent(event, tokens));
    section.appendChild(list);
    frag.appendChild(section);
  }
  els.timeline.appendChild(frag);
  observeYears();
}

/* ------------------------------------------------------------ highlights */

function draftOptions() {
  return { date: els.draftDate.checked, hashtag: els.draftHashtag.checked };
}

function announce(message) {
  els.copyLive.textContent = message;
}

function copyButton(getText, label) {
  const button = el("button", "btn-copy", label);
  button.type = "button";
  let restore = 0;
  button.addEventListener("click", async () => {
    const ok = await copyText(getText());
    button.textContent = ok ? "Copied ✓" : "Copy failed";
    button.classList.toggle("is-copied", ok);
    announce(ok ? "Draft copied to clipboard." : "Copy failed — select the draft text and copy manually.");
    clearTimeout(restore);
    restore = setTimeout(() => {
      button.textContent = label;
      button.classList.remove("is-copied");
    }, 1800);
  });
  return button;
}

function highlightCard(item, tokens) {
  const { event } = item;
  const draft = H.buildDraft(event, draftOptions());
  const used = H.countChars(draft);

  const card = el("article", `highlight status-${event.status || "planned"}`);
  card.id = `highlight-${event.id}`;

  const top = el("div", "highlight-top");
  const beat = H.beatById(item.beat);
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

  const timeline = el("button", "btn-ghost", "In timeline");
  timeline.type = "button";
  timeline.addEventListener("click", () => focusEvent(event.id));
  actions.appendChild(timeline);

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
  const card = document.getElementById(`event-${id}`);
  if (!card) return false;
  const toggle = card.querySelector(".event-toggle");
  if (toggle && toggle.getAttribute("aria-expanded") !== "true") toggle.click();
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
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

  fillSelect(document.getElementById("filter-status"), statuses, "status");
  fillSelect(document.getElementById("filter-country"), countries, "country");
  fillSelect(document.getElementById("filter-category"), categories, "category");
  fillSelect(document.getElementById("filter-program"), programs, "program");
  fillSelect(document.getElementById("filter-confidence"), confidences, "confidence");

  // Drop URL values that no longer exist in the data.
  const known = {
    status: statuses,
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

  els.yearRail.addEventListener("click", (event) => {
    const link = event.target.closest("a.year-pill");
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    event.preventDefault();
    els.search.focus();
    els.search.select();
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
}

/* ------------------------------------------------------------------ boot */

async function boot() {
  allEvents = await loadEvents();
  curated = H.curate(allEvents);

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
  update();
  if (deepLinkId) focusEvent(deepLinkId);
}

boot().catch((err) => {
  els.resultMeta.textContent = String(err.message || err);
  els.resultMeta.classList.add("error");
  console.error(err);
});
