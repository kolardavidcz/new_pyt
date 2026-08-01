
text = "A jak jsi na tom, co dnes podniknem?"
print(text)

a_count = 0
for letter in text:
  if letter == "a":
    a_count += 1
print( "Písmeno 'a' nalezeno ", a_count, "-krát.", sep='' )
