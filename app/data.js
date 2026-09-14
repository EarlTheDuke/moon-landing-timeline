/**
 * Moon Landing Timeline — shared vocabulary and formatting helpers.
 * Loaded as a plain script before app.js / highlights.js / share.js and
 * published on window.MLT so every page renders the data identically.
 */

window.MLT = (function () {
  const EVENTS_URL = "../data/events/events.json";
  const ACTORS_URL = "../data/actors/actors.json";

  const STATUS_ORDER = [
    "completed",
    "in_progress",
    "scheduled",
    "planned",
    "slipped",
    "conceptual",
    "cancelled",
  ];

  const STATUS_LABELS = {
    completed: "Completed",
    in_progress: "In progress",
    scheduled: "Scheduled",
    planned: "Planned",
    slipped: "Slipped",
    conceptual: "Conceptual",
    cancelled: "Cancelled",
  };

  const CATEGORY_LABELS = {
    crewed_landing: "Crewed landing",
    crewed_orbit: "Crewed orbit",
    uncrewed_lander: "Uncrewed lander",
    rover: "Rover",
    orbiter: "Orbiter",
    infrastructure: "Infrastructure",
    demo: "Demo / tech",
    policy: "Policy / contract",
    other: "Other",
  };

  const CONFIDENCE_LABELS = {
    confirmed: "Confirmed",
    planned: "Planned target",
    rumored: "Rumored",
  };

  const PRECISION_LABELS = {
    day: "",
    month: "month-level date",
    year: "year-level target",
    range: "date range",
  };

  const COUNTRY_NAMES = {
    AE: "United Arab Emirates",
    AU: "Australia",
    BH: "Bahrain",
    CA: "Canada",
    CN: "China",
    DE: "Germany",
    EG: "Egypt",
    EU: "Europe (ESA)",
    FR: "France",
    GB: "United Kingdom",
    IN: "India",
    IR: "Iran",
    IT: "Italy",
    JP: "Japan",
    KR: "South Korea",
    LU: "Luxembourg",
    PE: "Peru",
    PK: "Pakistan",
    RU: "Russia",
    TH: "Thailand",
    TR: "Türkiye",
    US: "United States",
    ZA: "South Africa",
  };

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function labelFor(kind, value) {
    if (!value) return "";
    if (kind === "status") return STATUS_LABELS[value] || value;
    if (kind === "category") return CATEGORY_LABELS[value] || value;
    if (kind === "confidence") return CONFIDENCE_LABELS[value] || value;
    if (kind === "country") return COUNTRY_NAMES[value] ? `${COUNTRY_NAMES[value]} (${value})` : value;
    if (kind === "decade") return `${value}s`;
    return value;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function yearOf(event) {
    const match = String(event.date_start || "").match(/^(\d{4})/);
    return match ? match[1] : "Unknown";
  }

  function decadeOf(event) {
    const year = yearOf(event);
    return year === "Unknown" ? "Unknown" : `${year.slice(0, 3)}0`;
  }

  function formatDatePart(value) {
    if (!value) return "Date TBD";
    const [y, m, d] = String(value).split("-");
    if (d) return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
    if (m) return `${MONTHS[Number(m) - 1]} ${y}`;
    return y;
  }

  function formatDate(event) {
    const start = formatDatePart(event.date_start);
    if (event.date_end && event.date_end !== event.date_start) {
      return `${start} – ${formatDatePart(event.date_end)}`;
    }
    return start;
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url} (HTTP ${res.status}). Serve the repo root, not app/.`);
    return res.json();
  }

  async function loadEvents() {
    return fetchJson(EVENTS_URL);
  }

  /** Actor registry is a nicety (links/tooltips); missing file must not break a page. */
  async function loadActors() {
    try {
      const actors = await fetchJson(ACTORS_URL);
      return new Map(actors.map((actor) => [actor.name, actor]));
    } catch (err) {
      console.warn("Actor registry unavailable; showing plain actor names.", err);
      return new Map();
    }
  }

  /** Copies text, falling back to execCommand where the async clipboard is blocked. */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("Clipboard API refused; falling back to execCommand.", err);
      }
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      console.warn("Copy fallback failed.", err);
    }
    area.remove();
    return ok;
  }

  return {
    EVENTS_URL,
    ACTORS_URL,
    STATUS_ORDER,
    STATUS_LABELS,
    CATEGORY_LABELS,
    CONFIDENCE_LABELS,
    PRECISION_LABELS,
    COUNTRY_NAMES,
    MONTHS,
    labelFor,
    el,
    yearOf,
    decadeOf,
    formatDatePart,
    formatDate,
    fetchJson,
    loadEvents,
    loadActors,
    copyText,
  };
})();
