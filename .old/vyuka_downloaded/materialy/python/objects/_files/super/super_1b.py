class A:
    def mtd(self):
        print('A')

class B(A):
    def mtd(self):
        print('B')

class C(B):
    ...


class D(C):
    def mtd(self):
        super().mtd()

p = D()
p.mtd() # B
