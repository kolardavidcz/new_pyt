import random

rozsah = range(8)

with open('7_pbm_binary_txt.pbm', mode='w', encoding='latin-1') as f:
    # hlavička
    f.write('P4\n')
    f.write('8 8 ')   # Tady musí být jeden bílý znak, tedy jeden bajt. \n se na Windows ovšem automaticky přeloží na bajty dva...
    # data
    for i in rozsah:
        radka = ''
        for j in rozsah:
            val = (i + j) % 2
            radka += str(val)
        # zjednodušení: víme, že jich je pouze 8, tak z nich uděláme rovnou příslušný bajt
        f.write( chr(int(radka, 2)) )
