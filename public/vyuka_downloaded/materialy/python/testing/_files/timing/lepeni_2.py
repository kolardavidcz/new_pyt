#!/usr/bin/env python3

import timeit

# A) 
print('Skládání v globálním jmenném prostoru:')
t = timeit.Timer(
"""
for item in txt:
    if item in {'+','-', '.', ',', '[', ']', '<', '>'}:
        data += item
""",
"""
data = ''
txt = open('30kb.b').read()
"""
)
out = t.repeat(10, 1)
print( min(out) )

# B) 
print('Skládání na třídě:')
t = timeit.Timer(
"""
for item in txt:
    if item in {'+','-', '.', ',', '[', ']', '<', '>'}:
        Třída.data += item
""",
"""
txt = open('30kb.b').read()
class Třída:
    data = ''
"""
)
out = t.repeat(10, 1)
print( min(out) )

# C) 
print('Skládání na instanci:')
t = timeit.Timer(
"""
for item in txt:
    if item in {'+','-', '.', ',', '[', ']', '<', '>'}:
        třída.data += item
""",
"""
txt = open('30kb.b').read()
class Třída:
    def __init__(self):
        self.data = ''
třída = Třída()
"""
)
out = t.repeat(10, 1)
print( min(out) )
