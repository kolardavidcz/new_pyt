#!/usr/bin/env python3
"""Import original slide-tags.js & slide-classification.js into data/slides.json and public/data/slides.json."""

import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

TAGS_FILE = ROOT / "public" / "vyuka_downloaded" / "cjs" / "slide-tags.js"
CLASS_FILE = ROOT / "public" / "vyuka_downloaded" / "cjs" / "slide-classification.js"

OUT_SLIDES = ROOT / "data" / "slides.json"
PUB_OUT_SLIDES = ROOT / "public" / "data" / "slides.json"

if not TAGS_FILE.exists():
    print(f"Error: {TAGS_FILE} does not exist.")
    sys.exit(1)

tags_text = TAGS_FILE.read_text(encoding="utf-8")
m_tags = re.search(r"window\.SLIDE_TAGS\s*=\s*(\{[\s\S]*?\});", tags_text)
if not m_tags:
    print("Error: Could not find window.SLIDE_TAGS in slide-tags.js")
    sys.exit(1)

slide_tags_map = json.loads(m_tags.group(1))
print(f"Loaded {len(slide_tags_map)} slide tag entries from slide-tags.js!")

slide_class_map = {}
if CLASS_FILE.exists():
    class_text = CLASS_FILE.read_text(encoding="utf-8")
    m_class = re.search(r"window\.SLIDE_CLASS\s*=\s*(\{[\s\S]*?\});", class_text)
    if not m_class:
        m_class = re.search(r"window\.SLIDE_CLASS\s*=\s*(\{[\s\S]*?\})", class_text)
    if m_class:
        clean_js = re.sub(r"//.*$", "", m_class.group(1), flags=re.MULTILINE)
        clean_js = re.sub(r",\s*\}", "}", clean_js)
        try:
            slide_class_map = json.loads(clean_js)
            print(f"Loaded {len(slide_class_map)} slide classification entries from slide-classification.js!")
        except Exception as e:
            print(f"Warning: could not parse slide-classification.js: {e}")

final_slides = {}

all_keys = set(slide_tags_map.keys()) | set(slide_class_map.keys())

for key in sorted(all_keys):
    tags = slide_tags_map.get(key, [])
    diff = slide_class_map.get(key, None)
    
    entry = {}
    if tags:
        entry["tags"] = tags
    if diff:
        entry["diff"] = diff

    if entry:
        final_slides[key] = entry

print(f"Total merged original slide entries: {len(final_slides)}")

with open(OUT_SLIDES, "w", encoding="utf-8") as f:
    json.dump(final_slides, f, ensure_ascii=False, indent=2)

with open(PUB_OUT_SLIDES, "w", encoding="utf-8") as f:
    json.dump(final_slides, f, ensure_ascii=False, indent=2)

print("Saved ORIGINAL slide tags & classification to data/slides.json and public/data/slides.json!")
