xs = bytearray(b'12345')
print(xs)

while True:
    try:
        x = xs.pop()
    except IndexError:
        break
print(xs)
