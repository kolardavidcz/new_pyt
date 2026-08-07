#!/usr/bin/env python3
"""
Scans all lectures in data/course.json (focusing on Gray Section W99 and newly added lectures),
extracts all slide IDs and titles, and lists slide decks that need AI Subagent classification.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSE_JSON = ROOT / "data" / "course.json"
SLIDES_JSON = ROOT / "data" / "slides.json"
PAGES_INDEX_JSON = ROOT / "data" / "pages-index.json"

with open(COURSE_JSON, encoding="utf-8") as f:
    course = json.load(f)

with open(SLIDES_JSON, encoding="utf-8") as f:
    slides_data = json.load(f)

with open(PAGES_INDEX_JSON, encoding="utf-8") as f:
    pages_index = json.load(f)

# Find all lectures in Week 99 (Gray Section) and newly restored lectures
gray_lectures = []
all_lectures = []

for w in course["weeks"]:
    for l in w.get("lectures", []):
        all_lectures.append(l)
        if w["week"] == 99 or l.get("isCanceled"):
            gray_lectures.append(l)

print(f"Total lectures in course: {len(all_lectures)}")
print(f"Total lectures in Gray Section (W99): {len(gray_lectures)}")

untagged_decks = []
for l in all_lectures:
    slug = l["slug"]
    path = l["path"]
    pages = pages_index.get(path, [])
    
    untagged_pages = []
    for p in pages:
        key = f"{slug}#{p['id']}"
        if key not in slides_data or not slides_data[key].get("tags"):
            untagged_pages.append(p)
            
    if untagged_pages:
        untagged_decks.append({
            "lecture": l,
            "untagged_count": len(untagged_pages),
            "total_pages": len(pages),
            "pages": untagged_pages
        })

print(f"\nDecks with untagged slides: {len(untagged_decks)}")
total_untagged_slides = sum(d["untagged_count"] for d in untagged_decks)
print(f"Total untagged slides requiring subagent classification: {total_untagged_slides}")

for i, d in enumerate(untagged_decks, 1):
    l = d["lecture"]
    print(f"  {i:2d}. [W{l['week']}] {l['title']} ({l['slug']}): {d['untagged_count']}/{d['total_pages']} untagged slides")
