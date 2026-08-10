#!/usr/bin/env python3
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
LABELS_DIR = ROOT / "data" / "labels"
OUT_SLIDES = ROOT / "data" / "slides.json"
PUB_OUT_SLIDES = ROOT / "public" / "data" / "slides.json"

all_slides = {}

for batch_file in sorted(LABELS_DIR.glob("batch_*.json")):
    with open(batch_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        for item in data:
            slides = item.get("slides", {})
            for slide_key, slide_data in slides.items():
                all_slides[slide_key] = slide_data

print(f"Compiled {len(all_slides)} slide entries from batch files.")

with open(OUT_SLIDES, "w", encoding="utf-8") as f:
    json.dump(all_slides, f, ensure_ascii=False, indent=2)

with open(PUB_OUT_SLIDES, "w", encoding="utf-8") as f:
    json.dump(all_slides, f, ensure_ascii=False, indent=2)

print("Saved compiled slides.json to data/ and public/data/!")
