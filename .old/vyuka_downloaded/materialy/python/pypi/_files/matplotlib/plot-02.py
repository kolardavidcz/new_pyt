#!/usr/bin/env python3

import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4, 5, 6, 7], [2, 3, 5, 7, 11, 13, 17], 'ro')
plt.axis([0, 8, 0, 20])
plt.xlabel('pořadí')
plt.ylabel('přirozená čísla')
plt.show()
