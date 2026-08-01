#!/usr/bin/env python3
# encoding: utf-8

xs = 'Ahoj!'

# vycentrování na 50 znaků tradičně pomocí „center()“
print( '*' + xs.center(50) + '*' )

# vycentrování na 50 znaků pomocí „format()“
print( '*', '{:^50}'.format(xs), '*', sep='' )

# vycentrování na 50 znaků pomocí „format()“ za pomoci doplňkového údaje
print( '*', '{:^{spaces}}'.format(xs, spaces=50), '*', sep='' )
