#!/usr/bin/env python3

def dekorátor(funkce):
    from time import time
    def _dekorátor():
        print('\nSTART:', funkce.__name__)
        t, ret = time(), funkce()
        print('KONEC:', time() - t)
        return ret
    return _dekorátor

@dekorátor
def moje_funkce():
    print('moje funkce')

@dekorátor
def moje_dlouhá_funkce():
    from time import sleep
    print('moje dlouhá funkce')
    sleep(3)

moje_funkce()
moje_dlouhá_funkce()
