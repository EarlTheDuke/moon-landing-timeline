#!/usr/bin/env python3
"""
Fetch, resize and credit event images for the Moon Landing Timeline.

Reads scripts/image_manifest.json, which maps an event id (or "program:<Name>"
/ "category:<name>" / "hero" / "og") to an ordered list of candidate searches:

    "artemis-ii-2026": ["nasa:Artemis II launch", "wm:Artemis II"]

  nasa:<query>  — NASA Image and Video Library (public domain)
  wm:<query>    — Wikimedia Commons file search (free licences, credited)
  url:<href>    — a direct image URL (credit supplied via "credit:" entry)

The first candidate that yields a downloadable raster image wins. Output:

  app/assets/img/events/<id>.jpg      (max 1280 px wide)
  app/assets/img/events/<id>-sm.jpg   (max 520 px wide, card thumbnails)
  app/assets/img/programs/<slug>.jpg  (+ -sm)  for program:/category: keys
  app/assets/img/hero.jpg             for the "hero" key
  data/images/images.json             credits + provenance for every file

Then it writes an `image` object into each matching event in
data/events/events.json:

  "image": { "file": "artemis-ii-2026.jpg", "alt": "...", "credit": "NASA",
             "license": "Public domain", "source_url": "https://..." }

Usage:
  python scripts/fetch_images.py            # everything missing
  python scripts/fetch_images.py --force    # re-fetch all
  python scripts/fetch_images.py --only artemis-ii-2026,hero
"""

from __future__ import annotations

import argparse
import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts" / "image_manifest.json"
EVENTS = ROOT / "data" / "events" / "events.json"
IMAGES_JSON = ROOT / "data" / "images" / "images.json"
EVENT_DIR = ROOT / "app" / "assets" / "img" / "events"
PROGRAM_DIR = ROOT / "app" / "assets" / "img" / "programs"
HERO = ROOT / "app" / "assets" / "img" / "hero.jpg"

UA = {"User-Agent": "moon-landing-timeline/1.0 (https://github.com/EarlTheDuke/moon-landing-timeline)"}
LARGE_W = 1280
SMALL_W = 520
QUALITY = 80


def http(url: str, timeout: int = 40) -> bytes:
    # NASA asset paths may contain spaces / parentheses; encode but keep the scheme and separators.
    url = urllib.parse.quote(url, safe=":/?&=%~()+,'")
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def get_json(url: str) -> dict:
    return json.loads(http(url).decode("utf-8"))


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def strip_tags(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value or "")).strip()


# ----------------------------------------------------------------- sources


def nasa_asset(nasa_id: str, meta: dict) -> dict | None:
    """Resolve one NASA library id to its best raster + credit."""
    try:
        assets = get_json(f"https://images-api.nasa.gov/asset/{urllib.parse.quote(nasa_id)}")
    except Exception:
        return None
    hrefs = [a.get("href", "") for a in assets.get("collection", {}).get("items", [])]
    pick = None
    for suffix in ("~large.jpg", "~orig.jpg", "~medium.jpg", "~orig.png", "~large.png"):
        pick = next((h for h in hrefs if h.endswith(suffix)), None)
        if pick:
            break
    if not pick:
        return None
    credit = meta.get("secondary_creator") or meta.get("photographer") or meta.get("center") or "NASA"
    if "NASA" not in credit.upper():
        credit = f"NASA / {credit}"
    return {
        "url": pick.replace("http://", "https://"),
        "credit": credit[:120],
        "license": "Public domain (NASA)",
        "source_url": f"https://images.nasa.gov/details/{urllib.parse.quote(nasa_id)}",
        "alt": (meta.get("title") or nasa_id)[:180],
        "provider": "nasa",
    }


def nasa_by_id(nasa_id: str) -> dict | None:
    data = get_json(f"https://images-api.nasa.gov/search?nasa_id={urllib.parse.quote(nasa_id)}")
    for item in data.get("collection", {}).get("items", []):
        meta = (item.get("data") or [{}])[0]
        if meta.get("nasa_id") == nasa_id:
            return nasa_asset(nasa_id, meta)
    return nasa_asset(nasa_id, {"title": nasa_id})


def search_nasa(query: str) -> dict | None:
    q = urllib.parse.quote(query)
    data = get_json(f"https://images-api.nasa.gov/search?q={q}&media_type=image&page_size=8")
    for item in data.get("collection", {}).get("items", []):
        meta = (item.get("data") or [{}])[0]
        nasa_id = meta.get("nasa_id")
        if not nasa_id:
            continue
        hit = nasa_asset(nasa_id, meta)
        if hit:
            return hit
    return None


def list_nasa(query: str, limit: int = 8) -> list[str]:
    q = urllib.parse.quote(query)
    data = get_json(f"https://images-api.nasa.gov/search?q={q}&media_type=image&page_size={limit}")
    out = []
    for item in data.get("collection", {}).get("items", []):
        meta = (item.get("data") or [{}])[0]
        out.append(f"nasaid:{meta.get('nasa_id')}  |  {meta.get('title', '')[:90]}  |  {meta.get('date_created', '')[:10]}")
    return out


