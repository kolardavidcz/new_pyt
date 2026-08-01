
veta = "Příliš žluťoučký kůň úpěl ďábelské ódy."
print(veta)

slova = veta.split()
for i in range( len(slova), 0, -1 ):
    print( slova[i-1], end=' ' )
