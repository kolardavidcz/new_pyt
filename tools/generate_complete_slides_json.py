#!/usr/bin/env python3
"""Generate complete data/slides.json covering 100% of slides across all lectures and exercises."""

import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

# 1. Load course.json
with open(ROOT / "data" / "course.json", "r", encoding="utf-8") as f:
    course = json.load(f)

course_items_by_path = {}
course_items_by_slug = {}

for week in course.get("weeks", []):
    for item in week.get("lectures", []) + week.get("exercises", []):
        path = item.get("path", "")
        slug = item.get("slug", "")
        course_items_by_path[path] = item
        clean_path = path.replace("vyuka_downloaded/materialy/", "").replace("vyuka_downloaded/", "")
        course_items_by_path[clean_path] = item
        course_items_by_slug[slug] = item

# 2. Load pages-index.json
with open(ROOT / "data" / "pages-index.json", "r", encoding="utf-8") as f:
    pages_index = json.load(f)

# 3. Load explicit batch labels and original slide-tags.js
batch_slides = {}

# Load original slide-tags.js
tags_file = ROOT / "public" / "vyuka_downloaded" / "cjs" / "slide-tags.js"
if tags_file.exists():
    t_text = tags_file.read_text(encoding="utf-8")
    m_t = re.search(r"window\.SLIDE_TAGS\s*=\s*(\{[\s\S]*?\});", t_text)
    if m_t:
        try:
            s_map = json.loads(m_t.group(1))
            for skey, tags in s_map.items():
                if tags:
                    batch_slides[skey] = {"tags": tags}
        except Exception:
            pass

labels_dir = ROOT / "data" / "labels"
if labels_dir.exists():
    for bf in sorted(labels_dir.glob("batch_*.json")):
        with open(bf, "r", encoding="utf-8") as f:
            bdata = json.load(f)
            for bitem in bdata:
                slides = bitem.get("slides", {})
                for skey, sval in slides.items():
                    if isinstance(sval, dict):
                        batch_slides[skey] = {**batch_slides.get(skey, {}), **sval}

# Load audit slides if present
audit_path = ROOT / "data" / "slide_labels_audit.json"
if audit_path.exists():
    with open(audit_path, "r", encoding="utf-8") as f:
        adata = json.load(f)
        if isinstance(adata, dict):
            for skey, sval in adata.items():
                if isinstance(sval, dict):
                    batch_slides[skey] = {**batch_slides.get(skey, {}), **sval}

final_slides = {}

# Tag classification rules
def classify_slide(title, slide_num, total_slides, parent_item):
    t_lower = title.lower()
    p_tags = parent_item.get("tags", ["Core"]) if parent_item else ["Core"]
    p_diff = parent_item.get("diff", "basics") if parent_item else "basics"
    p_rel = parent_item.get("relevance", 7) if parent_item else 7

    # 1. Skip / Historical / Installation
    if any(k in t_lower for k in ["historie", "instalac", "staré", "python 2", "zastaral", "varianty interpretru"]):
        return {"tags": ["Skip"], "diff": "basics", "relevance": 3}

    # 2. Practice / Examples / Exercises
    if any(k in t_lower for k in ["příklad", "cvičení", "procvičování", "úkol", "ukázka", "řešení", "kód"]):
        return {"tags": ["Practice"], "diff": "pythonic", "relevance": 8}

    # 3. Tricky / Edge cases / Exceptions / Caveats
    if any(k in t_lower for k in ["výjimk", "chyb", "chyták", "pozor", "problém", "past", "zrádn", "záludn", "rozdíl"]):
        return {"tags": ["Tricky"], "diff": "paradigm", "relevance": 9}

    # 4. WOW / Legendary / Advanced / Internal
    if any(k in t_lower for k in ["match-case", "dekorátor", "generátor", "metatříd", "dunder", "magic", "c-api", "internals", "pokročil", "introspection"]):
        if "metatříd" in t_lower or "c-api" in t_lower:
            return {"tags": ["Legendary"], "diff": "paradigm", "relevance": 10}
        return {"tags": ["WOW"], "diff": "pythonic", "relevance": 9}

    # 5. Core / Fundamental concept
    if slide_num == 1 or "úvod" in t_lower or "základ" in t_lower or "princip" in t_lower or "definice" in t_lower:
        return {"tags": ["Core"], "diff": p_diff, "relevance": max(p_rel, 8)}

    # 6. Insight / Concept deep-dive
    if any(k in t_lower for k in ["souvislosti", "struktura", "vlastnosti", "metody", "operátor", "funkce"]):
        return {"tags": ["Insight"], "diff": "resyntax", "relevance": 8}

    # Alternate based on slide position if standard
    if slide_num % 4 == 0:
        return {"tags": ["Insight"], "diff": "pythonic", "relevance": p_rel}
    elif slide_num % 3 == 0:
        return {"tags": ["Practice"], "diff": p_diff, "relevance": p_rel}
    elif "WOW" in p_tags:
        return {"tags": ["WOW"], "diff": p_diff, "relevance": p_rel}
    
    return {"tags": p_tags, "diff": p_diff, "relevance": p_rel}

total_pages = 0
explicit_matched = 0
rule_generated = 0

for path, pages in pages_index.items():
    clean_path = path.replace("vyuka_downloaded/materialy/", "").replace("vyuka_downloaded/", "")
    item = course_items_by_path.get(path) or course_items_by_path.get(clean_path)
    slug = item.get("slug") if item else Path(path).stem

    for i, page in enumerate(pages):
        total_pages += 1
        pid = page.get("id", f"id{i+1}")
        title = page.get("title", f"Slide {i+1}")
        skey = f"{slug}#{pid}"

        if skey in batch_slides:
            final_slides[skey] = batch_slides[skey]
            explicit_matched += 1
        else:
            final_slides[skey] = classify_slide(title, i + 1, len(pages), item or {})
            rule_generated += 1

print(f"Total slide pages processed: {total_pages}")
print(f"Explicitly labeled from batches: {explicit_matched}")
print(f"Rule-classified slide tags: {rule_generated}")

# Write to data/slides.json and public/data/slides.json
out_path = ROOT / "data" / "slides.json"
pub_path = ROOT / "public" / "data" / "slides.json"

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(final_slides, f, ensure_ascii=False, indent=2)

with open(pub_path, "w", encoding="utf-8") as f:
    json.dump(final_slides, f, ensure_ascii=False, indent=2)

print(f"Saved complete slides.json ({len(final_slides)} entries) to data/ and public/data/!")
