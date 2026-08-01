#!/usr/bin/env python3

def f(xs):
    předchozí_prvek = None
    for x in xs:
        if x == předchozí_prvek:
            return x
        předchozí_prvek = x
    return None

výsledek = f([0,3,4,5,5,4,2,2,4])
print('1.', výsledek)   # 5

výsledek = f([0,3,4,5,4,2,4])
print('2.', výsledek)   # None
