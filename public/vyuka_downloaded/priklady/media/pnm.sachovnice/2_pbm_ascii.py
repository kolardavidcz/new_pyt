
with open('2_ascii.pbm', 'w') as f:
    # hlavička
    f.write('P1\n')
    f.write('100 100\n')
    # data
    img = ''
    for i in range(100):
        for j in range(100):
            val = (i + j) % 2
            img += str(val) + ' '
        img += '\n'
    f.write( img )
