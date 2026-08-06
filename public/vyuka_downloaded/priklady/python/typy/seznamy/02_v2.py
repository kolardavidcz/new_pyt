# Petr Kaštánek

def remove_duplicates(xs):
    ret = []
    # generovaný seznam zde slouží pouze pro zkrácený zápis smyčky, sám se nikam dál nepředává
    [ret.append(x) for x in xs if x not in ret]
    return ret

# ukázkové zadání
xs = [1, 2, 3, 1, 2, 1, 2, 4, 6, 2,]
print(xs)
print( remove_duplicates(xs) )
