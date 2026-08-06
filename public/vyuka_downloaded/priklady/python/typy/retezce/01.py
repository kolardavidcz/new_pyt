
text = "Ahoj, světe!"

for char in text:
  if char.isalpha():
    if char.lower() in "aáeéěiíoóuúůyý":
      print( char, "samohláska" )
    else:
      print( char, "souhláska" )
  else:
    print(char)
