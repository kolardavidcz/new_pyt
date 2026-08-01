
with open('7_pbm_binary_bin.pbm', 'bw') as f:
    # hlavička
    f.write(b'P4\n')
    f.write(b'8 8\n')
    # data
    img = bytearray()
    for i in range(8):
        radka = ''
        for j in range(8):
            val = (i + j) % 2
            radka += str(val)
        # zjednodušení: víme, že jich je pouze 8, tak z nich uděláme rovnou příslušný bajt
        img.append( int(radka, 2) )
    f.write( img )
