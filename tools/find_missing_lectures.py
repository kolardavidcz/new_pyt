#!/usr/bin/env python3
"""Find all HTML lecture files in vyuka_downloaded that are missing from course.json."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "data" / "course.json", "r", encoding="utf-8") as f:
    course = json.load(f)

course_paths = set()
for week in course.get("weeks", []):
    for item in week.get("lectures", []) + week.get("exercises", []):
        p = item.get("path", "").replace("\\", "/")
        course_paths.add(p)

mat_dir = ROOT / "public" / "vyuka_downloaded" / "materialy"
missing = []

for html_file in sorted(mat_dir.rglob("*.html")):
    rel_path = f"vyuka_downloaded/{html_file.relative_to(ROOT / 'public' / 'vyuka_downloaded')}".replace("\\", "/")
    if rel_path not in course_paths:
        missing.append(rel_path)

print(f"Total missing html files from course.json: {len(missing)}")
for m in missing:
    print("  -", m)
