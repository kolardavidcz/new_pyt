
text = ''
with open('example.2.txt', mode='r', encoding='utf-8') as f:
    text = f.read()

# a) A != a
text_po_slovech = text.split()
print( set(text_po_slovech), len( text_po_slovech ) )

# b) A == a
text_po_slovech_v_malych_pismenech = text.lower().split()
print( set( text_po_slovech_v_malych_pismenech ), len( text_po_slovech_v_malych_pismenech ) )

# c) pryč s interpunkcí
import string
text2 = [ slovo.strip(string.punctuation) for slovo in text_po_slovech_v_malych_pismenech ]
print( set(text2), len(text2) )
