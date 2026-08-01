xs = [ 1, 2, 3, 4, 5 ]
print(xs)

while True:
    try:
        x = xs.pop(0)
    except IndexError:
        break
print(xs)
