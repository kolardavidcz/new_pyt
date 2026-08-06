class A:
    def mtd(self):
        print('A')

class B:
    def mtd(self):
        print('B')

class Potomek(A, B):
    def mtd(self):
        super().mtd()

p = Potomek()
p.mtd() # A
