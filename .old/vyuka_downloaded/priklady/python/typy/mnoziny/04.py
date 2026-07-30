
import string

text = ''
with open('example.1.txt', mode='r', encoding='utf-8') as f:
    text = f.read()

# množina slov bez interpunkce
délky_slov = { len(slovo.strip(string.punctuation)) for slovo in text.split() }
print(délky_slov)
