import random

rozsah = range(8)

with open('5_binary_txt.pgm', mode='w', encoding='latin-1') as f:
    # hlavička
    f.write('P5\n')
    f.write('8 8\n')
    f.write('255 ')   # Tady musí být jeden bílý znak, tedy jeden bajt. \n se na Windows ovšem automaticky přeloží na bajty dva...
    # data
    for i in rozsah:
        for j in rozsah:
            val = random.randint(0, 255)
            f.write( chr(val) )
