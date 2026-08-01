from random import randint

with open('3_ascii.pgm', 'w') as f:
    # hlavička
    f.write('P2\n')
    f.write('8 8\n')
    f.write('255\n')
    # data
    img = ''
    for i in range(8):
        for j in range(8):
            val = randint(0, 255)
            img += str(val) + ' '
        img += '\n'
    f.write( img )
