import random

rozsah = range(8)

with open('6_binary_random_txt.ppm', mode='w', encoding='latin-1') as f:
    # hlavička
    f.write('P6\n')
    f.write('8 8\n')
    f.write('255 ')   # Tady musí být jeden bílý znak, tedy jeden bajt. \n se na Windows ovšem automaticky přeloží na bajty dva...
    # data
    for i in rozsah:
        for j in rozsah:
            f.write( chr(random.randint(0, 255)) )
            f.write( chr(random.randint(0, 255)) )
            f.write( chr(random.randint(0, 255)) )
