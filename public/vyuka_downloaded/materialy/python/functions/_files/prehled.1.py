x = 1

def f1():
    x = 2
    def f2():
        x = 3
        def f3():
            global x
            x = 4
        print('3:', x)
        f3()
        print('3:', x)
    print('2:', x)
    f2()
    print('2:', x)

print('1:', x)
f1()
print('1:', x)
