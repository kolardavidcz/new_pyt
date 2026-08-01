import sys

# vstup
ns = input('Zadejte číslo v binárním tvaru: ')

# ověření podmínky
for ch in ns:
    if (ch != '0') and (ch != '1'):
        print( 'Zadaný řetězec není obrazem čísla v binárním tvaru.' )
        sys.exit()

# výpočet
vysledek = 0
for i in ns:
    vysledek *= 2
    vysledek += int(i)
print( '{0} binárně = {1} desítkově'.format(ns, vysledek) )
