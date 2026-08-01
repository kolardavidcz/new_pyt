#!/usr/bin/env python3

import matplotlib.pyplot as plt

# prvočísla
ax, ay = [2, 3, 5, 7, 11, 13, 17, 19], [2, 3, 5, 7, 11, 13, 17, 19]
plt.plot(ax, ay, 'ro')
for x, y in zip(ax, ay):
    plt.annotate(y, xy=(y,y), xytext=(y-0.5, y+0.2))

# 0,1 a složená čísla
plt.plot(
    [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18],
    [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18],
    'g+'
)

# nastavení a popis os
plt.axis([0, 20, 0, 20])
plt.xlabel('pořadí')
plt.ylabel('(prvo)čísla')

# vykreslení grafu
plt.show()
