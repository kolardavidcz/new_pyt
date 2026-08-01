
with open('1_binary.ppm', 'bw') as f:
    f.write(b'P6 256 256 255 ')
    řádek = bytearray()
    for i in range(256):
        řádek.extend( [i]*3 )
    #print(řádek)
    for i in range(256):
        f.write(řádek)
