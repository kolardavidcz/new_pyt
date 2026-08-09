import json
import os

def split_week(week_num, num_parts=2):
    path = f"scratch/quiz_input_w{week_num}.json"
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    total = len(data)
    chunk_size = (total + num_parts - 1) // num_parts
    
    for i in range(num_parts):
        part_data = data[i*chunk_size : (i+1)*chunk_size]
        if not part_data:
            continue
        part_letter = chr(ord('a') + i)
        out_path = f"scratch/quiz_input_w{week_num}_{part_letter}.json"
        with open(out_path, "w", encoding="utf-8") as out:
            json.dump(part_data, out, ensure_ascii=False, indent=2)
        print(f"Created {out_path} with {len(part_data)} decks")

# Split large weeks
split_week(0, 2)   # 11 decks -> 6 + 5
split_week(9, 2)   # 9 decks -> 5 + 4
split_week(99, 3)  # 20 decks -> 7 + 7 + 6
