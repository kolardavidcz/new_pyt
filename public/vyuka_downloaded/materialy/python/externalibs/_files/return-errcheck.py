import ctypes
import sys

if sys.platform == 'linux':
    libc = ctypes.CDLL('libc.so.6')
else:
    libc = ctypes.CDLL('msvcrt')

printf = libc.printf

def check_return_code(result, foreign_function, args):
    print('Calling `printf` returned error info:')
    print('   ~ return value:', result)
    print('   ~ foreign function reference:', foreign_function)
    print('   ~ calling arguments:', args)

printf.argtypes = [ctypes.c_char_p, ctypes.c_int]
printf.errcheck = check_return_code

printf(b"%d bottles of beer\n", 42)
