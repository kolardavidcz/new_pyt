#!/usr/bin/env python3

import ctypes

ada_module = ctypes.CDLL("lib/libada_module.so")

ada_module.ada_moduleinit.restype = None
ada_module.ada_moduleinit()

ada_module.say_hello.restype = None
ada_module.say_hello()
for i in range(5):
    ada_module.say_hello()

ada_module.ada_modulefinal.restype = None
ada_module.ada_modulefinal()
