#!/usr/bin/env python3
"""
Download 4:3 SVG flags (flag-icons, MIT licence) for every country code used
in data/events/events.json into app/assets/flags/<cc>.svg. Emoji flags do not
render on Windows browsers, so the UI uses these images instead.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS = ROOT / "data" / "events" / "events.json"
OUT = ROOT / "app" / "assets" / "flags"
CDN = "https://cdn.jsdelivr.net/npm/flag-icons@7/flags/4x3/{code}.svg"


def main() -> int:
    events = json.loads(EVENTS.read_text(encoding="utf-8"))
    codes = sorted({c.lower() for e in events for c in e.get("countries", [])})
    OUT.mkdir(parents=True, exist_ok=True)
    missed = 0
    for code in codes:
        target = OUT / f"{code}.svg"
        if target.exists():
            continue
        try:
            data = urllib.request.urlopen(CDN.format(code=code), timeout=30).read()
            target.write_bytes(data)
            print(f"  ✓ {code}")
        except Exception as err:
            print(f"  ✗ {code}: {err}")
            missed += 1
    (OUT / "LICENSE.txt").write_text(
        "Flags from flag-icons (https://github.com/lipis/flag-icons), MIT License.\n", encoding="utf-8"
    )
    print(f"{len(codes)} codes, {missed} missed")
    return 1 if missed else 0


if __name__ == "__main__":
    sys.exit(main())
