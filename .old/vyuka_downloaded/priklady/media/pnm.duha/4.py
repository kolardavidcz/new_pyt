
with open('4.ppm', 'bw') as f:
    f.write(b'P6 256 256 255 ')
    řádek = bytearray()
    for i in range(256):
        řádek.extend( [i%64, i, i%64] )
    #print(řádek)
    for i in range(256):
        f.write(řádek)
