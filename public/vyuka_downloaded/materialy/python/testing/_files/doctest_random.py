import random

def funkce(n):
    """Vrací náhodné číslo mezi 0 a `n`.
    
    >>> funkce(3)   # doctest: +SKIP
    2
    """
    return random.randint(0, n)
