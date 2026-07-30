xs = { 1: 'jedna', 2: 'dvě', 3: 'dvě', 4: 'čtyři', 5: 'dvě', }
print(xs)

x = 'dvě'
xs = {key:item for key,item in xs.items() if item != x}
print(xs)
