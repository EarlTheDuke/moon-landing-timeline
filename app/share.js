/**
 * Moon Landing Timeline — single-event share card.
 * Deep-linkable with ?event=<id> (or #<id>): renders one event on a photo card,
 * offers the same ≤280 character draft the Highlights mode makes, and can
 * export the card as a PNG drawn on a <canvas> (no server, no libraries).
 */

const {
  el,
  formatDate,
  labelFor,
  loadEvents,
  loadImages,
  copyText,
  imageFor,
  imageCredit,
  shareUrlFor,
  initTheme,
  PRECISION_LABELS,
  COUNTRY_NAMES,
  STATUS_LABELS,
  HANDLE,
} = window.MLT;
const H = window.MLT_HIGHLIGHTS;

const RATIOS = ["16x9", "1x1", "free"];
const CANVAS_SIZES = { "16x9": [1200, 675], "1x1": [1080, 1080], free: [1200, 675] };

const els = {
  picker: document.getElementById("event-picker"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  frame: document.getElementById("share-frame"),
  card: document.getElementById("share-card"),
  draft: document.getElementById("draft"),
  charCount: document.getElementById("char-count"),
  copy: document.getElementById("copy"),
  copyLink: document.getElementById("copy-link"),
  download: document.getElementById("download"),
  downloadHint: document.getElementById("download-hint"),
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

function eyebrowFor(event) {
  const beat = beatById.get(event.id);
  return [event.program, beat ? beat.label : labelFor("category", event.category)].filter(Boolean).join(" · ");
}

function whenFor(event) {
  const precision = PRECISION_LABELS[event.date_precision];
  return [H.whenPhrase(event), precision && `≈ ${precision}`].filter(Boolean).join("  ·  ");
}

function renderCard() {
  els.card.replaceChildren();
  if (!current) return;

  const src = imageFor(current, "lg");
  els.card.style.setProperty("--photo", src ? `url("${src}")` : "none");
  els.card.classList.toggle("has-photo", Boolean(src));

  const credit = imageCredit(current);
  if (credit && credit.credit) {
    const generic = !(current.image && current.image.file);
    els.card.appendChild(el("span", "share-credit", `${generic ? "Program image · " : ""}${credit.credit}`));
  }

  els.card.appendChild(el("p", "share-eyebrow", eyebrowFor(current)));
  els.card.appendChild(el("h2", "share-title", current.title || current.id));
  els.card.appendChild(el("p", "share-when", whenFor(current)));

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

/* ------------------------------------------------------- canvas export */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image failed: ${src}`));
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && lines.join(" ").length < words.join(" ").length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.includes(" ")) last = last.replace(/\s+\S*$/, "");
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const STATUS_COLORS = {
  completed: "#4ade80",
  in_progress: "#a78bfa",
  scheduled: "#22d3ee",
  planned: "#60a5fa",
  slipped: "#fbbf24",
  conceptual: "#c4b5fd",
  cancelled: "#f87171",
};

async function drawCard(event, ratio) {
  const [W, Hh] = CANVAS_SIZES[ratio] || CANVAS_SIZES["16x9"];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = Hh;
  const ctx = canvas.getContext("2d");
  const FONT = '"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif';

  ctx.fillStyle = "#080d1c";
  ctx.fillRect(0, 0, W, Hh);

  const src = imageFor(event, "lg");
  if (src) {
    try {
      const img = await loadImage(src);
      const scale = Math.max(W / img.width, Hh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (W - dw) / 2, (Hh - dh) * 0.4, dw, dh);
    } catch (err) {
      console.warn(err);
    }
  }

  const grad = ctx.createLinearGradient(0, 0, 0, Hh);
  grad.addColorStop(0, "rgba(6,10,24,0.15)");
  grad.addColorStop(0.45, "rgba(6,10,24,0.55)");
  grad.addColorStop(1, "rgba(6,10,24,0.96)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, Hh);
  const side = ctx.createLinearGradient(0, 0, W * 0.7, 0);
  side.addColorStop(0, "rgba(6,10,24,0.55)");
  side.addColorStop(1, "rgba(6,10,24,0)");
  ctx.fillStyle = side;
  ctx.fillRect(0, 0, W, Hh);

  const pad = Math.round(W * 0.06);
  const maxW = W - pad * 2;
  const square = ratio === "1x1";
  ctx.textBaseline = "top";

  // Measure the text block first so it can be anchored just above the status pill.
  const eyebrowSize = Math.round(W * 0.019);
  const titleSize = Math.round(W * (square ? 0.056 : 0.05));
  const whenSize = Math.round(W * 0.024);
  const blurbSize = Math.round(W * 0.021);
  const footSize = Math.round(W * 0.017);
  const ph = W * 0.032;

  ctx.font = `800 ${titleSize}px ${FONT}`;
  const titleLines = wrapText(ctx, event.title || event.id, maxW, 3);
  ctx.font = `400 ${blurbSize}px ${FONT}`;
  const blurb = H.firstSentence(event.summary);
  const blurbLines = blurb ? wrapText(ctx, blurb, maxW, square ? 4 : 3) : [];

  const blockH =
    W * 0.036 + // eyebrow
    titleLines.length * titleSize * 1.14 +
    W * 0.012 +
    W * 0.042 + // when line
    blurbLines.length * blurbSize * 1.4;
  const pillTop = Hh - pad - footSize - W * 0.03 - ph;
  let y = Math.max(pad, pillTop - W * 0.03 - blockH);

  ctx.fillStyle = "#9dbcff";
  ctx.font = `700 ${eyebrowSize}px ${FONT}`;
  ctx.fillText(eyebrowFor(event).toUpperCase(), pad, y);
  y += W * 0.036;

  ctx.font = `800 ${titleSize}px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  for (const line of titleLines) {
    ctx.fillText(line, pad, y);
    y += titleSize * 1.14;
  }
  y += W * 0.012;

  ctx.font = `600 ${whenSize}px ${FONT}`;
  ctx.fillStyle = "#dbe3ff";
  ctx.fillText(whenFor(event), pad, y);
  y += W * 0.042;

  ctx.font = `400 ${blurbSize}px ${FONT}`;
  ctx.fillStyle = "#c9d2ee";
  for (const line of blurbLines) {
    ctx.fillText(line, pad, y);
    y += blurbSize * 1.4;
  }

  // Status pill.
  const pillFont = `700 ${Math.round(W * 0.016)}px ${FONT}`;
  ctx.font = pillFont;
  const label = (STATUS_LABELS[event.status] || event.status || "").toUpperCase();
  const pw = ctx.measureText(label).width + W * 0.028;
  const py = pillTop;
  roundRect(ctx, pad, py, pw, ph, ph / 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.strokeStyle = STATUS_COLORS[event.status] || "#9dbcff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = STATUS_COLORS[event.status] || "#9dbcff";
  ctx.fillText(label, pad + W * 0.014, py + ph * 0.28);

  // Footer line.
  ctx.font = `400 ${footSize}px ${FONT}`;
  ctx.fillStyle = "#aab5d6";
  const who = (event.actors || []).slice(0, 3).join(" · ");
  ctx.fillText(who.slice(0, 80), pad, Hh - pad - footSize);
  ctx.font = `700 ${footSize}px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillStyle = "#e8ecf7";
  ctx.fillText(`Moon Landing Timeline · ${HANDLE}`, W - pad, Hh - pad - footSize);
  ctx.textAlign = "left";

  const credit = imageCredit(event);
  if (credit && credit.credit) {
    ctx.font = `400 ${Math.round(W * 0.012)}px ${FONT}`;
    ctx.fillStyle = "rgba(220,228,250,0.75)";
    ctx.textAlign = "right";
    ctx.fillText(`Image: ${credit.credit}`.slice(0, 90), W - pad, W * 0.02);
    ctx.textAlign = "left";
  }
  return canvas;
}

async function downloadPng() {
  if (!current) return;
  const ratio = els.frame.dataset.ratio === "1x1" ? "1x1" : "16x9";
  els.download.disabled = true;
  els.download.textContent = "Rendering…";
  try {
    const canvas = await drawCard(current, ratio);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moon-timeline-${current.id}-${ratio}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    els.live.textContent = "PNG downloaded.";
  } catch (err) {
    console.error(err);
    els.live.textContent = "Could not render the PNG in this browser; screenshot the card instead.";
  } finally {
    els.download.disabled = false;
    els.download.textContent = "Download PNG";
  }
}

/* ---------------------------------------------------------------- wiring */

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
  const [w, h] = CANVAS_SIZES[els.frame.dataset.ratio === "1x1" ? "1x1" : "16x9"];
  els.downloadHint.textContent = `${w} × ${h} px, image included`;
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

function flash(button, ok, label) {
  button.textContent = ok ? "Copied ✓" : "Copy failed";
  button.classList.toggle("is-copied", ok);
  setTimeout(() => {
    button.textContent = label;
    button.classList.remove("is-copied");
  }, 1800);
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
    flash(els.copy, ok, "Copy draft");
    els.live.textContent = ok ? "Draft copied to clipboard." : "Copy failed — select the text and copy manually.";
  });
  els.copyLink.addEventListener("click", async () => {
    if (!current) return;
    const ok = await copyText(shareUrlFor(current));
    flash(els.copyLink, ok, "Copy card link");
    els.live.textContent = ok ? "Card link copied." : "Copy failed.";
  });
  els.download.addEventListener("click", downloadPng);
  for (const button of document.querySelectorAll(".view-btn")) {
    button.addEventListener("click", () => setRatio(button.dataset.ratio));
  }
  addEventListener("hashchange", () => {
    const id = requestedId();
    if (id) select(id);
  });
}

async function boot() {
  initTheme();
  const params = new URLSearchParams(location.search);
  const wanted = requestedId();

  const [loaded] = await Promise.all([loadEvents(), loadImages()]);
  events = loaded;
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

window.MLT_SHARE = { drawCard, select: (id) => select(id) };

boot().catch((err) => {
  els.card.replaceChildren(el("p", "share-title", "Could not load events"), el("p", "share-blurb", String(err.message || err)));
  console.error(err);
});
