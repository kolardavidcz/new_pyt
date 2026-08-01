
text = ''
with open('example.2.txt', mode='r', encoding='utf-8') as f:
    text = f.read()

print( set(text) )
print( set(text.lower()) )
