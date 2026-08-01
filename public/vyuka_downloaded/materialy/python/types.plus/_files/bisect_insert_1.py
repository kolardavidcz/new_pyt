#!/usr/bin/env python3
# encoding: utf-8

import timeit
 
# A1)
print('Třídění seznamu po každém vložení:')
code = """
for i in range(1000):
    x = random.randint(100,999)
    xl.append(x)
    xl.sort()
"""
setup = """
import random
random.seed(1)
xl = []
"""
t = timeit.Timer(code, setup)
out = t.repeat(10, 1)
print( min(out) )
 
# B)
print('Modul bisect:')
code = """
for i in range(1000):
    x = random.randint(100,999)
    bisect.insort(xl, x)
"""
setup = """
import bisect
import random
random.seed(1)
xl = []
"""
t = timeit.Timer(code, setup)
out = t.repeat(10, 1)
print( min(out) )
