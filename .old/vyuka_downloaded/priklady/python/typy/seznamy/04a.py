def doubles(xs):
    len_xs = len(xs)
    for i,x in enumerate(xs):
        if i+1 < len_xs and x == xs[i+1]:
            return x
    return None
 
# ukázkové zadání
xs = [0, 3, 4, 5, 5, 4, 2, 2, 4,]
print(xs)
print( doubles(xs) )
 
xs = [0, 3, 4, 5, 4, 2, 4,]
print(xs)
print( doubles(xs) )