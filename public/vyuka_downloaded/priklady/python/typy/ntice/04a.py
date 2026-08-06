
# ukázkový vstup
věta = "třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech"

# zpracování
seznam_slov = věta.split()
množina = []
for slovo in seznam_slov:
    prvek = slovo, seznam_slov.count(slovo)
    if prvek not in množina:
        množina.append(prvek)

print(věta)
print(množina)
