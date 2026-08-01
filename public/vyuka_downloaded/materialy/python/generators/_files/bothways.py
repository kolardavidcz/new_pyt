#!/usr/bin/env python3

def korutina():
    while True:
        print('      { korutina:')
        hodnota = (yield)
        print('                :', hodnota, '}')
        yield hodnota*3
 
k = korutina()
next(k)

for x in 'abcde':
    print(x, ':')
    out = k.send(x)
    print('  :', out)
    input('>\n')
