from functools import singledispatch
from pprint import pprint

@singledispatch
def funkce(argument):
    print('Můj argument:', argument)

@funkce.register(int)
@funkce.register(float)
def _(argument):
    print('Polovina čísla:', argument / 2)

# dotazy
pprint(funkce.registry)
print(funkce.registry[float])
