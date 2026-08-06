from functools import singledispatch

# základ generické funkce
@singledispatch
def funkce(argument):
    print('Můj argument:', argument)

@funkce.register(int)
@funkce.register(float)
def _(argument):
    print('Polovina čísla:', argument / 2)

# testy
funkce(3)
funkce(3.02)
