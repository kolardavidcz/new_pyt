from pathlib import Path
import json

found = []
missing = []

for i in list(range(0, 14)) + [99]:
    p = Path(f"scratch/quiz_output_w{i}.json")
    if p.exists():
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
        q_count = sum(len(qs) for qs in d.get("quizzes", {}).values())
        found.append((i, len(d.get("quizzes", {})), q_count))
    else:
        missing.append(i)

print(f"=== QUIZ GENERATION STATUS ===")
print(f"Completed Weeks ({len(found)}/15):")
for w_num, decks, q_count in found:
    print(f"  • Week {w_num}: {decks} decks, {q_count} questions")

print(f"\nMissing Weeks ({len(missing)}): {missing}")
