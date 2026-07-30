
with open('2_ascii.ppm', 'tw', encoding='ascii') as f:
    f.write('P3\n256 256\n255\n')
    řádek = []
    for i in range(256):
        řádek.extend( [str(i)]*3 )
    #print(řádek)
    řádek = ' '.join(řádek) + '\n'
    for i in range(256):
        f.write(řádek)
