#!/usr/bin/env python3

class MůjKontext:
    
    def __enter__(self):
        print('\nSpouštím kontext…')
    
    def __exit__(self, typ, hodnota, traceback):
        print('Opouštím kontext…')
        if typ is None:
            print('…bez chyby.')
        else:
            print('…s chybou {} .'.format(hodnota))
        return True


with MůjKontext():
    print('1. kontext bez chyby')

with MůjKontext():
    print('2. kontext s chybou')
    raise TypeError('CHYBA')