def commons_file(title: str) -> dict | None:
    if not title.lower().startswith("file:"):
        title = f"File:{title}"
    t = urllib.parse.quote(title)
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo"
        f"&titles={t}&iiprop=url|extmetadata|mime|size&iiurlwidth={LARGE_W}&format=json"
    )
    data = get_json(url)
    for page in data.get("query", {}).get("pages", {}).values():
        info = (page.get("imageinfo") or [{}])[0]
        if not info.get("url"):
            continue
        return commons_record(page, info)
    return None


def commons_record(page: dict, info: dict) -> dict:
    meta = info.get("extmetadata", {})
    artist = strip_tags(meta.get("Artist", {}).get("value", "")) or "Wikimedia Commons"
    lic = meta.get("LicenseShortName", {}).get("value", "See file page")
    return {
        "url": info.get("thumburl") or info.get("url"),
        "credit": artist[:120],
        "license": lic,
        "source_url": info.get("descriptionurl") or f"https://commons.wikimedia.org/wiki/{page.get('title')}",
        "alt": strip_tags(meta.get("ImageDescription", {}).get("value", "")).split("\n")[0][:180] or page.get("title", ""),
        "provider": "commons",
    }


def acceptable_shape(width: int, height: int) -> bool:
    if not width or not height:
        return True
    ratio = width / height
    return 0.45 <= ratio <= 2.4


def search_commons(query: str) -> dict | None:
    q = urllib.parse.quote(query)
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&generator=search"
        f"&gsrsearch={q}&gsrnamespace=6&gsrlimit=8&prop=imageinfo"
        f"&iiprop=url|extmetadata|mime|size&iiurlwidth={LARGE_W}&format=json"
    )
    data = get_json(url)
    pages = data.get("query", {}).get("pages", {})
    ranked = sorted(pages.values(), key=lambda p: p.get("index", 99))
    for page in ranked:
        info = (page.get("imageinfo") or [{}])[0]
        mime = info.get("mime", "")
        if mime not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if info.get("width", 0) < 640:
            continue
        if not acceptable_shape(info.get("width", 0), info.get("height", 0)):
            continue
        return commons_record(page, info)
    return None


def list_commons(query: str, limit: int = 8) -> list[str]:
    q = urllib.parse.quote(query)
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&generator=search"
        f"&gsrsearch={q}&gsrnamespace=6&gsrlimit={limit}&prop=imageinfo&iiprop=mime|size&format=json"
    )
    data = get_json(url)
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    return [
        f"wmfile:{p.get('title')}  |  {(p.get('imageinfo') or [{}])[0].get('width')}×{(p.get('imageinfo') or [{}])[0].get('height')}"
        for p in pages
    ]


def resolve(candidates: list[str]) -> dict | None:
    direct_credit = next((c[len("credit:"):] for c in candidates if c.startswith("credit:")), "")
    for cand in candidates:
        if cand.startswith("credit:"):
            continue
        kind, _, query = cand.partition(":")
        try:
            if kind == "nasa":
                hit = search_nasa(query)
            elif kind == "nasaid":
                hit = nasa_by_id(query)
            elif kind == "wm":
                hit = search_commons(query)
            elif kind == "wmfile":
                hit = commons_file(query)
            elif kind == "url":
                hit = {
                    "url": query,
                    "credit": direct_credit or "See source",
                    "license": "See source",
                    "source_url": query,
                    "alt": "",
                    "provider": "url",
                }
            else:
                print(f"    ! unknown source in {cand}")
                continue
        except Exception as err:  # network hiccups should not kill the run
            print(f"    ! {cand}: {err}")
            continue
        if hit:
            hit["query"] = cand
            return hit
        time.sleep(0.3)
    return None


# ------------------------------------------------------------------ images


