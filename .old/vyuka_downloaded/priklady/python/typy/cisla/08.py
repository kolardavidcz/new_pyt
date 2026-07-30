# vstup
ns = input('Zadejte číslo v binárním tvaru: ')

# výpočet
vysledek = 0
for i in ns:
    vysledek *= 2
    vysledek += int(i)
print( '{0} binárně = {1} desítkově'.format(ns, vysledek) )
