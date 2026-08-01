# dekorátor..
def reverse_args(funkce):
    """Zamění pořadí vstupních pozičních argumentů za opačné."""
    def wrapper(*args, **kwargs):
        reversed_args = reversed(args)
        return funkce(*reversed_args, **kwargs)
    return wrapper

# ..a jeho použití

@reverse_args
def fn(a, b, c):
    return a, b, c

xs = 3, 4, 5
print( xs, '=>', fn(*xs) )
xs = 'a', 'b', 'c'
print( xs, '=>', fn(*xs) )
