
def string_until_letter(text, letter):
  if letter in text:
    return text[:text.index(letter)]
  else:
    return text

# ukázkové zadání
txt = "Do you have time?"
ch = "a"
print(txt, ch)
print( string_until_letter(txt, ch) )
