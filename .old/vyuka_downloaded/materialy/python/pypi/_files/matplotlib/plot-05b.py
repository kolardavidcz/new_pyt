#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt

# (implementační) podčásti grafu
fig, osy = plt.subplots(constrained_layout=True)

# graf funkce cosinus
POINTS = 50
x = np.linspace(0.0, 2 * np.pi, num=POINTS)
y = np.cos(x)
osy.plot(x, y, 'r.-')

# osa y a první osa x dole
osy.set_xlim(0, 2 * np.pi)
osy.set_ylim(-1, 1)
osy.set_xticks(ticks=[0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi], labels=['0', 'π/2', 'π', '3π/2', '2π'])
osy.set_xlabel('úhel (rad)')
osy.set_ylabel('amplituda')

# druhá osa X nahoře
osax2 = osy.secondary_xaxis('top')
osax2.set_xticks(ticks=osy.get_xticks(), labels=[0, 90, 180, 270, 360])
osax2.set_xlabel('úhel (°)')

# vykreslení grafu
osy.grid(linestyle='dotted')
plt.show()
