
# ukázkový vstup
veta = "třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech"

# zpracování
mnozina_ntic = { (slovo, veta.count(slovo)) for slovo in veta.split() }

print(veta)
print(mnozina_ntic)
