import skola
import inspect
 
info = inspect.getmoduleinfo('skola.py')
print(info)

info = inspect.getmoduleinfo('/usr/lib/python3.1/string.py')
print(info)

info = inspect.getmoduleinfo('/usr/lib/python3.1/string.pyc')
print(info)

info = inspect.getmoduleinfo('/usr/lib/python3.1/lib-dynload/termios.so')
print(info)
