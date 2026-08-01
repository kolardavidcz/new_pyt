xs = { 1: 'jedna', 2: 'dvě', 3: 'tři', 4: 'čtyři', 5: 'pět', }
print(xs)

while True:
    try:
        key, item = xs.popitem()
    except KeyError:
        break
print(xs)
