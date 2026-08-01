
seznam = []

with open('example.1.txt', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        slova = line.split()
        ntice = i+1, len(slova), len(line), line
        seznam.append(ntice)

import pprint
pprint.pprint(seznam)
