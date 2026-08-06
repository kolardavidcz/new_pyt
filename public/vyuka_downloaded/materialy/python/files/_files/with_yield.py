#!/usr/bin/env python3

from contextlib import contextmanager

@contextmanager
def můj_kontext():
    print('\nSpouštím kontext…')
    try:
        yield
    except Exception as ex:
        print('Opouštím kontext s chybou {} .'.format(ex))
    else:
        print('Opouštím kontext bez chyby.')

with můj_kontext():
    print('1. kontext bez chyby')

with můj_kontext():
    print('2. kontext s chybou')
    raise TypeError('CHYBA')
