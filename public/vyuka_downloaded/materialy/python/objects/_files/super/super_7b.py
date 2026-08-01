class A1:
    ...


class A2(A1):
    ...


class B1:
    def mtd(self):
        print('B1')

class B2(B1):
    ...


class C1:
    def mtd(self):
        print('C1')

class C2(C1):
    def mtd(self):
        print('C2')

class D(A2, B2, C2):
    def mtd(self):
        super().mtd()

p = D()
p.mtd() # B1
