#!/usr/bin/env python3
"""Inspect curriculum week organization in data/course.json."""

import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "data" / "course.json", "r", encoding="utf-8") as f:
    course = json.load(f)

for week in course.get("weeks", []):
    wnum = week.get("week")
    wtitle = week.get("title")
    print(f"\n=== Week {wnum}: {wtitle} ===")
    for item in week.get("lectures", []):
        print(f"  - [{item.get('slug')}] {item.get('title')} ({item.get('path')})")
