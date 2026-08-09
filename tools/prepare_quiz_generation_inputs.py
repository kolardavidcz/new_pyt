import json
import re
from pathlib import Path
from collections import defaultdict

with open("data/course.json", encoding="utf-8") as f:
    course = json.load(f)

def extract_full_presentation(file_path):
    p = Path(file_path)
    if not p.exists():
        p = Path("public") / file_path
    if not p.exists():
        return {"slides": []}
    
    content = p.read_text(encoding="utf-8", errors="ignore")
    sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\'][^>]*>(.*?)</section>', content, re.DOTALL | re.I)
    
    slides = []
    for sid, body in sections:
        h_match = re.search(r'<h[1-6][^>]*>(.*?)</h[1-6]>', body, re.DOTALL | re.I)
        title = re.sub(r'<[^>]+>', '', h_match.group(1)).strip() if h_match else ""
        
        code_blocks = re.findall(r'<pre[^>]*><code[^>]*>(.*?)</code></pre>', body, re.DOTALL | re.I)
        clean_code = [re.sub(r'<[^>]+>', '', c).strip() for c in code_blocks]
        
        clean_text = re.sub(r'<[^>]+>', ' ', body)
        clean_text = ' '.join(clean_text.split())
        
        slides.append({
            "id": sid,
            "title": title,
            "text": clean_text,
            "code_blocks": clean_code
        })
    return {"slides": slides}

week_decks = defaultdict(list)

for w in course["weeks"]:
    w_num = w.get("week", 99)
    for l in w.get("lectures", []):
        fpath = l["path"]
        slug = l["slug"]
        info = extract_full_presentation(fpath)
        week_decks[w_num].append({
            "id": l["id"],
            "title": l["title"],
            "slug": slug,
            "path": fpath,
            "relevance": l.get("relevance", 5),
            "slides": info["slides"]
        })

print(f"Loaded presentations for {len(week_decks)} weeks.")

chunk_count = 0
for w_num, decks in sorted(week_decks.items()):
    # Chunk into up to 5 decks per subagent prompt chunk
    MAX_DECKS_PER_CHUNK = 5
    chunks = [decks[i:i + MAX_DECKS_PER_CHUNK] for i in range(0, len(decks), MAX_DECKS_PER_CHUNK)]
    
    for c_idx, chunk_items in enumerate(chunks):
        suffix = chr(ord('a') + c_idx) if len(chunks) > 1 else ""
        chunk_id = f"w{w_num}{suffix}"
        out_file = f"scratch/quiz_input_{chunk_id}.json"
        
        chunk_data = {
            "chunk_id": chunk_id,
            "week": w_num,
            "decks": chunk_items
        }
        with open(out_file, "w", encoding="utf-8") as out_f:
            json.dump(chunk_data, out_f, indent=2, ensure_ascii=False)
        chunk_count += 1
        print(f"Chunk {chunk_id}: {len(chunk_items)} deck(s) -> {out_file}")

print(f"Total merged quiz generation chunks created: {chunk_count}")
