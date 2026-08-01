#!/usr/bin/env python3

import matplotlib.pyplot as plt
from matplotlib.animation import ArtistAnimation
from time import sleep

plt.ion()   # zapnutí interaktivního režimu
fig = plt.figure()
plt.axis([0, 8, 0, 20])
plt.xlabel('pořadí')
plt.ylabel('přirozená čísla')
fig.show()  # ukaž okno grafu

for i,x in enumerate([2, 3, 5, 7, 11, 13, 17], start=1):
    plt.plot(i, x, 'ro')
    fig.canvas.flush_events()   # vynucení zobrazení průběhu výpočtu v grafu
    sleep(1)                    # zpoždění, ať aspoň něco vidíme

# pozastavení programu, abychom vůbec viděli graf (nemáme tady „plt.show()“)
input()
