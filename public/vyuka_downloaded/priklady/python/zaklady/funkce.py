
# 0.
def faktoriál(n):
    if n == 0:
        return 1
    else:
        return n * faktoriál(n-1)

číslo = input("Zadejte prosím číslo pro výpočet faktoriálu: ")
print( faktoriál( int(číslo) ) )


# 1.
def třetí_mocnina(x):
    return x**3


# 2.
číslo = input("Zadejte prosím číslo pro výpočet třetí mocniny: ")
číslo = float(číslo)
výsledek = třetí_mocnina(číslo)
print( výsledek )


# 3.
def pozdrav(koho):
    return "Ahoj, " + koho + "!"
print( pozdrav('Pirát') )


# 4.
jméno = input("Zadejte prosím Vaše jméno: ")
print( pozdrav(jméno) )


# 5.
print()


# 6.
def vrať_čas():
    import time
    return time.localtime()

čas = vrať_čas()
print( čas )
