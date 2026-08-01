#!/usr/bin/env python3

import matplotlib.pyplot as plt

# prvočísla
ax, ay = [2, 3, 5, 7, 11, 13, 17, 19], [2, 3, 5, 7, 11, 13, 17, 19]
plt.plot(ax, ay, 'ro', label='prvočísla')
for x, y in zip(ax, ay):
    plt.annotate(y, xy=(y,y), xytext=(y-0.5, y+0.2))

# 0,1 a složená čísla
plt.plot(
    [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18],
    [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18],
    'g+',
    label='složená čísla a 0 s 1'
)

# nastavení a popis os
plt.axis([0, 20, 0, 20])
plt.xticks(range(21))
plt.yticks(range(21))
plt.grid(linestyle='dotted')
plt.xlabel('pořadí')
plt.ylabel('(prvo)čísla')

# vykreslení grafu
plt.legend()
plt.show()
