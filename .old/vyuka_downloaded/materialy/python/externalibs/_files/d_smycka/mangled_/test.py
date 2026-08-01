#!/usr/bin/env python3

from ctypes import cdll

mylib = cdll.LoadLibrary('mylib.dll')
print( dir(mylib), '\n' )

print( mylib, '\n' )
print( mylib._smycka, '\n' )
print( mylib._smycka(1000000), '\n' )
