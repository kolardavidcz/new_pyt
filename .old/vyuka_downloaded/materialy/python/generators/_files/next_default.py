xs = '''
1. řádka
2. řádka
3. řádka
'''.strip().split('\n')

it = iter(xs)

while (řádek := next(it, None)) is not None:
    print(řádek)
