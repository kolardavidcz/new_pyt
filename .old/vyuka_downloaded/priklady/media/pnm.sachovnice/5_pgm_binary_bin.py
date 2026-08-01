from random import randint

with open('5_binary_bin.pgm', 'bw') as f:
    # hlavička
    f.write(b'P5\n')
    f.write(b'8 8\n')
    f.write(b'255\n')
    # data
    img = bytearray()
    for i in range(8):
        for j in range(8):
            val = randint(0, 255)
            img.append(val)
    f.write( img )
