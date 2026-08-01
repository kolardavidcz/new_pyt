
import string

text1, text2 = '', ''
with open('example.1.txt', mode='r', encoding='utf-8') as f:
    text1 = f.read()
with open('leacock-abc.txt', mode='r', encoding='utf-8') as f:
    text2 = f.read()

# množiny slov bez interpunkce
text1 = { slovo.strip(string.punctuation) for slovo in text1.lower().split() }
text2 = { slovo.strip(string.punctuation) for slovo in text2.lower().split() }

# ANALÝZA
# a) slova v obou textech – průnik
print('text1 & text2 = ', text1 & text2)
# b) všechna možná slova v obou textech – sjednocení
print('text1 | text2 = ', text1 | text2)
# c) slova pouze v prvním textu a slova pouze v druhém textu – rozdíl
print('text1 - text2 = ', text1 - text2)
print('text2 - text1 = ', text2 - text1)
# d) slova buď v jednom nebo pouze v druhém textu – symetrický rozdíl
print('text1 ^ text2 = ', text1 ^ text2)
