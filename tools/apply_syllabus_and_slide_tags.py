import json
import os
from pathlib import Path

root = Path(".")

# Load course.json and slides.json
course_path = root / "data" / "course.json"
slides_path = root / "data" / "slides.json"

with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

with open(slides_path, encoding="utf-8") as f:
    slides_data = json.load(f)

# Load all 5 subagent batch results
all_evaluations = []
for i in range(1, 6):
    r_file = root / f"scratch/result_{i}.json"
    if r_file.exists():
        with open(r_file, encoding="utf-8") as f:
            data = json.load(f)
            all_evaluations.extend(data.get("evaluations", []))

print(f"Total subagent evaluations loaded: {len(all_evaluations)}")

# Build map of weeks by week number (0..13, 99)
week_map = {w["week"]: w for w in course["weeks"]}
if 99 not in week_map:
    w99 = {
        "week": 99,
        "id": "week-removed",
        "title": "Regál zrušených přednášek (Gray Section)",
        "description": "Archivní a zrušené přednášky odložené na regál.",
        "lectures": []
    }
    course["weeks"].append(w99)
    week_map[99] = w99

# Build index of all current lectures across all weeks
lecture_by_path = {}
for w in course["weeks"]:
    for l in list(w.get("lectures", [])):
        lecture_by_path[l["path"]] = (w, l)

restored_lectures = []
gray_lectures = []
slides_tagged = 0

for ev in all_evaluations:
    path = ev["path"]
    title = ev["title"]
    decision = ev.get("syllabus_decision", "gray_shelf")
    target_week = ev.get("target_week", 99)
    justification = ev.get("justification", "")
    slides = ev.get("slides", {})

    slug = path.split("/")[-1].replace(".html", "")
    l_id = f"lecture:{path.replace('vyuka_downloaded/', '')}"

    # 1. Update slide relevance & tags in slides_data
    for slide_id, meta in slides.items():
        full_key = f"{slug}#{slide_id}"
        slides_data[full_key] = {
            "tags": meta.get("tags", ["Core"]),
            "relevance": meta.get("relevance", 7)
        }
        slides_tagged += 1

    # 2. Update lecture placement in course.json
    existing_entry = lecture_by_path.get(path)

    if existing_entry:
        cur_w, cur_lecture = existing_entry
        cur_w["lectures"].remove(cur_lecture)
        lecture_obj = cur_lecture
        lecture_obj["title"] = title
    else:
        lecture_obj = {
            "id": l_id,
            "kind": "lecture",
            "title": title,
            "path": path,
            "slug": slug,
            "tags": ["Core"],
            "relevance": 7,
            "diff": "newconcept",
            "desc": justification,
            "compare": "",
            "week": target_week,
            "exists": True
        }

    if decision == "restore" and target_week in range(0, 14):
        lecture_obj["week"] = target_week
        week_map[target_week]["lectures"].append(lecture_obj)
        restored_lectures.append((title, target_week))
    else:
        lecture_obj["week"] = 99
        week_map[99]["lectures"].append(lecture_obj)
        gray_lectures.append((title, path))

# Update stats
total_lectures = sum(len(w.get("lectures", [])) for w in course["weeks"] if w["week"] != 99)
course["meta"]["stats"]["lectures"] = total_lectures

# Save updated course.json and slides.json
with open(course_path, "w", encoding="utf-8") as f:
    json.dump(course, f, indent=2, ensure_ascii=False)

with open(slides_path, "w", encoding="utf-8") as f:
    json.dump(slides_data, f, indent=2, ensure_ascii=False)

print(f"\n✅ SUCCESSFULLY APPLIED EVALUATIONS:")
print(f"  • Restored to active course (W0-W13): {len(restored_lectures)} lectures")
for title, w_num in restored_lectures:
    print(f"    - W{w_num}: {title}")

print(f"  • Placed in Gray Section (W99): {len(gray_lectures)} lectures")
print(f"  • Total slide relevance & tags updated: {slides_tagged}")
