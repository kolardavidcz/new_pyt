
def analyzuj(slovo):
    počet_znaků = len(slovo)
    print(slovo, ':', počet_znaků)

xs = "Ahoj, světe! Jak se máš?"

for slovo in xs.split():
    analyzuj(slovo)
