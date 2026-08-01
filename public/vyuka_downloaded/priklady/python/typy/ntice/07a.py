
import pprint

seznam = []

with open('example.2.txt', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        slova = line.split()
        ntice = i+1, line, len(slova), len(line)
        seznam.append(ntice)

# A) pořadí v souboru
pprint.pprint(seznam)

# B) seřazeno podle počtu slov
seznam2 = sorted( seznam, key=lambda x: x[2] )
pprint.pprint(seznam2)

# C) seřazeno navíc podle počtu písmen
seznam3 = sorted( seznam, key=lambda x: (x[2], x[3]) )
pprint.pprint(seznam3)
