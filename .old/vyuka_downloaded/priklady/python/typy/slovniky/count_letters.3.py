
import pprint

text = ''
with open('leacock-abc.txt', mode='r', encoding='utf-8') as f:
    text = f.read().lower()

statistika = {}
pismen = 0
for znak in text:
    if not znak.isalpha():
        continue
    if znak not in statistika:
        statistika[znak] = 1
    else:
        statistika[znak] += 1
    pismen += 1

for klic in statistika:
    tmp = statistika[klic]
    statistika[klic] = tmp, (tmp / pismen) * 100

pprint.pprint(statistika)
