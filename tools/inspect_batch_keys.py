#!/usr/bin/env python3
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
LABELS_DIR = ROOT / "data" / "labels"

with open(ROOT / "data" / "course.json", "r", encoding="utf-8") as f:
    course = json.load(f)

course_items_by_path = {}
course_items_by_slug = {}

for week in course.get("weeks", []):
    for item in week.get("lectures", []) + week.get("exercises", []):
        path = item.get("path", "")
        slug = item.get("slug", "")
        course_items_by_path[path] = item
        # clean path
        clean_path = path.replace("vyuka_downloaded/materialy/", "").replace("vyuka_downloaded/", "")
        course_items_by_path[clean_path] = item
        course_items_by_slug[slug] = item

batch_items = []
for bf in sorted(LABELS_DIR.glob("batch_*.json")):
    with open(bf, "r", encoding="utf-8") as f:
        data = json.load(f)
        for item in data:
            batch_items.append(item)

print(f"Total course items in course.json: {len(course_items_by_path)}")
print(f"Total batch items in data/labels: {len(batch_items)}")

sample_batch = batch_items[:5]
for b in sample_batch:
    print(f"Batch item: rel_path={b.get('rel_path')} | slug={b.get('slug')} | title={b.get('title')}")
    slides = b.get("slides", {})
    print(f"  Sample slide keys: {list(slides.keys())[:3]}")
