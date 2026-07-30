# dekorátor..
def sort_return_list(funkce):
    """Výstupní seznam (ale pouze seznam) setřídí."""
    def wrapper(*args, **kwargs):
        ret = funkce(*args, **kwargs)
        if isinstance(ret, list):
            return sorted(ret)
        else:
            return ret
    return wrapper

# ..a jeho použití

@sort_return_list
def fn(xs):
    return xs

xs = (3, 5, 4)
print( xs, '=>', fn(xs) )
xs = [3, 5, 4]
print( xs, '=>', fn(xs) )

xs = {'c', 'b', 'a'}
print( xs, '=>', fn(xs) )
xs = ['c', 'b', 'a']
print( xs, '=>', fn(xs) )
