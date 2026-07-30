import ctypes
import sys

if sys.platform == 'linux':
    libc = ctypes.CDLL('libc.so.6')
else:
    libc = ctypes.CDLL('msvcrt')

printf = libc.printf

def check_return_code(value):
    print('Calling `printf` returned value:', value)
    return value

printf.argtypes = [ctypes.c_char_p, ctypes.c_int]
printf.restype = check_return_code

printf(b"%d bottles of beer\n", 42)
