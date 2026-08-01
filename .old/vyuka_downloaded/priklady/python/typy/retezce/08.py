
text = "Třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech."
char = 'a'
pocet = 0

for ch in text:
    if ch == char:
        pocet += 1

print(text, char)
print(pocet)
