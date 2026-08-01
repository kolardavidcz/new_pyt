#!/usr/bin/env python3

with open('5b.ppm', 'bw') as f:
    f.write(b'P6 128 128 254 ')
    data = bytearray()
    for i in range(128):
        for j in range(128):
            data.extend( [0, 0, i+j] )
    f.write(data)
