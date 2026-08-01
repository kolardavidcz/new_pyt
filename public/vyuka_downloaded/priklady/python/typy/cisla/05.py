
# vstup
n = int( input('Zadejte celé číslo: ') )

# výpočet
f = 1
for i in range(2,n+1):
    f *= i

# vypiš výsledek
print( 'Výsledek: {0}! = {1}'.format(n, f) )
