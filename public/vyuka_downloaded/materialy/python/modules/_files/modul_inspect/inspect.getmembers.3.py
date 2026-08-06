import skola
import inspect

alisa = skola.Školák(
      'Алиса Селезнева',
      '2065-11-17',
      '0',
      '3. A',
      {'matematika': 1, 'zeměpis': 1, }
    )

def objekt_je_řetězec(objekt):
    return type(objekt) == str

for name, value in inspect.getmembers(alisa, objekt_je_řetězec):
    print( name, ':', value )
