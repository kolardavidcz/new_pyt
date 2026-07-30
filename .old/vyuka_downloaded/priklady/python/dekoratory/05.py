# dekorátor..
def dehtmlize(funkce):
    """Odstraňuje z výstupního textu HTML-značky."""
    def wrapper(*args, **kwargs):
        ret = funkce(*args, **kwargs)
        if isinstance(ret, str):
            import re
            pattern = re.compile(r'</?.*?>', re.IGNORECASE)
            return pattern.sub('', ret)
        else:
            return ret
    return wrapper

# ..a jeho použití

@dehtmlize
def fn(xs):
    return xs

xs = (3, 5, 4)
print( xs, '=>', fn(xs) )
xs = {3, 5, 4}
print( xs, '=>', fn(xs) )
xs = "Ahoj, světe!"
print( xs, '=>', fn(xs) )
xs = "<span class='baf'>Ahoj</span>, <em>světe</em>!"
print( xs, '=>', fn(xs) )
xs = "<span class=\"baf\">Ahoj</span>, <em>s<u>věte</u>!</em>"
print( xs, '=>', fn(xs) )
