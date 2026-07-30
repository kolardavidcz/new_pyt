#!/usr/bin/env python3

import matplotlib.pyplot as plt
import numpy as np

plt.xticks([])
plt.yticks([])

ar = np.array([
    [1,0,1],
    [0,1,0],
    [1,0,1],
])

img = plt.imshow(ar)
plt.pause(0.5)

while True:
    ar ^= 1
    img.set_data(ar)
    plt.pause(0.5)
