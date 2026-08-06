#!/usr/bin/env python3

with open('5a.ppm', 'bw') as f:
    f.write(b'P6 128 128 254 ')
    for i in range(128):
        for j in range(128):
            pixel = bytearray( [0, 0, i+j] )
            f.write(pixel)
