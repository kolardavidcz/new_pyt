#!/usr/bin/env python3

def f(xs, y):
    ys = []
    try:
        pozice = -1
        while True:
            print(pozice, ys)
            pozice = xs.index(y, pozice + 1)
            ys.append(pozice)
    except ValueError:
        pass
    return ys

výsledek = f([1,2,3,1,2,1,2,4,6,2], 2)
print('1.', výsledek)

výsledek = f([1,2,3,1,2,1,2,4,6,2], 5)
print('2.', výsledek)
