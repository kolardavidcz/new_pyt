from functools import singledispatch

@singledispatch
def funkce(argument):
    print('Můj argument:', argument)

@funkce.register(int)
@funkce.register(float)
def _(argument):
    print('Polovina čísla:', argument / 2)

# dotazy
print(funkce.dispatch(float))
print(funkce.dispatch(dict))
