
class Člověk():
    
    def identifikace(self):
        return 'Dobrý den! Jmenuji se Алиса Селезнева.'

print( Člověk )
print( Člověk.identifikace )

print()

alisa = Člověk()
print( alisa )
print( alisa.identifikace )
print( alisa.identifikace() )
