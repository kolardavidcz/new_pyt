#!/usr/bin/env python3

# uživatelské funkce
def fn1():
    from time import sleep
    sleep(3)

def fn2():
    for x in range(1000000):
        bytes(666)

def fn3():
    fn1()

def fn4(counter=0):
    if counter < 666:
        fn4(counter + 1)

# hlavní program
def main():
    fn1()
    fn2()
    fn3()
    fn4()

if __name__ == '__main__':
    main()
