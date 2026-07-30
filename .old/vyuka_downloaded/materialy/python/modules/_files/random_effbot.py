#!/usr/bin/env python3

# http://effbot.org/librarybook/random/random-example-3.py
# (modified for Python 3.x)

import random

histogram = [0] * 20

# calculate histogram for gaussian noise using average=5, stddev=1
for i in range(1000):
    i = int(random.gauss(5, 1) * 2)
    histogram[i] = histogram[i] + 1

# print the histogram
m = max(histogram)
for v in histogram:
    print( "*" * int((v * 50 / m)) )
