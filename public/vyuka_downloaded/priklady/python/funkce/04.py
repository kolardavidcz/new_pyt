
def analyzuj(slovo):
    počet_znaků = len(slovo)
    codepoints = [ord(znak) for znak in slovo]
    print(slovo, ':', počet_znaků, codepoints)

xs = "Ahoj, světe! Jak se máš?"

for slovo in xs.split():
    analyzuj(slovo)
