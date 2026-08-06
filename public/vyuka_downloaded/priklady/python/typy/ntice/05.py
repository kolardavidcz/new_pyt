
seznam = []

with open('example.1.txt', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        ntice = i+1, line
        seznam.append(ntice)

import pprint
pprint.pprint(seznam)
