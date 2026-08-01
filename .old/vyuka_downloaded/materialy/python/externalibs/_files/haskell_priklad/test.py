#!/usr/bin/env python3

from ctypes import cdll
from ctypes import c_int, c_float, c_char_p
from ctypes import *

mylib = cdll.LoadLibrary('mylib.dll')
mylib.HsStart()

api = {
    # func name restype argtypes
    'adder' : (c_int, [c_int, c_int]),
    'subtractor': (c_float, [c_float, c_float]),
    'factorial' : (c_int, [c_int]),
    'hello' : (c_char_p, [c_char_p]),
    'mystring' : (c_char_p, []),
}
for func in api:
    f = getattr(mylib, func)
    f.restype, f.argtypes = api[func]

print( mylib.adder(1, 2) )
print( mylib.subtractor(10.5, 2.5) )
print( mylib.factorial(10) )
print( mylib.hello( 'hello'.encode('ascii') ) )
print( mylib.mystring() )

mylib.HsEnd()
