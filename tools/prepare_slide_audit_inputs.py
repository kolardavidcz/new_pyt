import json
import re
from pathlib import Path

with open("data/slides.json", encoding="utf-8") as f:
    slides_data = json.load(f)

def extract_slides_from_html(file_path):
    p = Path(file_path)
    if not p.exists():
        # Try under public/
        p = Path("public") / file_path
    if not p.exists():
        return {}
    content = p.read_text(encoding="utf-8", errors="ignore")
    
    # Extract sections with id
    sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\'][^>]*>(.*?)</section>', content, re.DOTALL | re.I)
    slides_info = {}
    for sid, body in sections:
        # Extract title (h1/h2/h3)
        h_match = re.search(r'<h[1-6][^>]*>(.*?)</h[1-6]>', body, re.DOTALL | re.I)
        title = re.sub(r'<[^>]+>', '', h_match.group(1)).strip() if h_match else ""
        # Clean text snippet
        clean_text = re.sub(r'<[^>]+>', ' ', body)
        clean_text = ' '.join(clean_text.split())[:300]
        slides_info[sid] = {
            "title": title,
            "snippet": clean_text
        }
    return slides_info

batches = {
    1: ["public/vyuka_downloaded/materialy/dvcs/git.html", "public/vyuka_downloaded/materialy/dvcs/git.advanced.html"],
    2: ["public/vyuka_downloaded/materialy/python/numpy/arrays.creation.html"],
    3: ["public/vyuka_downloaded/materialy/python/numpy/arrays.operation.html", "public/vyuka_downloaded/materialy/python/numpy/arrays.slicing.html"],
    4: ["public/vyuka_downloaded/materialy/python/speed/overview.html", "public/vyuka_downloaded/materialy/python/speed/example-1.html"],
    5: ["public/vyuka_downloaded/materialy/python/modules/doctests.html", "public/vyuka_downloaded/materialy/python/modules/times+dates.html", "public/vyuka_downloaded/materialy/python/modules/os.html", "public/vyuka_downloaded/materialy/python/modules/execution_ossystem.html"]
}

for b_num, file_list in batches.items():
    batch_data = []
    for fpath in file_list:
        slug = Path(fpath).stem
        if "git.advanced" in fpath: slug = "git.advanced"
        
        html_slides = extract_slides_from_html(fpath)
        deck_entry = {
            "file": fpath,
            "slug": slug,
            "slides": {}
        }
        for sid, sdata in html_slides.items():
            key = f"{slug}#{sid}"
            curr_val = slides_data.get(key, {})
            deck_entry["slides"][sid] = {
                "title": sdata["title"],
                "snippet": sdata["snippet"],
                "curr_relevance": curr_val.get("relevance", 5),
                "curr_tags": curr_val.get("tags", [])
            }
        batch_data.append(deck_entry)
    
    out_file = f"scratch/slide_audit_batch_{b_num}.json"
    with open(out_file, "w", encoding="utf-8") as out_f:
        json.dump(batch_data, out_f, indent=2, ensure_ascii=False)
    print(f"Wrote batch {b_num} ({len(batch_data)} decks) to {out_file}")
