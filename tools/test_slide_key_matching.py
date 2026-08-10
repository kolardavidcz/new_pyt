#!/usr/bin/env python3
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "data" / "course.json", "r", encoding="utf-8") as f:
    course = json.load(f)

with open(ROOT / "data" / "slides.json", "r", encoding="utf-8") as f:
    slides_db = json.load(f)

with open(ROOT / "data" / "pages-index.json", "r", encoding="utf-8") as f:
    pages_index = json.load(f)

matched = 0
missing = 0
missing_samples = []

for week in course.get("weeks", []):
    for item in week.get("lectures", []) + week.get("exercises", []):
        path = item.get("path", "")
        slug = item.get("slug", "")
        pages = pages_index.get(path, [])
        for page in pages:
            pid = page.get("id")
            key1 = f"{slug}#{pid}"
            key2 = f"_{slug}#{pid}"
            if key1 in slides_db or key2 in slides_db:
                matched += 1
            else:
                missing += 1
                if len(missing_samples) < 15:
                    missing_samples.append((path, slug, pid))

print(f"Matched slide keys: {matched}")
print(f"Missing slide keys: {missing}")
if missing_samples:
    print("Sample missing keys:")
    for path, slug, pid in missing_samples:
        print(f"  path={path} | slug={slug} | pageId={pid}")
