
# pouze ukázkové zadání
mocnenec = 3.14
mocnitel = 15

# proveď „umocňování“
vysledek = 1
while (mocnitel > 0):
    if (mocnitel % 2):
        vysledek *= mocnenec
        mocnitel -= 1
    mocnenec *= mocnenec
    mocnitel /= 2

# vypiš výsledek
txt = "Výsledek: {0}^{1} = {2}".format(3.14, 5, vysledek)
print( txt )
