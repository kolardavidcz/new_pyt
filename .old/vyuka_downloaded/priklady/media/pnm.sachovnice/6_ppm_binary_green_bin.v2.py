from random import randint

with open('6_binary_green_bin.v2.ppm', 'bw') as f:
    # hlavička
    f.write(b'P6\n')
    f.write(b'8 8\n')
    f.write(b'255\n')
    # data
    for i in range(8):
        for j in range(8):
            f.write( bytes([0]) )
            f.write( bytes([randint(0, 255)]) )
            f.write( bytes([0]) )
