import os
import re
import json
from pathlib import Path

root = Path("public/vyuka_downloaded/materialy")
course_path = Path("data/course.json")

# Load course.json to know all valid active and shelf lectures
with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

valid_lecture_paths = {}
for w in course["weeks"]:
    for l in w.get("lectures", []):
        valid_lecture_paths[l["path"]] = {
            "title": l["title"],
            "week": w["week"],
            "slug": l["slug"],
            "id": l["id"]
        }

print(f"  ✓ Loaded {len(valid_lecture_paths)} lectures from course.json")

all_extracted_links = []

link_pattern = re.compile(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)

for html_file in root.rglob("*.html"):
    rel_path = str(html_file).replace("\\", "/").replace("public/", "")
    try:
        content = html_file.read_text(encoding="utf-8", errors="ignore")
        for match in link_pattern.finditer(content):
            href = match.group(1).strip()
            raw_text = match.group(2)
            # Clean HTML tags inside link text
            text = re.sub(r'<[^>]+>', '', raw_text).strip()
            
            all_extracted_links.append({
                "source_file": rel_path,
                "text": text,
                "raw_href": href
            })
    except Exception as e:
        print(f"    ❌ Error reading {html_file}: {e}")

print(f"  ✓ Total extracted links across all presentations: {len(all_extracted_links)}")

# Save to scratch/all_presentation_links.json
out_file = Path("scratch/all_presentation_links.json")
out_file.parent.mkdir(exist_ok=True)
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(all_extracted_links, f, indent=2, ensure_ascii=False)

print(f"  ✓ Saved link audit dataset to {out_file}")