def save_variants(raw: bytes, large_path: Path, small_path: Path | None) -> tuple[int, int]:
    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    elif img.mode == "L":
        img = img.convert("RGB")

    def fit(im: Image.Image, width: int) -> Image.Image:
        if im.width <= width:
            return im.copy()
        ratio = width / im.width
        return im.resize((width, max(1, round(im.height * ratio))), Image.LANCZOS)

    large = fit(img, LARGE_W)
    large_path.parent.mkdir(parents=True, exist_ok=True)
    large.save(large_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    if small_path:
        fit(img, SMALL_W).save(small_path, "JPEG", quality=QUALITY - 4, optimize=True, progressive=True)
    return large.width, large.height


def target_paths(key: str) -> tuple[Path, Path | None, str]:
    if key == "hero":
        return HERO, None, "hero.jpg"
    if key == "og":
        return HERO.with_name("og-source.jpg"), None, "og-source.jpg"
    if key.startswith("program:") or key.startswith("category:"):
        name = slug(key.split(":", 1)[1])
        return PROGRAM_DIR / f"{name}.jpg", PROGRAM_DIR / f"{name}-sm.jpg", f"{name}.jpg"
    return EVENT_DIR / f"{key}.jpg", EVENT_DIR / f"{key}-sm.jpg", f"{key}.jpg"


def dedupe(images: dict) -> None:
    """Point keys that downloaded byte-identical images at one shared file."""
    import hashlib

    seen: dict[str, str] = {}  # digest -> canonical relative path
    removed = 0
    for key in sorted(images):
        rec = images[key]
        large, small, _ = target_paths(key)
        # Records may already point at a shared file from a previous run.
        current = large.parent / rec["file"] if not rec["file"].startswith("../") else (large.parent / rec["file"]).resolve()
        if not current.exists():
            continue
        digest = hashlib.md5(current.read_bytes()).hexdigest()
        if digest not in seen:
            seen[digest] = str(current.resolve())
            continue
        canonical = Path(seen[digest])
        if canonical.resolve() == current.resolve():
            continue
        # Same directory: just reference the canonical filename. Different directory
        # (event vs program): reference with a relative prefix the app understands.
        if canonical.parent == current.parent:
            rec["file"] = canonical.name
        else:
            rec["file"] = f"../{canonical.parent.name}/{canonical.name}"
        for path in (current, current.with_name(current.stem + "-sm.jpg")):
            if path.exists() and path.resolve() != canonical.resolve():
                path.unlink()
                removed += 1
    if removed:
        print(f"deduplicated {removed} files")


# -------------------------------------------------------------------- main


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="re-fetch even if the file exists")
    parser.add_argument("--only", default="", help="comma-separated keys to (re)fetch")
    parser.add_argument("--search", default="", help="print candidate ids for 'nasa:<q>' or 'wm:<q>' and exit")
    args = parser.parse_args()

    if args.search:
        kind, _, query = args.search.partition(":")
        rows = list_nasa(query) if kind == "nasa" else list_commons(query)
        print("\n".join(rows) or "(no results)")
        return 0

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    events = json.loads(EVENTS.read_text(encoding="utf-8"))
    by_id = {e["id"]: e for e in events}
    images = json.loads(IMAGES_JSON.read_text(encoding="utf-8")) if IMAGES_JSON.exists() else {}

    only = {k.strip() for k in args.only.split(",") if k.strip()}
    keys = [k for k in manifest if not only or k in only]

    ok = missed = skipped = 0
    for key in keys:
        large, small, filename = target_paths(key)
        if key not in ("hero", "og") and not key.startswith(("program:", "category:")) and key not in by_id:
            print(f"  ? {key}: no such event id, skipping")
            continue
        existing = images.get(key)
        have_file = large.exists() or (existing and (large.parent / existing["file"]).exists())
        if have_file and not args.force and not (only and key in only):
            skipped += 1
            continue
        print(f"  → {key}")
        hit = resolve(manifest[key])
        if not hit:
            print("    ✗ no candidate produced an image")
            missed += 1
            continue
        try:
            raw = http(hit["url"])
            probe = Image.open(io.BytesIO(raw))
            if not acceptable_shape(probe.width, probe.height) and not hit["query"].startswith(("nasaid:", "wmfile:", "url:")):
                print(f"    ✗ rejected shape {probe.width}×{probe.height} from {hit['query']}")
                missed += 1
                continue
            w, h = save_variants(raw, large, small)
        except Exception as err:
            print(f"    ✗ download/convert failed: {err}")
            missed += 1
            continue
        record = {
            "file": filename,
            "width": w,
            "height": h,
            "alt": hit["alt"],
            "credit": hit["credit"],
            "license": hit["license"],
            "source_url": hit["source_url"],
            "provider": hit["provider"],
            "query": hit["query"],
            "fetched": time.strftime("%Y-%m-%d"),
        }
        images[key] = record
        print(f"    ✓ {hit['provider']}: {hit['alt'][:70] or hit['url'][:70]}  ({w}×{h})")
        ok += 1
        time.sleep(0.4)

    dedupe(images)

    # Write provenance and push per-event image objects into events.json.
    IMAGES_JSON.parent.mkdir(parents=True, exist_ok=True)
    IMAGES_JSON.write_text(json.dumps(images, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    changed = 0
    for key, rec in images.items():
        event = by_id.get(key)
        if not event:
            continue
        image = {
            "file": rec["file"],
            "alt": rec["alt"] or event.get("title", ""),
            "credit": rec["credit"],
            "license": rec["license"],
            "source_url": rec["source_url"],
        }
        if event.get("image") != image:
            event["image"] = image
            changed += 1
    EVENTS.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nfetched {ok}, skipped {skipped}, missed {missed}; updated image field on {changed} events")
    return 0 if not missed else 1


if __name__ == "__main__":
    sys.exit(main())
