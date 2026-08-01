
with open('1_ascii.pbm', 'w') as f:
    # hlavička
    f.write('P1\n')
    f.write('8 8\n')
    # data
    img = ''
    for i in range(8):
        for j in range(8):
            val = (i + j) % 2
            img += str(val) + ' '
        img += '\n'
    f.write( img )
