import json
from pathlib import Path

root = Path("public/vyuka_downloaded/materialy")
course_path = Path("data/course.json")

with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

context_lines = []
context_lines.append("==========================================================================")
context_lines.append("DEEP ARCHITECTURAL CONTEXT FOR PRESENTATION LINK RESOLUTION & FIXING")
context_lines.append("==========================================================================\n")

context_lines.append("1. COURSE STRUCTURE & ACTIVE/SHELF LECTURE MANIFEST (course.json):")
for w in course["weeks"]:
    w_title = f"Week {w['week']}: {w['title']}" if w['week'] != 99 else "Week 99: Regál zrušených přednášek (Gray Section)"
    context_lines.append(f"\n--- {w_title} ---")
    for l in w.get("lectures", []):
        context_lines.append(f"  • ID: {l['id']} | Slug: {l['slug']} | Path: {l['path']} | Title: {l['title']}")

context_lines.append("\n==========================================================================")
context_lines.append("2. ALL PRESENTATION HTML FILES ON DISK:")
disk_files = sorted(list(root.rglob("*.html")))
for f in disk_files:
    rel = str(f).replace("\\", "/").replace("public/", "")
    context_lines.append(f"  • {rel}")

context_lines.append("\n==========================================================================")
context_lines.append("3. ALL STATIC ASSETS & EXAMPLE FILES IN _files/ DIRECTORIES:")
asset_files = sorted(list(root.rglob("_files/*")))
for a in asset_files:
    if a.is_file():
        rel = str(a).replace("\\", "/").replace("public/", "")
        context_lines.append(f"  • {rel}")

context_lines.append("\n==========================================================================")
context_lines.append("4. COMPLETE LINK TRANSFORMATION & FIXING ALGORITHM:")
context_lines.append("""
A. ASSET DOWNLOAD LINKS (_files/):
   - Href pattern: Any href containing `_files/<filename>` (e.g., `_files/poznamka.py`, `_files/sachovnice.png`, `_files/pitfalls.1.py`).
   - Fix Type: `asset_download`
   - Fixed Target: Resolved static URL `/vyuka_downloaded/<category>/_files/<filename>`
   - HTML attributes: `target="_blank" rel="noopener noreferrer"`

B. SAME-PRESENTATION SLIDE LINKS:
   - Href pattern: `?slajd=5`, `#id5`, `?slajd=id5`, `current_presentation.xml?slajd=5`
   - Fix Type: `same_presentation`
   - Fixed Target: `#/lecture/<current_lecture_id>?slide=id5`

C. CROSS-PRESENTATION LINKS:
   - Href pattern: `/materialy/...`, `../<category>/<file>.xml`, `http://vyuka.ookami.cz/...`
   - Resolution algorithm:
     1. Strip domain prefix `http://vyuka.ookami.cz/`.
     2. Replace `.xml` extension with `.html`.
     3. Convert legacy filenames (e.g. `xML.encoding.xml` -> `encoding_xML.html`).
     4. Resolve relative path against current lecture directory.
     5. Check against known lecture manifest.
     6. Output target SPA hash: `#/lecture/<lecture_id>?slide=<slide_id>`

D. LEGACY INDEX & SYSTEM LINKS:
   - `/new_order.html` or `new_order.html` -> `#/` (Course Welcome Overview)

E. EXTERNAL LINKS:
   - `http://python.org`, `http://stackoverflow.com/...` -> Keep URL, add `target="_blank" rel="noopener noreferrer"`.
""")

out_path = Path("scratch/deep_context.txt")
out_path.write_text("\n".join(context_lines), encoding="utf-8")
print(f"Generated deep context file: {out_path} ({len(context_lines)} lines)")
