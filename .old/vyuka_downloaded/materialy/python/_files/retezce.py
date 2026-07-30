# proměnná typu řetězec se zavádí pomocí uvozovek
s = "ahoj"
# jejím typem je 'str'
print( type(s) )

# „sečtením“ (složením) dvou řetězců
#    vyrobíme řetězec třetí
print( s + " světe" )

# řetěců se můžeme ptát na jejich délku
#    pomocí vestavěné funkce 'len()'
print( len(s) )

# asi nejzajímavější je však možnost přistupovat k prvkům
#    řetězce podle jejich pořadí..
print( s[0] )
# ..a to dokonce počítáním od konce
print( s[-1] )
