class A:
    def mtd(self):
        print('A')

class B(A):
    def mtd(self):
        print('B')

class C(B):
    def mtd(self):
        print('C')

class D(C):
    def mtd(self):
        super().mtd()

p = D()
p.mtd() # C
