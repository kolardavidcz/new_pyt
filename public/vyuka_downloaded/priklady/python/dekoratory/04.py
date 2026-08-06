# dekorátor..
def sort_return_list_with_key(keypar):
    """Výstupní seznam (ale pouze seznam) setřídí podle dodaného klíče."""
    def decorator_wrapper(funkce):
        def wrapper(*args, **kwargs):
            ret = funkce(*args, **kwargs)
            if isinstance(ret, list):
                return sorted(ret, key=keypar)
            else:
                return ret
        return wrapper
    return decorator_wrapper

# ..a jeho použití

@sort_return_list_with_key(lambda x: x[0])
def fn1(xs):
    return xs

@sort_return_list_with_key(lambda x: x[1])
def fn2(xs):
    return xs

xs = [(1, 3), (2, 2), (3, 1)]
print( xs, '=>', fn1(xs) )
print( xs, '=>', fn2(xs) )

xs = {(1, 3), (2, 2), (3, 1)}
print( xs, '=>', fn1(xs) )
print( xs, '=>', fn2(xs) )
