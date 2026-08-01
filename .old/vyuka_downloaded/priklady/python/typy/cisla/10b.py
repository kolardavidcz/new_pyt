# vstup
ns = input('Zadejte číslo v desítkovém tvaru: ')
 
# výpočet
try:
    výsledek = bin( int(ns) )
    print( '{0} desítkově = {1} binárně'.format(ns, výsledek) )
except:
    print('Zadaný řetězec zřejmě není obrazem čísla v desítkovém tvaru.')
