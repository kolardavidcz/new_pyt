x = 1

def f1():
    x = 2
    print('2:', x)
    def f2():
        print('3:', x)
    f2()

f1()
