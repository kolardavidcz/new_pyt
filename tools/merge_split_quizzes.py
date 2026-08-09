import json
import glob
import re
import os

def merge_parts():
    # Find all quiz_output_w*_*.json
    files = glob.glob("scratch/quiz_output_w*_[a-z].json")
    grouped = {}
    for fpath in files:
        m = re.search(r'quiz_output_w(\d+)_([a-z])\.json', fpath)
        if m:
            week = m.group(1)
            grouped.setdefault(week, []).append(fpath)
    
    for week, fpaths in grouped.items():
        combined_quizzes = {}
        for fp in sorted(fpaths):
            with open(fp, 'r', encoding='utf-8') as f:
                data = json.load(f)
            quizzes = data.get("quizzes", {})
            for k, v in quizzes.items():
                combined_quizzes[k] = v
        
        target = f"scratch/quiz_output_w{week}.json"
        with open(target, 'w', encoding='utf-8') as out:
            json.dump({"quizzes": combined_quizzes}, out, ensure_ascii=False, indent=2)
        print(f"Merged {len(fpaths)} parts into {target} ({len(combined_quizzes)} decks total)")

if __name__ == "__main__":
    merge_parts()
