#!/usr/bin/env python3

with open('6a.ppm', 'bw') as f:
    f.write(b'P6 256 256 255 ')
    for i in range(256):
        for j in range(256):
            pixel = bytearray( [0, i, j] )
            f.write(pixel)
