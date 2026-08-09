import json
import os

print("Checking production data files...")
with open("data/course.json", encoding="utf-8") as f:
    c = json.load(f)
    print(f"data/course.json valid: {len(c.get('weeks', []))} weeks loaded.")

with open("data/quizzes.json", encoding="utf-8") as f:
    q = json.load(f)
    print(f"data/quizzes.json valid: {len(q)} presentation quiz sets loaded.")

ref_files = os.listdir("data/source_reference")
print(f"data/source_reference/ safely preserved: {len(ref_files)} reference files.")
