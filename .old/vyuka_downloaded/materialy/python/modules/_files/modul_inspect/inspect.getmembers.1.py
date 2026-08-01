import skola
import inspect

alisa = skola.Školák(
      'Алиса Селезнева',
      '2065-11-17',
      '0',
      '3. A',
      {'matematika': 1, 'zeměpis': 1, }
    )
 
for name, value in inspect.getmembers(alisa):
    print( name, ':', value )
