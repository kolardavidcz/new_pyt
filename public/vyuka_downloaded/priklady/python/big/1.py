import pickle
from collections import defaultdict

četnosti = defaultdict(list)

with open('syn2010_word.vyber-ascii.txt') as f:
    for line in f:
        line = line.strip()
        četnosti[len(line)].append(line)
print(len(četnosti))
for k in sorted(četnosti.keys()):
    print(k, len(četnosti[k]))

with open('data.pickle', 'bw') as f:
    pickle.dump(četnosti, f)
