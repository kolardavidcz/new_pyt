import json

weeks = [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 99]
for w in weeks:
    path = f'scratch/quiz_input_w{w}.json'
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f'Week {w}: {len(data)} decks')
