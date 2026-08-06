
def doubles(xs):
    l = len(xs)
    return [x for i, x in enumerate(xs) if i+1 < l and x == xs[i+1] ]

# ukázkové zadání
xs = [0, 3, 4, 5, 5, 4, 2, 2, 4,]
print(xs)
print( doubles(xs) )

xs = [0, 3, 4, 5, 4, 2, 4,]
print(xs)
print( doubles(xs) )
