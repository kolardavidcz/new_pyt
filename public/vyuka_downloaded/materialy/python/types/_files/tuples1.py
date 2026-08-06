
def fce(x):
    return x, x**2, x**3

# A) vrácení n-tice
y = fce(2)
print(y)
print( type(y) )

print()   # prázdná řádka pro přehlednost

# B) vrácení a rozbalení n-tice na jednotlivé prvky
prvni, druha, treti = fce(3)
print(prvni, druha, treti)
