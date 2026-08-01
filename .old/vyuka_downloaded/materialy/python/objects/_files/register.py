#!/usr/bin/env python3

from abc import ABCMeta, abstractmethod


class ABCTřída(metaclass=ABCMeta):
    @abstractmethod
    def metoda(self):
        raise NotImplementedError()

         
class Třída():
    def m(self):
        print('Metoda m.')


print( issubclass(Třída, ABCTřída) )    # False

t = Třída()
print( isinstance(t, Třída) )           # True
print( hasattr(t, 'm') )                # True
print( hasattr(t, 'metoda') )           # False

ABCTřída.register(Třída)
print( issubclass(Třída, ABCTřída) )    # True
print( isinstance(t, ABCTřída) )        # True
print( hasattr(t, 'm') )                # True
print( hasattr(t, 'metoda') )           # False

t2 = Třída()                            # žádná výjimka
print( hasattr(t2, 'm') )               # True
print( hasattr(t2, 'metoda') )          # False
