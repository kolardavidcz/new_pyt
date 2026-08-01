from random import randint

with open('6_binary_green_bin.ppm', 'bw') as f:
    # hlavička
    f.write(b'P6\n')
    f.write(b'8 8\n')
    f.write(b'255\n')
    # data
    img = bytearray()
    for i in range(8):
        for j in range(8):
            img.append( int('0') )
            img.append( randint(0, 255) )
            img.append( int('0') )
    f.write( img )
