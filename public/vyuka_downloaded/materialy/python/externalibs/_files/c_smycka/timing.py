#!/usr/bin/env python3

import timeit

# A) smyčka v Python'u
kód = """
smycka(1000000)
"""
prostředí = """
def smycka(n):
    i = 0
    while i < n:
        i += 1
    return n
"""
t = timeit.Timer(kód, prostředí)
out = t.repeat(3, 10)
print( "Python:", min(out) )

# B1) smyčka v Céčku
kód = """
smycka(1000000)
"""
prostředí = """
from ctypes import cdll
mylib = cdll.LoadLibrary('mylib.dll')
smycka = mylib.smycka
"""
t = timeit.Timer(kód, prostředí)
out = t.repeat(3, 10)
print( 'C (-O):', min(out) )

# B2) smyčka v Céčku, optimalizovaně
kód = """
smycka(1000000)
"""
prostředí = """
from ctypes import cdll
mylib = cdll.LoadLibrary('mylib3.dll')
smycka = mylib.smycka
"""
t = timeit.Timer(kód, prostředí)
out = t.repeat(3, 10)
print( 'C (-O3):', min(out) )
