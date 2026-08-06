
xs = [1, 2, 3, 4, 2, 5, 6, 2, 7, 2, 8, 9, 0]
print(xs)

x = 2
for i in range(xs.count(x)):
    xs.remove(x)
print(xs)
