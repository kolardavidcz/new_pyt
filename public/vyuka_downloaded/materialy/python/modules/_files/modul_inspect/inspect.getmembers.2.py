import skola
import inspect

alisa = skola.Školák(
      'Алиса Селезнева',
      '2065-11-17',
      '0',
      '3. A',
      {'matematika': 1, 'zeměpis': 1, }
    )

print('Třídy:') 
for name, value in inspect.getmembers(alisa, inspect.isclass):
    print( name, ':', value )

print()

print('Metody:') 
for name, value in inspect.getmembers(alisa, inspect.ismethod):
    print( name, ':', value )

