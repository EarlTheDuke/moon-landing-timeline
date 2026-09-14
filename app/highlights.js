/**
 * Moon Landing Timeline — Highlights: curation + X/Twitter draft blurbs.
 *
 * Everything here is derived from fields that already exist in events.json
 * (title, summary, date_start, status, category, program, sources). No mission
 * facts are added: blurbs are the event's own first sentence, and the "why"
 * tags are labels for rules that matched the recorded data.
 */

window.MLT_HIGHLIGHTS = (function (MLT) {
  const DRAFT_LIMIT = 280;

  /**
   * Story beats a post can hang on, in priority order: the first beat an event
   * matches becomes its primary beat, which is also the pool it competes in.
   * `boost` only reorders events inside a beat, so the most on-theme ones lead.
   */
  const BEATS = [
    {
      id: "crewed",
      label: "Crew on the Moon",
      blurb: "Crewed landings, lunar flybys, and the landers and suits that carry people.",
      test: (event, text) =>
        event.category === "crewed_landing" ||
        event.category === "crewed_orbit" ||
        (event.category !== "policy" && /\bcrewed\b/i.test(text.title)),
      boost: (event) => (event.category === "crewed_landing" ? 1 : 0),
    },
    {
      id: "firsts",
      label: "Firsts & debuts",
      blurb: "Events the data itself calls a first, a debut or a sample return.",
      test: (event, text) => /\bfirst(-ever)?\b|\bdebut\b|\bmaiden\b|sample return/i.test(text.all),
      boost: (event, text) => (/\bfirst(-ever)?\b/i.test(text.title) ? 1.5 : 0),
    },
    {
      id: "power",
      label: "Power & infrastructure gates",
      blurb: "Reactors, relays, navigation and habitats — the gates a base has to pass.",
      test: (event, text) =>
        event.category === "infrastructure" ||
        /reactor|fission|nuclear|surface power|relay|communications|navigation|habitat|isru|propellant|refuel/i.test(
          text.all
        ),
      boost: (event, text) => (/reactor|fission|nuclear|surface power/i.test(text.all) ? 2 : 0),
    },
    {
      id: "policy",
      label: "Policy, money & contracts",
      blurb: "Awards, budgets, executive orders, agreements and program shake-ups.",
      test: (event, text) =>
        event.category === "policy" ||
        /\baward(s|ed|ing)?\b|\bcontract(s)?\b|\bbudget\b|executive order|memorandum|\bmou\b|\brfp\b|acquisition|ministerial/i.test(
          text.all
        ),
      boost: (event) => (event.category === "policy" ? 1.5 : 0),
    },
    {
      id: "next",
      label: "Next up (24 months)",
      blurb: "Still-open events whose recorded target date falls inside two years.",
      test: (event) => isNearTerm(event, 24),
      boost: (event) => (event.status === "slipped" ? 0.5 : 0),
    },
  ];

  /**
   * Ranking rules. Each matched rule contributes a weight and a short "why"
   * tag; the tag names the rule, it never asserts anything new about the event.
   */
  const RULES = [
    { id: "crewed-landing", label: "Crewed landing", weight: 5, test: (e) => e.category === "crewed_landing" },
    { id: "crewed-orbit", label: "Crew in lunar space", weight: 4, test: (e) => e.category === "crewed_orbit" },
    { id: "first", label: "Called a first", weight: 3, test: (e, t) => /\bfirst(-ever)?\b/i.test(t.all) },
    {
      id: "nuclear",
      label: "Nuclear surface power",
      weight: 2.5,
      test: (e, t) => /reactor|fission|nuclear/i.test(t.all),
    },
    { id: "sample-return", label: "Sample return", weight: 2, test: (e, t) => /sample return/i.test(t.all) },
    {
      id: "shakeup",
      label: "Program shake-up",
      weight: 2,
      test: (e, t) =>
        e.status === "cancelled" || /cancel|paused|terminat|restructur|reorgani[sz]|repurpos/i.test(t.all),
    },
    {
      id: "money",
      label: "Money attached",
      weight: 1.5,
      test: (e, t) => /\$\s?\d|\b\d+(\.\d+)?\s?(million|billion)\b/i.test(t.all),
    },
    { id: "slip", label: "Date moved", weight: 1.5, test: (e) => e.status === "slipped" },
    { id: "south-pole", label: "South pole", weight: 1, test: (e, t) => /south pole/i.test(t.all) },
    { id: "landing", label: "Lunar landing", weight: 1, test: (e) => e.category === "uncrewed_lander" },
    { id: "done", label: "Already happened", weight: 1, test: (e) => e.status === "completed" },
    { id: "live", label: "Under way now", weight: 0.8, test: (e) => e.status === "in_progress" },
    { id: "near", label: "Near term", weight: 1.5, test: (e) => isNearTerm(e, 24) },
    { id: "soonish", label: "Within five years", weight: 0.6, test: (e) => isNearTerm(e, 60) },
    {
      id: "multinational",
      label: "Multinational",
      weight: 0.6,
      test: (e) => (e.countries || []).length > 1,
    },
  ];

  /** Sentence-ending dots we must not split on ("U.S. plans…", "No. 2", "$1.5B"). */
  const ABBREVIATIONS = new Set([
    "u.s",
    "u.k",
    "e.g",
    "i.e",
    "no",
    "vs",
    "approx",
    "est",
    "dr",
    "mt",
    "st",
    "fig",
    "cf",
    "inc",
    "ltd",
    "co",
  ]);

  function textOf(event) {
    const title = String(event.title || "");
    const summary = String(event.summary || "");
    return { title, summary, all: `${title} ${summary} ${event.program || ""}` };
  }

  function startYearMonth(event) {
    const match = String(event.date_start || "").match(/^(\d{4})(?:-(\d{2}))?/);
    if (!match) return null;
    return { year: Number(match[1]), month: match[2] ? Number(match[2]) : null };
  }

  /** True when a still-open event's recorded target falls inside the next N months. */
  function isNearTerm(event, months) {
    if (event.status === "completed" || event.status === "cancelled") return false;
    const start = startYearMonth(event);
    if (!start) return false;
    const now = new Date();
    const nowIndex = now.getFullYear() * 12 + now.getMonth() + 1;
    // Year-only targets could land anywhere in their year, so allow the whole year.
    const earliest = start.year * 12 + (start.month || 1);
    const latest = start.year * 12 + (start.month || 12);
    return latest >= nowIndex && earliest <= nowIndex + months;
  }

  function score(event) {
    const text = textOf(event);
    let total = 0;
    const why = [];
    for (const rule of RULES) {
      if (!rule.test(event, text)) continue;
      total += rule.weight;
      why.push({ id: rule.id, label: rule.label });
    }
    // Better-cited events are safer to post, with a small cap so they can't dominate.
    total += Math.min(1.2, (event.sources || []).length * 0.4);
    if (event.confidence === "confirmed") total += 0.8;
    if (event.confidence === "rumored") total -= 1;
    return { total: Math.round(total * 100) / 100, why };
  }

  function beatsFor(event) {
    const text = textOf(event);
    return BEATS.filter((beat) => beat.test(event, text)).map((beat) => beat.id);
  }

  /**
   * Ranks every event, then keeps the strongest few in each beat so all story
   * angles stay populated instead of one category swamping the list. Events with
   * no beat at all are left out — that is what makes this a curated subset.
   */
  function curate(events, { perBeat = 7 } = {}) {
    const scored = events.map((event) => {
      const { total, why } = score(event);
      const beats = beatsFor(event);
      return { event, score: total, why, beats, beat: beats[0] || null };
    });

    const keep = new Map();
    for (const beat of BEATS) {
      scored
        .filter((item) => item.beat === beat.id)
        .map((item) => ({ item, rank: item.score + (beat.boost ? beat.boost(item.event, textOf(item.event)) : 0) }))
        .sort(
          (a, b) =>
            b.rank - a.rank ||
            String(a.item.event.date_start).localeCompare(String(b.item.event.date_start))
        )
        .slice(0, perBeat)
        .forEach(({ item }) => keep.set(item.event.id, item));
    }
    return [...keep.values()];
  }

  function beatById(id) {
    return BEATS.find((beat) => beat.id === id) || null;
  }

  function countChars(text) {
    return [...String(text)].length;
  }

  /** First sentence of a summary, extended when the opener is very short. */
  function firstSentence(summary) {
    const text = String(summary || "").trim();
    if (!text) return "";
    const boundary = /([.!?])(\s+)(?=[A-Z0-9"“(])/g;
    let match;
    while ((match = boundary.exec(text))) {
      const end = match.index + 1;
      const word = text.slice(0, match.index).split(/[\s(]/).pop().toLowerCase();
      if (ABBREVIATIONS.has(word)) continue;
      if (/^[a-z]$/i.test(word)) continue; // initial such as "J. Smith"
      if (end < 60) continue; // too short to stand alone; roll into the next sentence
      return text.slice(0, end).trim();
    }
    return text;
  }

  /** Neutral date phrase: completed events get the date, open ones keep their status. */
  function whenPhrase(event) {
    const date = MLT.formatDate(event);
    if (!event.date_start) return "";
    if (event.status === "completed") return date;
    const label = MLT.STATUS_LABELS[event.status] || event.status || "";
    return label ? `${label} · ${date}` : date;
  }

  function hashtagFor(event) {
    const program = String(event.program || "").replace(/[^A-Za-z0-9]/g, "");
    return program ? `#${program}` : "";
  }

  function truncateTo(text, limit) {
    const chars = [...text];
    if (chars.length <= limit) return text;
    if (limit <= 1) return "";
    const cut = chars.slice(0, limit - 1).join("");
    const spaced = cut.replace(/\s+\S*$/, "");
    return `${(spaced.length > limit * 0.5 ? spaced : cut).replace(/[\s,;:–-]+$/, "")}…`;
  }

  /**
   * Builds a ≤280 character draft post: headline (title + optional date/status),
   * a blank line, then the event's own first sentence and an optional program tag.
   */
  function buildDraft(event, { date = true, hashtag = false, limit = DRAFT_LIMIT } = {}) {
    const title = String(event.title || event.id || "").trim();
    const when = date ? whenPhrase(event) : "";
    const headline = when ? `${title} — ${when}` : title;
    const tag = hashtag ? hashtagFor(event) : "";
    const tail = tag ? ` ${tag}` : "";

    const head = truncateTo(headline, limit);
    let budget = limit - countChars(head) - 2 - countChars(tail);
    const sentence = firstSentence(event.summary);
    if (!sentence || budget < 40) return tail ? truncateTo(`${head}${tail}`, limit) : head;
    return `${head}\n\n${truncateTo(sentence, budget)}${tail}`;
  }

  return {
    DRAFT_LIMIT,
    BEATS,
    RULES,
    beatById,
    beatsFor,
    score,
    curate,
    isNearTerm,
    firstSentence,
    whenPhrase,
    hashtagFor,
    buildDraft,
    countChars,
    truncateTo,
  };
})(window.MLT);
