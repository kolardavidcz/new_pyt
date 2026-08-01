
class Zvíře:
    def promluv(self):
        print("...")

class Kočka(Zvíře):
    def promluv(self):
        print("mňau")

class Pes(Zvíře):
    def promluv(self):
        print("haf")

class Kočkopes(Kočka, Pes):
    pass

class Psokočka(Pes, Kočka):
    pass

# ukázkové výstupy
kp1 = Kočkopes()
kp2 = Psokočka()
kp1.promluv()
kp2.promluv()

print()

import inspect
print( inspect.getmro(Kočkopes) )
print( inspect.getmro(Psokočka) )
