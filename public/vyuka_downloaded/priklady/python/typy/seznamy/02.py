
def remove_duplicates(xs):
    ret = []
    for x in xs:
        if not x in ret:
            ret.append(x)
    return ret

# ukázkové zadání
xs = [1, 2, 3, 1, 2, 1, 2, 4, 6, 2,]

print(xs)
print( remove_duplicates(xs) )
