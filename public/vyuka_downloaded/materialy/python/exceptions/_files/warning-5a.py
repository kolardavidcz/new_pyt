import warnings

def stará_funkce():
    warnings.warn(
        'Tato funkce je určena k vyřazení, použijte novější.'
    )

def funkce():
    stará_funkce()

funkce()
