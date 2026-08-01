from functools import singledispatch

# základ generické funkce
@singledispatch
def funkce(argument):
    print('Můj argument:', argument)

# dekorace podle typu v anotaci
@funkce.register
def _(argument: int | float):
    print('Argumentem je 1D-číslo:', argument)

# dekorace podle explicitně uvedeného typu
@funkce.register(complex)
def _(argument):
    print('Argumentem je 2D-číslo:', argument.real, argument.imag)

# testy
funkce(3)
funkce(3.14)
funkce(3 + 2j)
funkce('Ahoj!')
