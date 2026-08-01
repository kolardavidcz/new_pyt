xs = { 1: 'jedna', 2: 'dvě', 3: 'dvě', 4: 'čtyři', 5: 'dvě', }
print(xs)

x = 'dvě'
while x in xs.values():
    for key, item in xs.items():
        if item == x:
            xs.pop(key)
            break
print(xs)
