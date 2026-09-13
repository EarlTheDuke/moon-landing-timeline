const statusOrder = [
  "completed",
  "in_progress",
  "scheduled",
  "planned",
  "slipped",
  "conceptual",
  "cancelled",
];

const els = {
  list: document.getElementById("list"),
  meta: document.getElementById("meta"),
  search: document.getElementById("search"),
  status: document.getElementById("status"),
  country: document.getElementById("country"),
};

let allEvents = [];

function fmtDate(e) {
  const start = e.date_start || "?";
  const end = e.date_end ? ` → ${e.date_end}` : "";
  const precision = e.date_precision ? ` · ${e.date_precision}` : "";
  return `${start}${end}${precision}`;
}

function badge(text, extraClass = "") {
  const span = document.createElement("span");
  span.className = `badge ${extraClass}`.trim();
  span.textContent = text;
  return span;
}

function yearKey(e) {
  const s = String(e.date_start || "");
  const m = s.match(/^(\d{4})/);
  return m ? m[1] : "Unknown";
}

function groupByYear(events) {
  const groups = new Map();
  for (const e of events) {
    const y = yearKey(e);
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y).push(e);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function renderEvent(e) {
  const card = document.createElement("article");
  card.className = `event status-${e.status || "planned"}`;

  const date = document.createElement("div");
  date.className = "date";
  date.textContent = fmtDate(e);

  const titleRow = document.createElement("div");
  titleRow.className = "title-row";
  const h2 = document.createElement("h2");
  h2.textContent = e.title || e.id;
  titleRow.appendChild(h2);

  const badges = document.createElement("div");
  badges.className = "badges";
  if (e.status) badges.appendChild(badge(e.status, `status-${e.status}`));
  if (e.category) badges.appendChild(badge(e.category));
  if (e.program) badges.appendChild(badge(e.program));
  if (e.confidence) badges.appendChild(badge(e.confidence, `confidence-${e.confidence}`));
  titleRow.appendChild(badges);

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = e.summary || "";

  const actors = document.createElement("div");
  actors.className = "actors";
  const countries = (e.countries || []).join(", ");
  const names = (e.actors || []).join(", ");
  actors.textContent = [countries && `Countries: ${countries}`, names && `Actors: ${names}`]
    .filter(Boolean)
    .join(" · ");

  card.append(date, titleRow, summary, actors);

  if (e.notes && String(e.notes).trim()) {
    const notes = document.createElement("div");
    notes.className = "notes";
    notes.textContent = e.notes;
    card.appendChild(notes);
  }

  return card;
}

function render(events) {
  els.list.innerHTML = "";
  els.meta.textContent = `Showing ${events.length} of ${allEvents.length} events`;
  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No events match those filters.";
    els.list.appendChild(empty);
    return;
  }

  for (const [year, items] of groupByYear(events)) {
    const group = document.createElement("section");
    group.className = "year-group";
    group.dataset.year = year;

    const header = document.createElement("div");
    header.className = "year-header";
    const h3 = document.createElement("h3");
    h3.textContent = year;
    const count = document.createElement("span");
    count.className = "year-count";
    count.textContent = `${items.length} event${items.length === 1 ? "" : "s"}`;
    header.append(h3, count);
    group.appendChild(header);

    for (const e of items) {
      group.appendChild(renderEvent(e));
    }
    els.list.appendChild(group);
  }
}

function applyFilters() {
  const q = els.search.value.trim().toLowerCase();
  const status = els.status.value;
  const country = els.country.value;
  const filtered = allEvents.filter((e) => {
    if (status && e.status !== status) return false;
    if (country && !(e.countries || []).includes(country)) return false;
    if (!q) return true;
    const hay = [
      e.title,
      e.summary,
      e.program,
      e.category,
      e.notes,
      ...(e.actors || []),
      ...(e.countries || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
  render(filtered);
}

function fillFilters(events) {
  const statuses = [...new Set(events.map((e) => e.status).filter(Boolean))].sort(
    (a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b) || a.localeCompare(b)
  );
  for (const s of statuses) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    els.status.appendChild(opt);
  }
  const countries = [...new Set(events.flatMap((e) => e.countries || []))].sort();
  for (const c of countries) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.country.appendChild(opt);
  }
}

async function boot() {
  const res = await fetch("../data/events/events.json");
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
  allEvents = await res.json();
  allEvents.sort((a, b) => String(a.date_start || "").localeCompare(String(b.date_start || "")));
  fillFilters(allEvents);
  render(allEvents);
  els.search.addEventListener("input", applyFilters);
  els.status.addEventListener("change", applyFilters);
  els.country.addEventListener("change", applyFilters);
}

boot().catch((err) => {
  els.meta.textContent = String(err);
  console.error(err);
});
