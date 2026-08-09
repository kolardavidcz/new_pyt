import json
import glob
from pathlib import Path

master_quizzes = {}
total_questions = 0
total_decks = 0

quizzes_dir = Path("public/data/quizzes")
quizzes_dir.mkdir(parents=True, exist_ok=True)

# Map per-week questions
week_quizzes = {}

for fpath in sorted(glob.glob("scratch/quiz_output_*.json")):
    with open(fpath, encoding="utf-8") as f:
        data = json.load(f)
    
    q_dict = data.get("quizzes", {})
    w_num = data.get("week")
    
    for slug, questions in q_dict.items():
        for q in questions:
            if q.get("type") == "predict_output":
                opts = q.get("options", [])
                if any(len(o) > 35 and any(w in o.lower() for w in ["zatímco", "protože", "znamená", "pomocí", "umožňuje", "přičemž", "automaticky", "obsahuje", "vyžaduje"]) for o in opts):
                    q["type"] = "multiple_choice"

        master_quizzes[slug] = questions
        total_decks += 1
        total_questions += len(questions)
        
        # Attribute to week if available
        if w_num is not None:
            w_key = f"w{w_num}"
            if w_key not in week_quizzes:
                week_quizzes[w_key] = {}
            week_quizzes[w_key][slug] = questions

# Save per-week chunks
for w_key, q_dict in week_quizzes.items():
    with open(quizzes_dir / f"{w_key}.json", "w", encoding="utf-8") as f:
        json.dump(q_dict, f, indent=2, ensure_ascii=False)

print(f"Consolidated quizzes across {total_decks} presentation decks.")
print(f"Total questions generated: {total_questions}")

with open("data/quizzes.json", "w", encoding="utf-8") as f:
    json.dump(master_quizzes, f, indent=2, ensure_ascii=False)

with open("public/data/quizzes.json", "w", encoding="utf-8") as f:
    json.dump(master_quizzes, f, indent=2, ensure_ascii=False)

print("Saved master quizzes dictionary to data/quizzes.json AND public/data/quizzes.json!")
print("Saved per-week quiz chunks to public/data/quizzes/w*.json!")
