
# Ukázkový vstup
veta = "Třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech."

# zpracování
seznam_slov = veta.split()
seznam_ntic = [ (slovo, len(slovo)) for slovo in seznam_slov ]

print(veta)
print(seznam_ntic)
