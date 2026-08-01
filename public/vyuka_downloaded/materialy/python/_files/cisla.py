# zde zavádíme dvě (celočíselné) proměnné 'a' a 'b'
#    o hodnotách 5 a 3
a = 5
b = 3
# zde si necháme vypsat jejich součet
print( a + b )

# Typ objektu zjistíme pomocí vestavěné funkce type():
# typ celého čísla je 'int'
print( type(5) )

# některé operace je možno zapsat zkráceně – zde a=a+4
a += 4
print( a )

# Python rozeznává i čísla reálná
c = 1.5
print( c )

# typ reálných čísel je 'float'
#   (součet reálného a celého čísla je číslo reálné)
print( type(c+a) )

# v Python'u je dvojí dělení – „klasické“..
print( 5/2 )
# ..a celočíselné
print( 5//2 )
# ..a dokonce i dělení se zbytkem
print( 5%2 )

# mocnina se zapisuje pomocí dvou hvězdiček
print( 5**2 )
