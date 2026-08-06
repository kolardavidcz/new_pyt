# iterátor..
class LicháČísla:
    "Iterátor generující lichá čísla."
   
    def __init__(self):
        self.číslo = -1
   
    def __iter__(self):
        return self
   
    def __next__(self):
        self.číslo += 2
        return self.číslo

# ..a jeho použití
lc = LicháČísla()
it = iter(lc)
print( next(it) )
print( next(it) )
print( next(it) )
