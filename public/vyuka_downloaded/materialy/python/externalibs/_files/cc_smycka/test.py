#!/usr/bin/env python3

from ctypes import cdll

mylib = cdll.LoadLibrary('mylib.dll')
print( dir(mylib), '\n' )

print( mylib, '\n' )
print( mylib._Z7smycka1i, '\n' )
print( mylib._Z7smycka1i(1000000), '\n' )
print( mylib.smycka3, '\n' )
print( mylib.smycka3(1000000), '\n' )
