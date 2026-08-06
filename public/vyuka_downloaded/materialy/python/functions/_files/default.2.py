
def f(x, xs=None):
    if xs is None:
        xs = []
    xs.append(x)
    return xs

print( f(1) )
print( f(2) )
print( f(3) )
