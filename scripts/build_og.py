#!/usr/bin/env python3
"""
Build social preview images.

  app/assets/og.png                 1200×630 site card (X / OpenGraph)
  app/assets/share/<event-id>.jpg   1200×630 per-event cards (with --events)
  app/e/<event-id>.html             per-event stub pages carrying those cards as
                                    og:image, then redirecting into the app (with --pages)

Text is drawn from data/events/events.json, so re-run after data changes:

  python scripts/build_og.py                    # site card only
  python scripts/build_og.py --events --pages   # plus one card + one stub page per event
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
IMAGES = ROOT / "data" / "images" / "images.json"
IMG = ROOT / "app" / "assets" / "img"
OUT = ROOT / "app" / "assets" / "og.png"
SHARE_DIR = ROOT / "app" / "assets" / "share"
PAGES_DIR = ROOT / "app" / "e"
W, H = 1200, 630
HANDLE = "@TheLimitingFctr"
SITE_URL = "https://earltheduke.github.io/moon-landing-timeline/app/"

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


def load_registry() -> dict:
    try:
        return json.loads(IMAGES.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def event_image(ev: dict, registry: dict) -> Path:
    """Same resolution order as app/data.js imageFor(): own → program → default → hero."""
    rel = (ev.get("image") or {}).get("file")
    if rel:
        p = (IMG / "events" / rel).resolve()
        if p.exists():
            return p
    for key in (f"program:{ev.get('program')}", "category:default"):
        rec = registry.get(key) or {}
        if rec.get("file"):
            p = (IMG / "programs" / rec["file"]).resolve()
            if p.exists():
                return p
    return IMG / "hero.jpg"


def event_credit(ev: dict, registry: dict) -> str:
    if ev.get("image"):
        return ev["image"].get("credit", "")
    for key in (f"program:{ev.get('program')}", "category:default"):
        rec = registry.get(key) or {}
        if rec.get("file"):
            return rec.get("credit", "")
    return ""


def event_card(ev: dict, registry: dict) -> Path:
    card, draw = base_card(Image.open(event_image(ev, registry)))
    credit = " ".join(event_credit(ev, registry).split())
    if credit:
        cf = font(16)
        text = f"Image: {credit}"[:90]
        draw.text((W - 40 - draw.textlength(text, font=cf), 22), text, font=cf, fill=(200, 210, 240, 200))
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
    out = SHARE_DIR / f"{ev['id']}.jpg"
    card.convert("RGB").save(out, "JPEG", quality=80, optimize=True, progressive=True)
    return out


def esc(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


STUB = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — Moon Landing Timeline</title>
  <meta name="description" content="{description}" />
  <link rel="canonical" href="{app_url}" />
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Moon Landing Timeline" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:url" content="{page_url}" />
  <meta property="og:image" content="{image_url}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{alt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@TheLimitingFctr" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{image_url}" />
  <meta http-equiv="refresh" content="0; url={redirect}" />
  <style>
    body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; background: #080d1c; color: #e8ecf7; font: 16px/1.5 system-ui, sans-serif; text-align: center; padding: 1rem; }}
    a {{ color: #9dbcff; }}
    img {{ max-width: min(90vw, 600px); border-radius: 12px; display: block; margin: 0 auto 1rem; }}
  </style>
</head>
<body>
  <div>
    <img src="../assets/share/{id}.jpg" alt="{alt}" width="600" height="315" />
    <p>Opening <a href="{redirect}">{title}</a> in the Moon Landing Timeline…</p>
  </div>
  <script>location.replace({redirect_js});</script>
</body>
</html>
"""


def stub_page(ev: dict) -> Path:
    status = STATUS.get(ev.get("status"), "")
    when = format_date(ev)
    title = ev.get("title", ev["id"])
    lead = " · ".join(x for x in [status, when] if x)
    description = f"{lead}. {first_sentence(ev.get('summary', ''))}".strip()[:300]
    redirect = f"../?event={ev['id']}"
    html = STUB.format(
        id=ev["id"],
        title=esc(title),
        description=esc(description),
        alt=esc(f"{title} — {lead}"),
        app_url=esc(f"{SITE_URL}?event={ev['id']}"),
        page_url=esc(f"{SITE_URL}e/{ev['id']}.html"),
        image_url=esc(f"{SITE_URL}assets/share/{ev['id']}.jpg"),
        redirect=esc(redirect),
        redirect_js=json.dumps(redirect),
    )
    PAGES_DIR.mkdir(parents=True, exist_ok=True)
    out = PAGES_DIR / f"{ev['id']}.html"
    out.write_text(html, encoding="utf-8", newline="\n")
    return out


def prune(folder: Path, keep: set[str], suffix: str) -> int:
    removed = 0
    if not folder.exists():
        return 0
    for p in folder.glob(f"*{suffix}"):
        if p.stem not in keep:
            p.unlink()
            removed += 1
    return removed


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--events", action="store_true", help="also build one JPEG card per event")
    parser.add_argument("--pages", action="store_true", help="also write app/e/<id>.html stub pages")
    args = parser.parse_args()
    events = json.loads(EVENTS.read_text(encoding="utf-8"))
    ids = {ev["id"] for ev in events}
    site_card(events)
    if args.events:
        registry = load_registry()
        total = 0
        for ev in events:
            total += event_card(ev, registry).stat().st_size
        removed = prune(SHARE_DIR, ids, ".jpg")
        print(f"wrote {len(events)} event cards to {SHARE_DIR.relative_to(ROOT)} ({total / 1e6:.1f} MB, pruned {removed})")
    if args.pages:
        for ev in events:
            stub_page(ev)
        removed = prune(PAGES_DIR, ids, ".html")
        print(f"wrote {len(events)} stub pages to {PAGES_DIR.relative_to(ROOT)} (pruned {removed})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
