# vstup
ns = input('Zadejte číslo v binárním tvaru: ')
 
# výpočet
try:
    výsledek = int(ns, 2)
    print( '{0} binárně = {1} desítkově'.format(ns, výsledek) )
except ValueError:
    print('Zadaný řetězec zřejmě není obrazem čísla v binárním tvaru.')
