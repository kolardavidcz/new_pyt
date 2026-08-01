#!/usr/bin/env python3

"""
Simple demo with multiple subplots.
"""
import numpy as np
import matplotlib.pyplot as plt


# 1. tlumené kmitání
x1 = np.linspace(0.0, 5.0)
y1 = np.cos(2 * np.pi * x1) * np.exp(-x1)
plt.subplot(2, 1, 1)
plt.plot(x1, y1, 'yo-')
plt.title('A tale of 2 subplots')
plt.ylabel('Damped oscillation')

# 2. netlumené kmitání
x2 = np.linspace(0.0, 2.0)
y2 = np.cos(2 * np.pi * x2)
plt.subplot(2, 1, 2)
plt.plot(x2, y2, 'r.-')
plt.xlabel('time (s)')
plt.ylabel('Undamped')

# vykreslení grafu
plt.show()
