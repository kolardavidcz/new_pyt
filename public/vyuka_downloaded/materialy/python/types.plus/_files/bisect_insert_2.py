#!/usr/bin/env python3
# encoding: utf-8

import timeit
 
# A2)
print('Třídění seznamu na konci:')
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
