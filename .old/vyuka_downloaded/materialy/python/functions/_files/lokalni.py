x = 1

def f1(y):
    z = 2
    print('1:', locals())
    def f2():
        print('2:', locals())
    f2()
    def f3():
        x + y + z
        print('3:', locals())
    f3()
 
f1(3)
