import warnings

def stará_funkce():
    warnings.warn(
        'Tato funkce je určena k vyřazení, použijte novější.',
        stacklevel=2
    )

def funkce():
    stará_funkce()

funkce()
