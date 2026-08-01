
def indexes(xs, y):
    return [i for i, x in enumerate(xs) if x == y]

# ukázkové zadání
xs = [1, 2, 3, 1, 2, 1, 2, 4, 6, 2,]
n = 2
print(xs, n)
print( indexes(xs, n) )

n = 5
print(xs, n)
print( indexes(xs, n) )
