import json
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Load data/exercises.json
ex_path = ROOT / "data" / "exercises.json"
with open(ex_path, "r", encoding="utf-8") as f:
    exercises = json.load(f)

# Load all rated chunks
chunk_files = sorted(glob.glob(str(ROOT / "scratch" / "rated_chunk_*.json")))
print(f"Merging {len(chunk_files)} rated chunk files...")

ratings = {}
for cf in chunk_files:
    with open(cf, "r", encoding="utf-8") as f:
        data = json.load(f)
        ratings.update(data)

print(f"Loaded total {len(ratings)} task ratings from subagents.")

t_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
l_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
updated_tasks = 0

for file_path, ex_data in exercises.items():
    tasks = ex_data.get("tasks", [])
    for task in tasks:
        key1 = f"{file_path}:{task['id']}"
        # Alternative key formats subagents might have used
        key2 = f"{file_path}#{task['id']}"
        key3 = task['id']
        
        rating = ratings.get(key1) or ratings.get(key2) or ratings.get(key3)
        if not rating:
            # Search by task id in values
            for r_k, r_v in ratings.items():
                if task['id'] in r_k:
                    rating = r_v
                    break
        
        if rating:
            t_score = int(rating.get("technical_score", 1))
            l_score = int(rating.get("logical_score", 1))
            reason = rating.get("reason", "")
            
            task["technical_score"] = t_score
            task["logical_score"] = l_score
            task["challenge_score"] = round((t_score + l_score) / 2, 1)
            task["challenge_reason"] = reason
            
            t_counts[t_score] = t_counts.get(t_score, 0) + 1
            l_counts[l_score] = l_counts.get(l_score, 0) + 1
            updated_tasks += 1

print(f"Updated {updated_tasks} tasks in exercises.json!")
print("\nTechnical Difficulty (T) Distribution:")
for k in range(1, 6):
    print(f"  T{k}: {t_counts[k]}")

print("\nInsight Difficulty (L) Distribution:")
for k in range(1, 6):
    print(f"  L{k}: {l_counts[k]}")

with open(ex_path, "w", encoding="utf-8") as f:
    json.dump(exercises, f, ensure_ascii=False, indent=2)

print("\ndata/exercises.json saved successfully!")
