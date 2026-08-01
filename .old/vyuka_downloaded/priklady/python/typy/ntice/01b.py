
# Ukázkový vstup
slovo = 'ahojte'

# zpracování
seznam = []
for znak in slovo:
    ntice = znak, ord(znak)
    seznam.append( ntice )

print(slovo)
print(seznam)
