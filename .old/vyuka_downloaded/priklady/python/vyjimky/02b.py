
xs = [1, 2, 3, 4, 2, 5, 6, 2, 7, 2, 2, 8, 9, 0]
print(xs)

x = 2
while True:
    try:
        i = xs.index(x)
        del xs[i]
    except ValueError:
        break
print(xs)
