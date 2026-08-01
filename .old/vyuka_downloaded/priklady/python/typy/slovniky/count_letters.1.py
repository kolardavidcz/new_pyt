
import pprint

text = ''
with open('leacock-abc.txt', mode='r', encoding='utf-8') as f:
    text = f.read()

statistika = {}
for znak in text:
    # přeskoč nepísmenné znaky
    if not znak.isalpha():
        continue
    # písmena zahrň do slovníku
    if znak not in statistika:
        statistika[znak] = 1
    else:
        statistika[znak] += 1

pprint.pprint(statistika)
