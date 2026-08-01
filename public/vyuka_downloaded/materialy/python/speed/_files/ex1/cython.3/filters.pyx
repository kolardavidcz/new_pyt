#!/usr/bin/env python3
# cython: language_level=3

# Cython nezvládne ne-ASCII znaky v kódu

import numpy as np

#
# aplikace filtru
#
def apply_filter(double [:,:] data, long [:,:] maska, double [:,:] output):
    cdef:
        size_t x, y
        size_t data_w, data_h
        double [:,:] vyrez
        double s
    # rozměry vstupního obrázku
    # ~ Pillow a Numpy mají opačné pořadí
    # ~ Cython nezvládne rozbalit n-tici
    data_w = data.shape[0]
    data_h = data.shape[1]
    # aplikace masky
    for y in range(1, data_h - 2):
        for x in range(1, data_w - 2):
            vyrez = data[x-1:x+2,y-1:y+2]
            # „ruční“ násobení prvků obou polí
            s = 0
            for u in range(3):
                for v in range(3):
                    s += vyrez[u,v] * maska[u,v]
            output[x, y] = s
