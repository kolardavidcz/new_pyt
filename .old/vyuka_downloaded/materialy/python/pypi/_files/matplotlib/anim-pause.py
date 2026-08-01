#!/usr/bin/env python3

import matplotlib.pyplot as plt

plt.axis([0, 8, 0, 20])
plt.xlabel('pořadí')
plt.ylabel('přirozená čísla')

for i,x in enumerate([2, 3, 5, 7, 11, 13, 17], start=1):
    plt.plot(i, x, 'ro')
    plt.pause(0.3)

plt.show()
