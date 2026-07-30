class A:
    def mtd(self):
        print('A')

class B:
    def mtd(self):
        print('B')

class Potomek(A, B):
    def mtd(self):
        super(A, self).mtd()

p = Potomek()
p.mtd() # B
