/**
 * Moon Landing Timeline — "big picture" overview.
 *
 * A horizontally scrolling map of the whole decade: a year axis, a Today line,
 * one dot per event grouped into lanes (crew, China & Russia, policy, power,
 * US landers, rest of world), and a filmstrip of picture cards for the
 * highest-scoring milestones. Everything is clickable and hands the event to
 * the host page (which opens the detail dialog).
 *
 * Positions come straight from date_start: year-only targets sit at mid-year,
 * month-only at mid-month, so imprecise dates never pretend to be exact.
 */

window.MLT_OVERVIEW = (function (MLT, H) {
  const { el, flagNode, fractionalYear, todayFractionalYear, formatDate, yearOf, imageFor, isOpen } = MLT;

  const LANES = [
    { id: "crew", label: "Crew", icon: "🧑‍🚀", test: (e) => e.category === "crewed_landing" || e.category === "crewed_orbit" },
    {
      id: "cnru",
      label: "China & Russia",
      flags: ["CN", "RU"],
      test: (e) => (e.countries || []).some((c) => c === "CN" || c === "RU"),
    },
    { id: "policy", label: "Policy & money", icon: "📜", test: (e) => e.category === "policy" || e.category === "other" },
    { id: "infra", label: "Power & infrastructure", icon: "⚡", test: (e) => e.category === "infrastructure" },
    { id: "us", label: "US landers & rovers", flags: ["US"], test: (e) => (e.countries || []).includes("US") },
    { id: "world", label: "Europe · Japan · India · Korea…", flags: ["EU", "JP", "IN", "KR"], test: () => true },
  ];

  const CARD_GAP = 14;
  const ROW_H = 16.4; // rem, matches .ov-card layout
  const EDGE_PAD = 64; // gutter for "earlier" / "later" pins

  function laneFor(event) {
    return LANES.find((lane) => lane.test(event)) || LANES[LANES.length - 1];
  }

  function yearRange(events) {
    const years = events.map((e) => Number(yearOf(e))).filter((y) => !Number.isNaN(y));
    const today = new Date().getFullYear();
    // Start two years back so recent history has room; run to the last busy year.
    const start = Math.max(Math.min(...years), today - 2);
    const counts = new Map();
    for (const y of years) counts.set(y, (counts.get(y) || 0) + 1);
    let end = today + 6;
    for (const [y, n] of counts) if (n >= 2 && y > end && y <= today + 12) end = y;
    return { start, end: end + 1 }; // end is exclusive
  }

  function yearWidth() {
    const w = innerWidth || 1024;
    return w < 600 ? 190 : w < 1000 ? 230 : 270;
  }

  function render(container, events, { curated = [], onSelect = () => {}, onYear = null } = {}) {
    container.replaceChildren();
    if (!events.length) return null;

    const range = yearRange(events);
    const YEAR_W = yearWidth();
    const narrow = (innerWidth || 1024) < 600;
    const CARD_W = narrow ? 176 : 214;
    const CARD_ROWS = narrow ? 1 : 2;
    const TODAY_ANCHOR = narrow ? 0.18 : 0.32;
    const spanYears = range.end - range.start;
    const width = EDGE_PAD * 2 + spanYears * YEAR_W;
    const xFor = (fy) => {
      if (fy == null) return null;
      const clamped = Math.min(Math.max(fy, range.start - 0.35), range.end + 0.35);
      return EDGE_PAD + (clamped - range.start) * YEAR_W;
    };

    const scroll = el("div", "ov-scroll");
    scroll.tabIndex = 0;
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-label", "Graphical overview of the timeline. Scroll sideways; activate any card or dot for details.");
    const canvas = el("div", "ov-canvas");
    canvas.style.width = `${width}px`;
    scroll.appendChild(canvas);

    /* ---- filmstrip of milestone cards -------------------------------- */
    const cards = el("div", "ov-cards");
    cards.style.setProperty("--card-w", `${CARD_W}px`);
    cards.style.height = `${CARD_ROWS * ROW_H + 0.5}rem`;
    canvas.appendChild(cards);

    // Strongest stories claim space first; each row keeps its occupied spans so a
    // card anywhere on the axis can still fit into any remaining gap.
    const byScore = [...curated].sort((a, b) => b.score - a.score);
    const occupied = Array.from({ length: CARD_ROWS }, () => []);
    const placed = [];
    for (const item of byScore) {
      const fy = fractionalYear(item.event.date_start);
      const x = xFor(fy);
      if (x == null) continue;
      const left = Math.max(4, Math.min(width - CARD_W - 4, x - CARD_W / 2));
      const right = left + CARD_W;
      const row = occupied.findIndex((spans) => spans.every(([a, b]) => right + CARD_GAP <= a || left >= b + CARD_GAP));
      if (row < 0) continue;
      occupied[row].push([left, right]);
      placed.push({ item, x, left, row });
    }
    // Keep at most this many so the strip reads as highlights, not a wall.
    placed.sort((a, b) => a.left - b.left);
    const featured = new Set();
    for (const { item, x, left, row } of placed) {
      const event = item.event;
      featured.add(event.id);
      const card = el("button", `ov-card status-${event.status}`);
      card.type = "button";
      card.style.left = `${left}px`;
      card.style.top = `${row * ROW_H}rem`;
      card.style.setProperty("--tail-x", `${x - left}px`);
      card.style.setProperty("--tail-h", `${(CARD_ROWS - 1 - row) * ROW_H + 0.9}rem`);
      card.dataset.id = event.id;
      card.setAttribute("aria-label", `${event.title}. ${formatDate(event)}. Open details.`);

      const pic = el("span", "ov-card-pic");
      const src = imageFor(event, "sm");
      if (src) {
        const img = el("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        pic.appendChild(img);
      }
      pic.appendChild(el("span", `ov-card-status status-${event.status}`, MLT.STATUS_LABELS[event.status] || event.status));
      card.appendChild(pic);

      const body = el("span", "ov-card-body");
      body.appendChild(
        el("span", "ov-card-when", isOpen(event) ? `${formatDate(event)} · ${MLT.relativePhrase(event)}` : formatDate(event))
      );
      body.appendChild(el("span", "ov-card-title", event.title));
      body.appendChild(el("span", "ov-card-blurb", H.firstSentence(event.summary)));
      card.appendChild(body);
      card.appendChild(el("span", "ov-card-tail"));

      card.addEventListener("click", () => onSelect(event, card));
      card.addEventListener("mouseenter", () => highlight(event.id, true));
      card.addEventListener("mouseleave", () => highlight(event.id, false));
      card.addEventListener("focus", () => highlight(event.id, true));
      card.addEventListener("blur", () => highlight(event.id, false));
      cards.appendChild(card);
    }

    /* ---- axis --------------------------------------------------------- */
    const axis = el("div", "ov-axis");
    for (let y = range.start; y < range.end; y += 1) {
      const tick = el(onYear ? "button" : "span", "ov-year");
      if (onYear) {
        tick.type = "button";
        tick.title = `Jump to ${y} in the list`;
        tick.addEventListener("click", () => onYear(String(y)));
      }
      tick.style.left = `${xFor(y)}px`;
      tick.style.width = `${YEAR_W}px`;
      tick.appendChild(el("span", "ov-year-label", String(y)));
      const count = events.filter((e) => Number(yearOf(e)) === y).length;
      if (count) tick.appendChild(el("span", "ov-year-count", `${count}`));
      axis.appendChild(tick);
    }
    const earlier = events.filter((e) => Number(yearOf(e)) < range.start).length;
    const later = events.filter((e) => Number(yearOf(e)) >= range.end).length;
    if (earlier) {
      const pin = el("span", "ov-pin ov-pin-left", `◂ ${earlier} earlier`);
      pin.style.left = "6px";
      axis.appendChild(pin);
    }
    if (later) {
      const pin = el("span", "ov-pin ov-pin-right", `${later} later ▸`);
      pin.style.left = `${width - 6}px`;
      axis.appendChild(pin);
    }
    canvas.appendChild(axis);

    /* ---- lanes + dots ------------------------------------------------- */
    const lanes = el("div", "ov-lanes");
    const dots = new Map();
    for (const lane of LANES) {
      const row = el("div", `ov-lane ov-lane-${lane.id}`);
      const label = el("span", "ov-lane-label");
      const icon = el("span", "ov-lane-icon");
      if (lane.flags) for (const code of lane.flags) icon.appendChild(flagNode(code, "flag flag-sm"));
      else icon.textContent = lane.icon;
      label.append(icon, el("span", "ov-lane-text", lane.label));
      row.appendChild(label);

      const members = events
        .filter((e) => laneFor(e).id === lane.id)
        .map((e) => ({ event: e, x: xFor(fractionalYear(e.date_start)) }))
        .filter((m) => m.x != null)
        .sort((a, b) => a.x - b.x);

      // Spread dots that would land on top of one another.
      let lastX = -Infinity;
      let stack = 0;
      for (const member of members) {
        if (member.x - lastX < 11) stack = (stack + 1) % 3;
        else stack = 0;
        lastX = member.x;
        const { event } = member;
        const dot = el("button", `ov-dot status-${event.status}${featured.has(event.id) ? " is-featured" : ""}`);
        dot.type = "button";
        dot.style.left = `${member.x}px`;
        dot.style.setProperty("--stack", String(stack));
        dot.dataset.id = event.id;
        dot.setAttribute("aria-label", `${event.title}, ${formatDate(event)}. Open details.`);
        if (H.score(event).total >= 6) dot.classList.add("is-big");
        dot.addEventListener("click", () => onSelect(event, dot));
        dot.addEventListener("mouseenter", () => showTip(event, member.x, row));
        dot.addEventListener("focus", () => showTip(event, member.x, row));
        dot.addEventListener("mouseleave", hideTip);
        dot.addEventListener("blur", hideTip);
        row.appendChild(dot);
        dots.set(event.id, dot);
      }
      lanes.appendChild(row);
    }
    canvas.appendChild(lanes);

    /* ---- today -------------------------------------------------------- */
    const todayFy = todayFractionalYear();
    const todayX = xFor(todayFy);
    if (todayFy >= range.start && todayFy < range.end) {
      const today = el("div", "ov-today");
      today.style.left = `${todayX}px`;
      today.appendChild(el("span", "ov-today-label", "Today"));
      canvas.appendChild(today);
    }

    /* ---- tooltip ------------------------------------------------------ */
    const tip = el("div", "ov-tip");
    tip.hidden = true;
    tip.setAttribute("role", "status");
    canvas.appendChild(tip);

    function showTip(event, x, row) {
      tip.replaceChildren(
        el("strong", null, event.title),
        el("span", null, `${isOpen(event) ? `${MLT.STATUS_LABELS[event.status]} · ` : ""}${formatDate(event)}`)
      );
      tip.hidden = false;
      const rowTop = row.offsetTop + lanes.offsetTop;
      tip.style.left = `${Math.min(Math.max(x, 120), width - 120)}px`;
      tip.style.top = `${rowTop}px`;
    }
    function hideTip() {
      tip.hidden = true;
    }

    function highlight(id, on) {
      const dot = dots.get(id);
      if (dot) dot.classList.toggle("is-hot", on);
    }

    /* ---- controls ----------------------------------------------------- */
    const controls = el("div", "ov-controls");
    const mk = (label, title, fn) => {
      const b = el("button", "ov-btn", label);
      b.type = "button";
      b.title = title;
      b.addEventListener("click", fn);
      return b;
    };
    const scrollBy = (dx) => scroll.scrollBy({ left: dx, behavior: reduceMotion() ? "auto" : "smooth" });
    controls.append(
      mk("‹", "Earlier", () => scrollBy(-YEAR_W)),
      mk("Today", "Scroll to today", () => centerOn(todayX)),
      mk("›", "Later", () => scrollBy(YEAR_W))
    );

    function centerOn(x) {
      if (x == null) return;
      scroll.scrollTo({ left: Math.max(0, x - scroll.clientWidth * TODAY_ANCHOR), behavior: reduceMotion() ? "auto" : "smooth" });
    }

    /* ---- drag to scroll ----------------------------------------------- */
    let drag = null;
    scroll.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      drag = { x: e.clientX, left: scroll.scrollLeft, moved: false };
      scroll.classList.add("is-grabbing");
    });
    scroll.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      scroll.scrollLeft = drag.left - dx;
    });
    const endDrag = () => {
      if (drag && drag.moved) {
        // Swallow the click that ends a drag so cards don't open by accident.
        scroll.addEventListener("click", (e) => e.stopPropagation(), { capture: true, once: true });
      }
      drag = null;
      scroll.classList.remove("is-grabbing");
    };
    scroll.addEventListener("pointerup", endDrag);
    scroll.addEventListener("pointerleave", endDrag);
    scroll.addEventListener("pointercancel", endDrag);

    // Shift-less horizontal wheel: convert vertical wheel over the strip to sideways scroll.
    scroll.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad already horizontal
        if (scroll.scrollWidth <= scroll.clientWidth) return;
        const atStart = scroll.scrollLeft <= 0 && e.deltaY < 0;
        const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 1 && e.deltaY > 0;
        if (atStart || atEnd) return; // let the page take over at the edges
        e.preventDefault();
        scroll.scrollLeft += e.deltaY;
      },
      { passive: false }
    );

    container.append(controls, scroll);
    // Land on "now" once laid out.
    requestAnimationFrame(() => {
      scroll.scrollLeft = Math.max(0, (todayX ?? 0) - scroll.clientWidth * TODAY_ANCHOR);
    });

    return {
      highlight,
      centerOn,
      focusEvent(id) {
        const dot = dots.get(id);
        if (!dot) return;
        centerOn(parseFloat(dot.style.left));
        dot.classList.add("is-hot");
        setTimeout(() => dot.classList.remove("is-hot"), 1800);
      },
    };
  }

  function reduceMotion() {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return { LANES, laneFor, render };
})(window.MLT, window.MLT_HIGHLIGHTS);
