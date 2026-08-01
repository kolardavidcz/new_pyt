#!/usr/bin/env python3

def f(xs):
    for i,x in enumerate(xs):
        try:
            následující_prvek = xs[i+1]
        except IndexError:
            return None
        if x == následující_prvek:
            return x

výsledek = f([0,3,4,5,5,4,2,2,4])
print('1.', výsledek)   # 5

výsledek = f([0,3,4,5,4,2,4])
print('2.', výsledek)   # None
