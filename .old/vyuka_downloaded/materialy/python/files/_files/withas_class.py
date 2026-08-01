#!/usr/bin/env python3

class MůjKontext:
    
    def __enter__(self):
        print('\nSpouštím kontext…')
        return 'Haf!', 666
    
    def __exit__(self, typ, hodnota, traceback):
        print('Opouštím kontext…')
        if typ is None:
            print('…bez chyby.')
        else:
            print(f'…s chybou {hodnota} .')
        return True


with MůjKontext() as kontext:
    print('Kontext:', kontext)
