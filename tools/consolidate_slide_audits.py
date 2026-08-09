import json
from pathlib import Path

with open("data/slides.json", encoding="utf-8") as f:
    slides_data = json.load(f)

updated_count = 0
skip_count = 0

for i in range(1, 6):
    res_path = Path(f"scratch/slide_audit_result_{i}.json")
    if not res_path.exists():
        print(f"Result file {res_path} does not exist yet.")
        continue
    
    with open(res_path, encoding="utf-8") as rf:
        bdata = json.load(rf)
    
    evals = bdata.get("evaluations", {})
    for key, sval in evals.items():
        if key in slides_data or True:
            slides_data[key] = {
                "relevance": sval["relevance"],
                "tags": sval["tags"]
            }
            updated_count += 1
            if "Skip" in sval["tags"]:
                skip_count += 1

print(f"Consolidated slide audit results from completed batches.")
print(f"Total slide keys updated: {updated_count}")
print(f"Total slides tagged 'Skip': {skip_count}")

# Save updated slides.json to data/slides.json AND public/data/slides.json
with open("data/slides.json", "w", encoding="utf-8") as f:
    json.dump(slides_data, f, indent=2, ensure_ascii=False)

with open("public/data/slides.json", "w", encoding="utf-8") as f:
    json.dump(slides_data, f, indent=2, ensure_ascii=False)

print("Saved updated slides.json to data/ and public/data/!")
