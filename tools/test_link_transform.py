import re
import json
from pathlib import Path

root = Path("public/vyuka_downloaded/materialy")
course_path = Path("data/course.json")

with open(course_path, encoding="utf-8") as f:
    course = json.load(f)

# Collect all valid lecture paths in course.json
valid_lecture_paths = set()
for w in course["weeks"]:
    for l in w.get("lectures", []):
        valid_lecture_paths.add(l["path"])

print(f"Total valid active & shelf lectures in course.json: {len(valid_lecture_paths)}")

def resolve_href_to_spa(href, current_file_path):
    # current_file_path e.g. "vyuka_downloaded/materialy/python/types/strings.html"
    base_dir_parts = current_file_path.split("/")[:-1]
    
    if href.startswith("mailto:") or href.startswith("javascript:") or href.startswith("data:"):
        return {"action": "ignore"}

    if re.match(r'^https?://', href) and "ookami.cz" not in href:
        return {"action": "external", "url": href}

    clean = href.replace("http://vyuka.ookami.cz/", "/").replace("https://vyuka.ookami.cz/", "/")

    # Extract slide param
    slide_param = None
    m = re.search(r'[?&]slajd=([^&]+)', clean)
    if m:
        slide_param = m.group(1)
        clean = re.sub(r'[?&]slajd=[^&]+', '', clean)

    hash_frag = ""
    if "#" in clean:
        clean, hash_frag = clean.split("#", 1)

    cur_basename = current_file_path.split("/")[-1]

    # Same presentation link
    if clean == "" or clean == cur_basename or clean.replace(".xml", ".html") == cur_basename:
        slide = slide_param or hash_frag or "id1"
        if not slide.startswith("id") and slide.isdigit():
            slide = f"id{slide}"
        lecture_id = f"lecture:{current_file_path.replace('vyuka_downloaded/', '')}"
        return {"action": "same_pres", "lecture_id": lecture_id, "slide": slide}

    # Home / new_order link
    if clean in ["/new_order.html", "new_order.html", "/index.html"]:
        return {"action": "home"}

    # Cross presentation link
    if clean.endswith(".xml"):
        clean = clean[:-4] + ".html"

    if clean.startswith("/materialy/"):
        target_path = "vyuka_downloaded" + clean
    elif clean.startswith("materialy/"):
        target_path = "vyuka_downloaded/" + clean
    elif clean.startswith("/"):
        target_path = "vyuka_downloaded/materialy" + clean
    else:
        combined = base_dir_parts + clean.split("/")
        norm = []
        for p in combined:
            if p == "..":
                if norm: norm.pop()
            elif p != "." and p != "":
                norm.append(p)
        target_path = "/".join(norm)

    target_id = f"lecture:{target_path.replace('vyuka_downloaded/', '')}"
    slide = slide_param or hash_frag or ""
    if slide and not slide.startswith("id") and slide.isdigit():
        slide = f"id{slide}"

    return {
        "action": "cross_pres",
        "target_path": target_path,
        "target_id": target_id,
        "exists_in_course": target_path in valid_lecture_paths,
        "file_exists": (Path("public") / target_path).exists() or Path(target_path).exists(),
        "slide": slide
    }

# Run audit over all HTML presentation files
same_count = 0
cross_count = 0
ext_count = 0
broken_cross = 0

for html_file in root.rglob("*.html"):
    rel_path = str(html_file).replace("\\", "/").replace("public/", "")
    try:
        content = html_file.read_text(encoding="utf-8", errors="ignore")
        hrefs = re.findall(r'href=["\']([^"\']+)["\']', content)
        for h in hrefs:
            res = resolve_href_to_spa(h, rel_path)
            act = res.get("action")
            if act == "same_pres":
                same_count += 1
            elif act == "cross_pres":
                cross_count += 1
                if not res.get("file_exists"):
                    broken_cross += 1
                    # print(f"Broken cross link in [{rel_path}]: {h} -> {res.get('target_path')}")
            elif act == "external":
                ext_count += 1
    except Exception:
        pass

print(f"\n=== COMPLETE PRESENTATION LINK AUDIT ===")
print(f"  • Same-presentation slide links processed: {same_count}")
print(f"  • Cross-presentation links processed: {cross_count} (Broken file targets: {broken_cross})")
print(f"  • External web links processed: {ext_count}")
