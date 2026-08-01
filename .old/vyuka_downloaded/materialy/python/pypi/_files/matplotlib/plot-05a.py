#!/usr/bin/env python3

import matplotlib.pyplot as plt

# (implementační) podčásti grafu
fig, osy = plt.subplots(constrained_layout=True)

# prvočísla
ax, ay = [2, 3, 5, 7, 11, 13, 17, 19], [2, 3, 5, 7, 11, 13, 17, 19]
osy.plot(ax, ay, 'ro', label='prvočísla')
for x, y in zip(ax, ay):
    osy.annotate(y, xy=(y,y), xytext=(y-0.5, y+0.2))

# 0,1 a složená čísla
osy.plot(
    [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18],
    [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18],
    'g+',
    label='složená čísla a 0 s 1'
)

# nastavení a popis os
osy.axis([0, 20, 0, 20])
osy.set_xticks(range(21))
osy.set_yticks(range(21))
osy.grid(linestyle='dotted')
osy.set_xlabel('pořadí')
osy.set_ylabel('(prvo)čísla')

# druhá osa X nahoře
osax2 = osy.secondary_xaxis('top')
osax2.set_xticks(range(21))
osax2.set_xlabel('pořadí')

# vykreslení grafu
osy.legend()
plt.show()
