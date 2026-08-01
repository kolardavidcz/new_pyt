x = 1
 
def f1():
    print('2a:', x)
    x = 2
    print('2b:', x)
    def f2():
        print('3:', x)
    f2()
 
f1()
