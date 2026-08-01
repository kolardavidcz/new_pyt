
class Člověk():
    """Objektová reprezentace člověka."""
 
    def __init__(self, jméno, datum_narození, krevní_skupina):
        self.jméno = jméno
        self.datum_narození = datum_narození
        self.krevní_skupina = krevní_skupina


class Školák(Člověk):
    """Objektová reprezentace školáka."""
   
    školáků = 0

    def __init__(self, jméno, datum_narození, krevní_skupina, třída, předměty):
      Člověk.__init__(self, jméno, datum_narození, krevní_skupina)
      #super().__init__(jméno, datum_narození, krevní_skupina)
      self.třída = třída
      self.předměty = předměty
      self.přidej_školáka()

    @classmethod
    def přidej_školáka(cls):
      cls.školáků += 1

    def průměrná_známka(self):
      """Vrací průměr všech známek studenta."""
      součet = 0
      for předmět in self.předměty:
          součet += self.předměty[předmět]
      return součet / len(self.předměty)


class Učitel(Člověk):
    """Objektová reprezentace učitele."""

    def __init__(self, jméno, datum_narození, krevní_skupina, třída, předměty, výplata):
      Člověk.__init__(self, jméno, datum_narození, krevní_skupina)
      #super().__init__(jméno, datum_narození, krevní_skupina)
      self.třída = třída
      self.předměty = předměty
      self.výplata = výplata

