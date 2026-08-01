from random import randint

with open('4_ascii_random.ppm', 'w') as f:
    # hlavička
    f.write('P3\n')
    f.write('8 8\n')
    f.write('255\n')
    # data
    img = ''
    for i in range(8):
        for j in range(8):
            img += str(randint(0, 255)) + ' ' + str(randint(0, 255)) + ' ' + str(randint(0, 255)) + ' '
        img += '\n'
    f.write( img )
