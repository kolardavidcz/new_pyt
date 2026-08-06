xs = { 1, 2, 3, 4, 5 }
print(xs)

while True:
    try:
        item = xs.pop()
    except KeyError:
        break
print(xs)
