# čísla pro porovnávání
x = 1
y = 2
z = 3

# několik přípravných testů
print( x < y )   # True
print( x > y )   # False
print( y < z )   # True
print( y > z )   # False

print()   # prázdná řádka na výpisu

# A)
# operátory porovnání mají vyšší prioritu
#    než operátor konjunkce..
vysledek = x < y and x < z   # True and True
print( vysledek )
# ..takže v tomto případě závorky kód „pouze“ zčitelní
vysledek = (x < y) and (y < z)   # (True) and (True)
print( vysledek )

print()   # prázdná řádka na výpisu

# B) 
# operátor OR má nižší prioritu než operátor AND..
vysledek = (x > y) and (y > z) or True
#         ((False) and (False)) or True
print( vysledek )
# ..takže zde uzávorkování změní smysl výrazu
vysledek = (x > y) and (y > z or True)
#          (False) and (False or True)
print( vysledek )
