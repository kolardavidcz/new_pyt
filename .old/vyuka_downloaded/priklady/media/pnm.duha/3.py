
with open('3.ppm', 'bw') as f:
    f.write(b'P6 256 256 255 ')
    řádek = bytearray()
    for i in range(256):
        řádek.extend( [0, i, 0] )
    #print(řádek)
    for i in range(256):
        f.write(řádek)
