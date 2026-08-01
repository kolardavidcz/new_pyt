
xs = [1, 2, 3, 4, 2, 5, 6, 2, 7, 2, 8, 9, 0]
print(xs)

x = 2
ys = []
for prvek in xs:
    if prvek != x:
        ys.append(prvek)
xs = ys
print(xs)
