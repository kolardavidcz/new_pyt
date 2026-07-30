import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "data" / "exercises.json", "r", encoding="utf-8") as f:
    data = json.load(f)

items = list(data.items())
# Divide 29 files into 10 chunks (~3 files per chunk)
num_chunks = 10
chunk_size = (len(items) + num_chunks - 1) // num_chunks

chunks = []
for i in range(0, len(items), chunk_size):
    chunks.append(dict(items[i:i + chunk_size]))

print(f"Divided {len(items)} files into {len(chunks)} chunks:")
for idx, c in enumerate(chunks):
    n_tasks = sum(len(v.get("tasks", [])) for v in c.values())
    print(f"  Chunk {idx}: {len(c)} files, {n_tasks} tasks")
    out_path = ROOT / "scratch" / f"chunk_{idx}.json"
    with open(out_path, "w", encoding="utf-8") as f_out:
        json.dump(c, f_out, ensure_ascii=False, indent=2)

print("Saved chunk files chunk_0.json .. chunk_9.json successfully!")
