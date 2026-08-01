#!/usr/bin/env python3

with open('6b.ppm', 'bw') as f:
    f.write(b'P6 256 256 255 ')
    data = bytearray()
    for i in range(256):
        for j in range(256):
            data.extend( [0, i, j] )
    f.write(data)
