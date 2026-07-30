
# Ukázkový vstup
veta = "Třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech."

# zpracování
seznam_slov = veta.split()
seznam_ntic = [ (slovo, i+1) for i, slovo in enumerate(seznam_slov) ]

print(veta)
print(seznam_ntic)
