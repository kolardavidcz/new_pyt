
import string
import pprint

text = ''
with open('leacock-abc.txt', mode='r', encoding='utf-8') as f:
    text = f.read().split()
text = [ slovo.strip(string.punctuation) for slovo in text ]

statistika = {}
for slovo in text:
    if slovo not in statistika:
        statistika[slovo] = 1
    else:
        statistika[slovo] += 1

pprint.pprint(statistika)

# pro zajímavost ještě seřazeno podle počtu výskytů
print( sorted(statistika, key=lambda x: statistika[x], reverse=True) )
