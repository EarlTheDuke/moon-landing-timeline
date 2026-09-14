/**
 * Moon Landing Timeline — shared vocabulary and formatting helpers.
 * Loaded as a plain script before app.js / highlights.js / share.js and
 * published on window.MLT so every page renders the data identically.
 */

window.MLT = (function () {
  const EVENTS_URL = "../data/events/events.json";
  const ACTORS_URL = "../data/actors/actors.json";
  const IMAGES_URL = "../data/images/images.json";
  const IMG_BASE = "./assets/img/";

  /** Public site root, used for share links and social previews. */
  const SITE_URL = "https://earltheduke.github.io/moon-landing-timeline/app/";
  const REPO_URL = "https://github.com/EarlTheDuke/moon-landing-timeline";
  const HANDLE = "@TheLimitingFctr";
  const HANDLE_URL = "https://x.com/TheLimitingFctr";

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

  /** Plain-language glossary shown near the top of the page. */
  const STATUS_GLOSSARY = {
    completed: "It happened.",
    in_progress: "Under way now.",
    scheduled: "Firm launch window.",
    planned: "Published target — still can slip.",
    slipped: "Missed or officially moved a date.",
    conceptual: "Stated intent, no flight assigned.",
    cancelled: "Stopped. Kept for the record.",
  };

  /** Statuses that count as still open / upcoming. */
  const OPEN_STATUSES = ["in_progress", "scheduled", "planned", "slipped", "conceptual"];

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
    CH: "Switzerland",
    CN: "China",
    DE: "Germany",
    DK: "Denmark",
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
    NL: "Netherlands",
    PE: "Peru",
    PK: "Pakistan",
    PL: "Poland",
    RU: "Russia",
    SI: "Slovenia",
    TH: "Thailand",
    TR: "Türkiye",
    US: "United States",
    ZA: "South Africa",
  };

  /** Regional-indicator flag for an ISO code (text contexts only; Windows lacks emoji flags). */
  function flagFor(code) {
    const value = String(code || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(value)) return "";
    return String.fromCodePoint(...[...value].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
  }

  /** Bundled SVG flag as an <img>, which renders identically on every OS. */
  function flagNode(code, className = "flag") {
    const value = String(code || "").toLowerCase();
    const img = document.createElement("img");
    img.className = className;
    img.src = `./assets/flags/${value}.svg`;
    img.alt = COUNTRY_NAMES[value.toUpperCase()] || value.toUpperCase();
    img.title = img.alt;
    img.width = 20;
    img.height = 15;
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  /**
   * One accent colour per program family so a scroll shows *who* at a glance.
   * Unlisted programs fall back to the neutral card border.
   */
  const PROGRAM_COLORS = {
    Artemis: "#ff9f6b",
    HLS: "#ffb27a",
    "Moon Base": "#ffc98a",
    Ignition: "#ffc98a",
    Gateway: "#ffd3a6",
    CLPS: "#6fd7ff",
    Starship: "#8fb8ff",
    "Fission Surface Power": "#ffe36b",
    "National Space Policy": "#d9c4ff",
    CLEP: "#ff6b7d",
    "China Crewed Lunar": "#ff7f92",
    ILRS: "#ff8fa3",
    Luna: "#c9b7ff",
    Moonlight: "#7fe0c0",
    Argonaut: "#8be8c8",
    "ESA Exploration": "#9defd0",
    MAGPIE: "#9defd0",
    Chandrayaan: "#ffb35c",
    LUPEX: "#ffc46f",
    SLIM: "#f4a7c7",
    Danuri: "#9fd0ff",
    ispace: "#f0b3ff",
    "Hakuto-R": "#f0b3ff",
    "Emirates Lunar Mission": "#c0f0a0",
    LASSO: "#b0c4de",
    "Space debris": "#b0b8c8",
  };

  function programColor(program) {
    return PROGRAM_COLORS[program] || "";
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function labelFor(kind, value) {
    if (!value) return "";
    if (kind === "status") return value === "open" ? "Upcoming (all open)" : STATUS_LABELS[value] || value;
    if (kind === "category") return CATEGORY_LABELS[value] || value;
    if (kind === "confidence") return CONFIDENCE_LABELS[value] || value;
    if (kind === "country") return COUNTRY_NAMES[value] ? `${COUNTRY_NAMES[value]} (${value})` : value;
    if (kind === "decade") return `${value}s`;
    if (kind === "month") return formatMonth(value);
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

  function formatMonth(value) {
    const [y, m] = String(value || "").split("-");
    if (!m) return y || "";
    return `${MONTHS_LONG[Number(m) - 1]} ${y}`;
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

  /* --------------------------------------------------------- date maths */

  /**
   * Fractional-year position for a date fragment. Year-only dates sit at
   * mid-year, month-only dates at mid-month, so imprecise targets never look
   * like a specific day on a graphical axis.
   */
  function fractionalYear(value) {
    const match = String(value || "").match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = match[2] ? Number(match[2]) : null;
    const day = match[3] ? Number(match[3]) : null;
    if (month == null) return year + 0.5;
    if (day == null) return year + (month - 0.5) / 12;
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return year + (month - 1 + (day - 0.5) / days) / 12;
  }

  function todayFractionalYear(now = new Date()) {
    const start = Date.UTC(now.getFullYear(), 0, 1);
    const end = Date.UTC(now.getFullYear() + 1, 0, 1);
    return now.getFullYear() + (now.getTime() - start) / (end - start);
  }

  /** ISO-ish month key for "this month" filters: "2026-09". */
  function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  /**
   * Human phrase for how far off an open event is, honest about precision:
   *   day   → "in 12 days" / "3 days ago"
   *   month → "in ~2 months"
   *   year  → "2027 target"
   *   range → "2026–2027 window"
   */
  function relativePhrase(event, now = new Date()) {
    const start = String(event.date_start || "");
    if (!start) return "Date TBD";
    const precision = event.date_precision || (start.length === 10 ? "day" : start.length === 7 ? "month" : "year");
    const [y, m, d] = start.split("-").map(Number);
    if (precision === "range") {
      const endYear = String(event.date_end || "").slice(0, 4);
      return endYear && endYear !== String(y) ? `${y}–${endYear} window` : `${y} window`;
    }
    if (precision === "year" || !m) {
      const gap = y - now.getFullYear();
      if (gap < 0) return `${y}`;
      if (gap === 0) return "later this year";
      if (gap === 1) return "next year";
      return `in ${gap} years`;
    }
    if (precision === "month" || !d) {
      const months = (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth());
      if (months <= 0) return `${MONTHS[m - 1]} ${y}`;
      if (months === 1) return "next month";
      return `in ~${months} months`;
    }
    const target = new Date(y, m - 1, d);
    const days = Math.round((target - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (days === 0) return "today";
    if (days < 0) return days === -1 ? "yesterday" : `${-days} days ago`;
    if (days === 1) return "tomorrow";
    if (days < 45) return `in ${days} days`;
    if (days < 365) return `in ~${Math.round(days / 30)} months`;
    return `in ~${(days / 365).toFixed(1)} years`;
  }

  function isOpen(event) {
    return OPEN_STATUSES.includes(event.status);
  }

  /* ------------------------------------------------------------- images */

  /**
   * Resolves the picture for an event: its own `image`, else a program-level
   * fallback, else the default Moon. Returns null only when nothing exists.
   * `size` is "sm" (≈520 px, card thumbnails) or "lg" (≈1280 px).
   */
  function imageFor(event, size = "sm", programImages = null) {
    const own = event && event.image && event.image.file;
    if (own) return imageUrl(`events/${own}`, size);
    const registry = programImages || window.MLT_IMAGES || null;
    if (registry) {
      const rec = registry[`program:${event.program}`];
      if (rec && rec.file) return imageUrl(`programs/${rec.file}`, size);
      const fallback = registry["category:default"];
      if (fallback && fallback.file) return imageUrl(`programs/${fallback.file}`, size);
    }
    return null;
  }

  function imageUrl(relative, size) {
    // Deduplicated records may point across folders ("../events/x.jpg").
    let path = relative.replace(/^(events|programs)\/\.\.\//, "");
    if (size === "sm") path = path.replace(/\.jpg$/i, "-sm.jpg");
    return IMG_BASE + path;
  }

  function imageCredit(event, programImages = null) {
    if (event && event.image) return event.image;
    const registry = programImages || window.MLT_IMAGES || null;
    if (!registry) return null;
    return registry[`program:${event.program}`] || registry["category:default"] || null;
  }

  /* ------------------------------------------------------------ loading */

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

  /** Program-level fallback pictures + credits; optional. */
  async function loadImages() {
    try {
      const images = await fetchJson(IMAGES_URL);
      window.MLT_IMAGES = images;
      return images;
    } catch (err) {
      console.warn("Image registry unavailable; cards without their own picture stay text-only.", err);
      window.MLT_IMAGES = {};
      return {};
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

  /** Absolute, shareable URL for one event (pre-rendered stub with its own preview card). */
  function shareUrlFor(event) {
    return `${SITE_URL}e/${encodeURIComponent(event.id)}.html`;
  }

  /* -------------------------------------------------------------- theme */

  const THEME_KEY = "mlt-theme";

  function applyTheme(theme) {
    const value = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = value === "light" ? "#f3f5fb" : "#080d1c";
    for (const button of document.querySelectorAll("[data-theme-toggle]")) {
      button.setAttribute("aria-pressed", String(value === "light"));
      button.title = value === "light" ? "Switch to dark mode" : "Switch to light mode";
    }
    return value;
  }

  function initTheme() {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch (err) {
      /* private mode */
    }
    const theme = applyTheme(stored || "dark");
    for (const button of document.querySelectorAll("[data-theme-toggle]")) {
      button.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
        applyTheme(next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (err) {
          /* ignore */
        }
      });
    }
    return theme;
  }

  return {
    EVENTS_URL,
    ACTORS_URL,
    IMAGES_URL,
    SITE_URL,
    REPO_URL,
    HANDLE,
    HANDLE_URL,
    STATUS_ORDER,
    STATUS_LABELS,
    STATUS_GLOSSARY,
    OPEN_STATUSES,
    CATEGORY_LABELS,
    CONFIDENCE_LABELS,
    PRECISION_LABELS,
    COUNTRY_NAMES,
    PROGRAM_COLORS,
    MONTHS,
    MONTHS_LONG,
    flagFor,
    flagNode,
    programColor,
    labelFor,
    el,
    yearOf,
    decadeOf,
    formatMonth,
    formatDatePart,
    formatDate,
    fractionalYear,
    todayFractionalYear,
    monthKey,
    relativePhrase,
    isOpen,
    imageFor,
    imageCredit,
    fetchJson,
    loadEvents,
    loadActors,
    loadImages,
    copyText,
    shareUrlFor,
    applyTheme,
    initTheme,
  };
})();
