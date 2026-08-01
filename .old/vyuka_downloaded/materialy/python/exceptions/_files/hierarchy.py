#!/usr/bin/env python3

print('ArithmeticError → ZeroDivisionError')
try:
    1 / 0
except ArithmeticError as e:
    print('ArithmeticError:', e, type(e))
except ZeroDivisionError as e:
    print('ZeroDivisionError:', e, type(e))

print('\nZeroDivisionError → ArithmeticError')
try:
    1 / 0
except ZeroDivisionError as e:
    print('ZeroDivisionError:', e, type(e))
except ArithmeticError as e:
    print('ArithmeticError:', e, type(e))
