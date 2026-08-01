
with open('7_pbm_binary_bin.v2.pbm', 'bw') as f:
    # hlavička
    f.write(b'P4\n')
    f.write(b'8 8\n')
    # data
    for i in range(8):
        radka = ''
        for j in range(8):
            val = (i + j) % 2
            radka += str(val)
        # zjednodušení: víme, že jich je pouze 8, tak z nich uděláme rovnou příslušný bajt
        f.write( bytes([int(radka, 2)]) )
