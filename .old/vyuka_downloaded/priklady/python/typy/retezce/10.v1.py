
veta = "Příliš žluťoučký kůň úpěl ďábelské ódy."
print(veta)

slova = veta.split()
for i in range( 1, len(slova)+1 ):
    print( slova[-i], end=' ' )
