class A1:
    def mtd(self):
        print('A1')

class A2(A1):
    ...


class B1:
    def mtd(self):
        print('B1')

class B2(B1):
    def mtd(self):
        print('B2')

class D(A2, B2):
    def mtd(self):
        super().mtd()

p = D()
p.mtd() # A1
