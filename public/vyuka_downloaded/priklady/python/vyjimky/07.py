xs = bytearray(b'1223425')
print(xs)

x = b'2'[0]   # remove() očekává int
while True:
    try:
        s = xs.remove(x)
    except ValueError:
        break
print(xs)
