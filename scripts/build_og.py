#!/usr/bin/env python3
"""
Build social preview images.

  app/assets/og.png                 1200×630 site card (X / OpenGraph)
  app/assets/share/<event-id>.png   1200×630 per-event cards (with --events)

Text is drawn from data/events/events.json, so re-run after data changes:

  python scripts/build_og.py            # site card only
  python scripts/build_og.py --events   # plus one card per event
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
EVENTS = ROOT / "data" / "events" / "events.json"
IMG = ROOT / "app" / "assets" / "img"
OUT = ROOT / "app" / "assets" / "og.png"
SHARE_DIR = ROOT / "app" / "assets" / "share"
W, H = 1200, 630
HANDLE = "@TheLimitingFctr"

FONT_DIRS = [Path("C:/Windows/Fonts"), Path("/usr/share/fonts"), Path("/System/Library/Fonts")]
BOLD_CANDIDATES = ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "Helvetica.ttc"]
REG_CANDIDATES = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf", "Helvetica.ttc"]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
STATUS = {
    "completed": "Completed",
    "in_progress": "In progress",
    "scheduled": "Scheduled",
    "planned": "Planned",
    "slipped": "Slipped",
    "conceptual": "Conceptual",
    "cancelled": "Cancelled",
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    for d in FONT_DIRS:
        for name in BOLD_CANDIDATES if bold else REG_CANDIDATES:
            p = d / name
            if p.exists():
                try:
                    return ImageFont.truetype(str(p), size)
                except OSError:
                    continue
    return ImageFont.load_default()


def cover(im: Image.Image, w: int, h: int, focus_y: float = 0.5) -> Image.Image:
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    left = (im.width - w) // 2
    top = int((im.height - h) * focus_y)
    return im.crop((left, top, left + w, top + h))


def gradient(w: int, h: int, top_alpha: int, bottom_alpha: int, colour=(6, 10, 24)) -> Image.Image:
    layer = Image.new("RGBA", (w, h), colour + (0,))
    px = layer.load()
    for y in range(h):
        a = int(top_alpha + (bottom_alpha - top_alpha) * (y / max(1, h - 1)))
        for x in range(w):
            px[x, y] = colour + (a,)
    return layer


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int, max_lines: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
        if len(lines) == max_lines:
            break
    if len(lines) < max_lines and cur:
        lines.append(cur)
    if len(lines) == max_lines and (len(" ".join(lines)) < len(text)):
        last = lines[-1]
        while draw.textlength(last + "…", font=fnt) > max_w and " " in last:
            last = last.rsplit(" ", 1)[0]
        lines[-1] = last + "…"
    return lines


def format_date(ev: dict) -> str:
    def part(v: str) -> str:
        bits = str(v).split("-")
        if len(bits) == 3:
            return f"{MONTHS[int(bits[1]) - 1]} {int(bits[2])}, {bits[0]}"
        if len(bits) == 2:
            return f"{MONTHS[int(bits[1]) - 1]} {bits[0]}"
        return bits[0]

    s = part(ev.get("date_start", ""))
    if ev.get("date_end") and ev["date_end"] != ev["date_start"]:
        return f"{s} – {part(ev['date_end'])}"
    return s


def first_sentence(text: str) -> str:
    text = (text or "").strip()
    m = re.search(r"[.!?](\s|$)", text[60:]) if len(text) > 60 else None
    return text[: 60 + m.end()].strip() if m else text


def base_card(bg: Image.Image, focus_y: float = 0.5) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    card = cover(bg.convert("RGB"), W, H, focus_y).convert("RGBA")
    card.alpha_composite(gradient(W, H, 40, 235))
    side = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(side).rectangle([0, 0, 520, H], fill=(6, 10, 24, 120))
    card.alpha_composite(side.filter(ImageFilter.GaussianBlur(90)))
    return card, ImageDraw.Draw(card)


def site_card(events: list[dict]) -> None:
    src = IMG / "og-source.jpg"
    if not src.exists():
        src = IMG / "hero.jpg"
    card, draw = base_card(Image.open(src), focus_y=0.35)

    years = sorted({int(e["date_start"][:4]) for e in events if e.get("date_start")})
    countries = {c for e in events for c in e.get("countries", [])}
    crewed = [
        e
        for e in events
        if e.get("category") == "crewed_landing"
        and e.get("status") not in ("completed", "cancelled", "conceptual")
        and not re.search(r"window|readiness|operational", e.get("title", ""), re.I)
    ]
    crewed.sort(key=lambda e: e["date_start"])
    next_crew = crewed[0]["date_start"][:4] if crewed else "2028"

    draw.text((72, 92), "MOON LANDING TIMELINE", font=font(28, True), fill=(157, 188, 255))
    title_font = font(78, True)
    draw.text((68, 132), "What's happening", font=title_font, fill="white")
    draw.text((68, 218), "on the Moon", font=title_font, fill="white")

    sub = f"{len(events)} sourced events · {len(countries)} countries · {years[0]}–{years[-1]}"
    draw.text((72, 330), sub, font=font(32), fill=(220, 228, 250))
    draw.text((72, 380), f"Humans return in {next_crew}. Every date cited, every slip tracked.", font=font(26), fill=(190, 200, 230))

    pill_font = font(24, True)
    x = 72
    for label in ("Artemis", "China · ILRS", "CLPS", "ESA", "Russia · Luna", "India · Japan · Korea"):
        tw = draw.textlength(label, font=pill_font)
        draw.rounded_rectangle([x, 450, x + tw + 34, 496], radius=23, fill=(26, 36, 64, 220), outline=(80, 100, 160))
        draw.text((x + 17, 459), label, font=pill_font, fill="white")
        x += tw + 48

    draw.text((72, 556), f"{HANDLE}  ·  earltheduke.github.io/moon-landing-timeline", font=font(24), fill=(170, 182, 214))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    card.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)}")


def event_image(ev: dict) -> Path:
    rel = (ev.get("image") or {}).get("file")
    if rel:
        p = IMG / "events" / rel
        if p.exists():
            return p
    return IMG / "hero.jpg"


def event_card(ev: dict) -> None:
    card, draw = base_card(Image.open(event_image(ev)))
    status = STATUS.get(ev.get("status"), "")
    when = format_date(ev)
    eyebrow = " · ".join(x for x in [ev.get("program"), status] if x)
    draw.text((72, 78), eyebrow.upper(), font=font(24, True), fill=(157, 188, 255))

    title_font = font(56, True)
    lines = wrap(draw, ev.get("title", ev["id"]), title_font, W - 150, 3)
    y = 118
    for line in lines:
        draw.text((68, y), line, font=title_font, fill="white")
        y += 66

    draw.text((72, y + 8), when if ev.get("status") == "completed" else f"{status} · {when}", font=font(30), fill=(220, 228, 250))
    y += 60
    blurb_font = font(27)
    for line in wrap(draw, first_sentence(ev.get("summary", "")), blurb_font, W - 150, 3):
        draw.text((72, y), line, font=blurb_font, fill=(205, 214, 240))
        y += 36

    who = " · ".join((ev.get("actors") or [])[:3])
    draw.text((72, 556), f"{who}"[:70], font=font(22), fill=(170, 182, 214))
    brand = f"Moon Landing Timeline · {HANDLE}"
    bw = draw.textlength(brand, font=font(22, True))
    draw.text((W - 72 - bw, 556), brand, font=font(22, True), fill=(200, 210, 240))

    SHARE_DIR.mkdir(parents=True, exist_ok=True)
    card.convert("RGB").save(SHARE_DIR / f"{ev['id']}.png", "PNG", optimize=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--events", action="store_true", help="also build one card per event")
    args = parser.parse_args()
    events = json.loads(EVENTS.read_text(encoding="utf-8"))
    site_card(events)
    if args.events:
        for ev in events:
            event_card(ev)
        print(f"wrote {len(events)} event cards to {SHARE_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
