/**
 * Moon Landing Timeline — single-event share card.
 * Deep-linkable with ?event=<id> (or #<id>): renders one event large enough to
 * screenshot and offers the same ≤280 character draft the Highlights mode makes.
 */

const { el, formatDate, labelFor, loadEvents, copyText, PRECISION_LABELS, COUNTRY_NAMES } = window.MLT;
const H = window.MLT_HIGHLIGHTS;

const HANDLE = "@TheLimitingFctr";
const RATIOS = ["16x9", "1x1", "free"];

const els = {
  picker: document.getElementById("event-picker"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  frame: document.getElementById("share-frame"),
  card: document.getElementById("share-card"),
  draft: document.getElementById("draft"),
  charCount: document.getElementById("char-count"),
  copy: document.getElementById("copy"),
  resetDraft: document.getElementById("reset-draft"),
  timelineLink: document.getElementById("timeline-link"),
  sources: document.getElementById("share-sources"),
  hashtag: document.getElementById("draft-hashtag"),
  live: document.getElementById("copy-live"),
};

let events = [];
let beatById = new Map();
let current = null;

function requestedId() {
  const params = new URLSearchParams(location.search);
  return params.get("event") || decodeURIComponent(location.hash.replace(/^#/, ""));
}

function writeUrl() {
  const params = new URLSearchParams();
  if (current) params.set("event", current.id);
  if (els.frame.dataset.ratio !== "16x9") params.set("ratio", els.frame.dataset.ratio);
  if (els.hashtag.checked) params.set("tag", "1");
  history.replaceState(null, "", `?${params.toString()}`);
}

function generatedDraft() {
  return current ? H.buildDraft(current, { date: true, hashtag: els.hashtag.checked }) : "";
}

function updateCharCount() {
  const used = H.countChars(els.draft.value);
  els.charCount.textContent = `${used}/${H.DRAFT_LIMIT}`;
  els.charCount.classList.toggle("is-tight", used > H.DRAFT_LIMIT - 20 && used <= H.DRAFT_LIMIT);
  els.charCount.classList.toggle("is-over", used > H.DRAFT_LIMIT);
}

function renderCard() {
  els.card.replaceChildren();
  if (!current) return;

  const beat = beatById.get(current.id);
  const eyebrow = [current.program, beat ? beat.label : labelFor("category", current.category)]
    .filter(Boolean)
    .join(" · ");
  els.card.appendChild(el("p", "share-eyebrow", eyebrow));
  els.card.appendChild(el("h2", "share-title", current.title || current.id));

  const precision = PRECISION_LABELS[current.date_precision];
  const when = [H.whenPhrase(current), precision && `≈ ${precision}`].filter(Boolean).join("  ·  ");
  els.card.appendChild(el("p", "share-when", when));

  const blurb = H.firstSentence(current.summary);
  if (blurb) els.card.appendChild(el("p", "share-blurb", blurb));

  const badges = el("ul", "badges");
  if (current.status) {
    badges.appendChild(el("li", `badge status-${current.status}`, labelFor("status", current.status)));
  }
  if (current.category) {
    badges.appendChild(el("li", "badge badge-category", labelFor("category", current.category)));
  }
  if (current.confidence) {
    badges.appendChild(
      el("li", `badge confidence-${current.confidence}`, labelFor("confidence", current.confidence))
    );
  }
  els.card.appendChild(badges);

  const foot = el("div", "share-foot");
  const who = (current.actors || []).slice(0, 4).join(" · ");
  const where = (current.countries || []).map((code) => COUNTRY_NAMES[code] || code).join(", ");
  foot.appendChild(el("span", null, [who, where].filter(Boolean).join(" — ")));
  const brand = el("span");
  brand.append(document.createTextNode("Moon Landing Timeline · "), el("strong", null, HANDLE));
  foot.appendChild(brand);
  els.card.appendChild(foot);
}

function renderSources() {
  els.sources.replaceChildren();
  const sources = (current && current.sources) || [];
  if (!sources.length) return;

  els.sources.appendChild(el("span", null, `Sources (${sources.length}) — verify before posting:`));
  const list = el("ul");
  for (const source of sources) {
    const item = el("li");
    const link = el("a", "source-link", source.title || source.url);
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.appendChild(link);
    const meta = [source.publisher, source.accessed && `accessed ${source.accessed}`].filter(Boolean);
    if (meta.length) item.appendChild(el("span", "source-meta", ` — ${meta.join(" · ")}`));
    list.appendChild(item);
  }
  els.sources.appendChild(list);
}

function select(id, { syncPicker = true } = {}) {
  const found = events.find((event) => event.id === id);
  current = found || events[0] || null;
  if (!current) return;
  if (syncPicker) els.picker.value = current.id;
  els.timelineLink.href = `./?event=${encodeURIComponent(current.id)}`;
  els.draft.value = generatedDraft();
  updateCharCount();
  renderCard();
  renderSources();
  writeUrl();
}

function step(delta) {
  const index = events.findIndex((event) => event.id === (current && current.id));
  const nextIndex = (index + delta + events.length) % events.length;
  select(events[nextIndex].id);
}

function setRatio(ratio) {
  els.frame.dataset.ratio = RATIOS.includes(ratio) ? ratio : "16x9";
  for (const button of document.querySelectorAll(".view-btn")) {
    button.setAttribute("aria-pressed", String(button.dataset.ratio === els.frame.dataset.ratio));
  }
  writeUrl();
}

function fillPicker() {
  for (const event of events) {
    const starred = beatById.has(event.id) ? "★ " : "";
    const option = el("option", null, `${starred}${formatDate(event)} — ${event.title || event.id}`);
    option.value = event.id;
    els.picker.appendChild(option);
  }
}

function wire() {
  els.picker.addEventListener("change", () => select(els.picker.value, { syncPicker: false }));
  els.prev.addEventListener("click", () => step(-1));
  els.next.addEventListener("click", () => step(1));
  els.draft.addEventListener("input", updateCharCount);
  els.resetDraft.addEventListener("click", () => {
    els.draft.value = generatedDraft();
    updateCharCount();
    els.draft.focus();
  });
  els.hashtag.addEventListener("change", () => {
    els.draft.value = generatedDraft();
    updateCharCount();
    writeUrl();
  });
  els.copy.addEventListener("click", async () => {
    const ok = await copyText(els.draft.value);
    els.copy.textContent = ok ? "Copied ✓" : "Copy failed";
    els.copy.classList.toggle("is-copied", ok);
    els.live.textContent = ok ? "Draft copied to clipboard." : "Copy failed — select the text and copy manually.";
    setTimeout(() => {
      els.copy.textContent = "Copy draft";
      els.copy.classList.remove("is-copied");
    }, 1800);
  });
  for (const button of document.querySelectorAll(".view-btn")) {
    button.addEventListener("click", () => setRatio(button.dataset.ratio));
  }
  addEventListener("hashchange", () => {
    const id = requestedId();
    if (id) select(id);
  });
}

async function boot() {
  const params = new URLSearchParams(location.search);
  const wanted = requestedId();

  events = await loadEvents();
  events.sort((a, b) => String(a.date_start || "").localeCompare(String(b.date_start || "")));
  beatById = new Map(H.curate(events).map((item) => [item.event.id, H.beatById(item.beat)]));

  fillPicker();
  wire();
  if (params.get("tag")) els.hashtag.checked = true;
  setRatio(params.get("ratio") || "16x9");
  // Fall back to the punchiest curated event when no id was requested.
  const fallback = H.curate(events).sort((a, b) => b.score - a.score)[0];
  select(wanted || (fallback && fallback.event.id));
}

boot().catch((err) => {
  els.card.replaceChildren(el("p", "share-title", "Could not load events"), el("p", "share-blurb", String(err.message || err)));
  console.error(err);
});
