
text = "Třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech."
text_len = len(text)

chars = 'tři'
chars_len = len(chars)

pocet = 0

for i in range( text_len ):
    if text[i:i+chars_len] == chars:
        pocet += 1

print(text, chars)
print(pocet)
