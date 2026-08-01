#!/usr/bin/env python3

def generátor():
    yield 1
    yield 2
    return 3
    yield 4

g = generátor()

# 1. yield
print( next(g) )

# 2. yield
print( next(g) )

# 3. return
try:
    print( next(g) )
except StopIteration as ex:
    print('ex.value =', ex.value)
