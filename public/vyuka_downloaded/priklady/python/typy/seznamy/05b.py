
def doubles(xs):
    ret = []
    i = 0
    for x in xs:
        if i+1 < len(xs) and x == xs[i+1]:
            ret.append(x)
        i = i + 1
    return ret

# ukázkové zadání
xs = [0, 3, 4, 5, 5, 4, 2, 2, 4,]
print(xs)
print( doubles(xs) )

xs = [0, 3, 4, 5, 4, 2, 4,]
print(xs)
print( doubles(xs) )
