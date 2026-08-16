#!/usr/bin/env python3
"""
Detect cross-lecture duplicate / recap slides and tag secondary occurrences as 'Already Studied' (Již probráno) in data/slides.json.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSE_JSON = ROOT / "data" / "course.json"
SLIDES_JSON = ROOT / "data" / "slides.json"
LECTURES_DIR = ROOT / "public" / "data" / "lectures"

def main():
    course = json.loads(COURSE_JSON.read_text(encoding="utf-8"))
    slides_data = json.loads(SLIDES_JSON.read_text(encoding="utf-8"))

    ordered_lectures = []
    for w in course.get("weeks", []):
        w_num = w["week"]
        for l in w.get("lectures", []):
            path = l["path"]
            clean_rel = path.replace("\\", "/").replace("vyuka_downloaded/", "")
            path_slug = clean_rel.replace("/", "--").replace(".html", "").replace(".htm", "")
            base_slug = Path(path).stem
            ordered_lectures.append({
                "week": w_num,
                "week_id": w["id"],
                "week_title": w["title"],
                "lecture_id": l["id"],
                "lecture_title": l["title"],
                "path": path,
                "clean_rel": clean_rel,
                "path_slug": path_slug,
                "base_slug": base_slug,
                "order_index": len(ordered_lectures)
            })

    print(f"  ✓ Loaded {len(ordered_lectures)} ordered lectures from course.json")

    def get_words(html):
        text = re.sub(r'<[^>]+>', ' ', html)
        words = re.findall(r'\b[a-zA-Z0-9_áéíóúýčďěňřšťžůÁÉÍÓÚÝČĎĚŇŘŠŤŽŮ]{3,}\b', text.lower())
        stopwords = {"tento", "této", "tato", "který", "která", "které", "jako", "nebo", "také", "pokud", "jsou", "bude", "není", "jsme", "tedy", "proto", "můžeme", "však", "přímo", "další", "všechny", "jednotlivé", "pomocí", "následující", "příklad", "ukázka"}
        return set(w for w in words if w not in stopwords)

    def extract_code_blocks(html):
        blocks = re.findall(r'<pre[^>]*>([\s\S]*?)<\/pre>', html)
        cleaned = []
        for b in blocks:
            txt = re.sub(r'<[^>]+>', '', b).strip()
            txt = re.sub(r'\s+', ' ', txt)
            if len(txt) > 30:
                cleaned.append(txt)
        return cleaned

    all_slides = []
    for lec in ordered_lectures:
        json_path = LECTURES_DIR / f"{lec['path_slug']}.json"
        if not json_path.exists():
            json_path = LECTURES_DIR / f"{lec['base_slug']}.json"
        if not json_path.exists():
            continue
        
        data = json.loads(json_path.read_text(encoding="utf-8"))
        slides = data.get("slides", [])
        
        for s_idx, s in enumerate(slides):
            s_id = s.get("id")
            title = s.get("title", "").strip()
            html = s.get("html", "")
            words = get_words(html)
            codes = extract_code_blocks(html)
            
            if len(words) < 5 and not codes:
                continue
                
            all_slides.append({
                "slide_key": f"{lec['base_slug']}#{s_id}",
                "full_slide_key": f"{lec['path_slug']}#{s_id}",
                "clean_slide_key": f"{lec['clean_rel']}#{s_id}",
                "slide_id": s_id,
                "slide_index": s_idx,
                "slide_title": title,
                "week": lec["week"],
                "week_title": lec["week_title"],
                "lecture_id": lec["lecture_id"],
                "lecture_title": lec["lecture_title"],
                "lecture_path": lec["path"],
                "order_index": lec["order_index"],
                "words": words,
                "codes": codes,
                "html": html
            })

    print(f"  ✓ Analyzed {len(all_slides)} slides across all lectures")

    duplicate_links = []
    for i in range(len(all_slides)):
        s1 = all_slides[i]
        for j in range(i + 1, len(all_slides)):
            s2 = all_slides[j]
            if s1["lecture_path"] == s2["lecture_path"]:
                continue
            
            first, second = (s1, s2) if (s1["order_index"], s1["slide_index"]) < (s2["order_index"], s2["slide_index"]) else (s2, s1)
            
            shared_codes = [c for c in first["codes"] if c in second["codes"] and len(c) > 40]
            
            u = len(first["words"] | second["words"])
            inter = len(first["words"] & second["words"])
            jaccard = inter / u if u > 0 else 0
            
            is_dupe = False
            reason = ""
            
            if shared_codes and (jaccard >= 0.40 or first["slide_title"].lower() == second["slide_title"].lower()):
                is_dupe = True
                reason = f"Identical code snippet + {jaccard*100:.0f}% word overlap"
            elif jaccard >= 0.70:
                is_dupe = True
                reason = f"{jaccard*100:.0f}% text similarity ({inter} shared concept words)"
            elif jaccard >= 0.55 and first["slide_title"].lower() == second["slide_title"].lower() and len(first["slide_title"]) > 4:
                is_dupe = True
                reason = f"Matching title '{first['slide_title']}' + {jaccard*100:.0f}% text similarity"
                
            if is_dupe:
                duplicate_links.append({
                    "secondary": second,
                    "primary": first,
                    "score": jaccard,
                    "reason": reason
                })

    # Pick best primary for each secondary slide
    best_primary_for_secondary = {}
    for link in duplicate_links:
        sec_key = link["secondary"]["full_slide_key"]
        if sec_key not in best_primary_for_secondary:
            best_primary_for_secondary[sec_key] = link
        else:
            curr = best_primary_for_secondary[sec_key]
            if (link["primary"]["order_index"] < curr["primary"]["order_index"]) or (link["score"] > curr["score"]):
                best_primary_for_secondary[sec_key] = link

    print(f"  ✓ Identified {len(best_primary_for_secondary)} secondary recap slides")

    # Update slides_data
    report_lines = [
        "# Cross-Lecture Duplicate Slide Audit Report",
        "",
        f"Total secondary duplicate slides tagged: **{len(best_primary_for_secondary)}**",
        "",
        "| Secondary Slide (Recap) | Primary Origin Slide | Similarity Reason |",
        "| :--- | :--- | :--- |"
    ]

    tagged_count = 0
    for sec_key, link in sorted(best_primary_for_secondary.items(), key=lambda x: (x[1]["secondary"]["order_index"], x[1]["secondary"]["slide_index"])):
        sec = link["secondary"]
        prim = link["primary"]

        origin_meta = {
            "lecture_id": prim["lecture_id"],
            "lecture_title": prim["lecture_title"],
            "lecture_path": prim["lecture_path"],
            "slide_id": prim["slide_id"],
            "slide_title": prim["slide_title"],
            "week": prim["week"],
            "reason": link["reason"]
        }

        # Candidate keys in slides.json
        keys_to_update = [
            sec["full_slide_key"],
            sec["slide_key"],
            sec["clean_slide_key"]
        ]

        for k in keys_to_update:
            if k not in slides_data:
                slides_data[k] = {"diff": "basics", "tags": []}
            
            entry = slides_data[k]
            if not isinstance(entry, dict):
                entry = {"diff": entry, "tags": []}
                slides_data[k] = entry
            
            tags = entry.get("tags", [])
            if "Already Studied" not in tags:
                tags.append("Already Studied")
            entry["tags"] = tags
            entry["already_studied_in"] = origin_meta

        tagged_count += 1
        sec_label = f"**W{sec['week']} {sec['lecture_title']}**<br>`{sec['slide_key']}` ({sec['slide_title']})"
        prim_label = f"**W{prim['week']} {prim['lecture_title']}**<br>`{prim['slide_key']}` ({prim['slide_title']})"
        report_lines.append(f"| {sec_label} | {prim_label} | {link['reason']} |")

    # Save updated slides.json
    SLIDES_JSON.write_text(json.dumps(slides_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    pub_slides = ROOT / "public" / "data" / "slides.json"
    if pub_slides.parent.exists():
        pub_slides.write_text(json.dumps(slides_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Save markdown report
    rep_path = ROOT / "scratch" / "duplicate_slides_report.md"
    rep_path.parent.mkdir(exist_ok=True)
    rep_path.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print(f"  ✓ Successfully tagged {tagged_count} secondary slides in data/slides.json")
    print(f"  ✓ Saved markdown audit report to scratch/duplicate_slides_report.md")

if __name__ == "__main__":
    main()
