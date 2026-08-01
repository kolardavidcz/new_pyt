#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# example data
mu = 100    # mean of distribution
sigma = 15  # standard deviation of distribution
x = mu + sigma * np.random.randn(10000)

# the histogram of the data
num_bins = 50
n, bins, patches = plt.hist(x, num_bins, density=True, facecolor='green', alpha=0.5)

# add a 'best fit' line
y = stats.norm.pdf(bins, mu, sigma)
plt.plot(bins, y, 'r--')

plt.xlabel('Smarts')
plt.ylabel('Probability')
plt.title(r'Histogram of IQ: $\mu=100$, $\sigma=15$')

# Tweak spacing to prevent clipping of ylabel
plt.subplots_adjust(left=0.15)
plt.show()
