class A:
    def mtd(self):
        print('A')

class B:
    def mtd(self):
        print('B')

class C:
    def mtd(self):
        print('C')

class D(A, B, C):
    def mtd(self):
        super().mtd()

p = D()
p.mtd() # A
