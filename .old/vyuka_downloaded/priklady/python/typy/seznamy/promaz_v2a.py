# návrh Jiří Janovec
# komentáře Martin Novák

def smaz_z_pole(pole, co):
    # iterátor smyčky je sestaven z původního pole a během výpočtu se nemění
    for i, x in enumerate(pole):
        if x == co:
            # Zde příslušný prvek vždy odstraníme, čímž se PŮVODNÍ pole zmenší o jedničku..
            #   ..a následující index smyčky tak bude o jeden prvek dále.
            # Ale dokud nebudou následovat dva stejné prvky za sebou, vše bude svým..
            #   ..způsobem „fungovat“.
            pole.pop(i)

print('Odstraňujeme prvek 2 (což projde):')
xs = [1, 1, 2, 3, 1, 4, 5, 4, 2, 1, 1, 1, 2, 3, 4, 3]
print(xs)
smaz_z_pole(xs, 2)
print(xs)

print()

print('Odstraňujeme prvek 1 (což neprojde):')
pole = [1, 1, 2, 3, 1, 4, 5, 4, 2, 1, 1, 1, 2, 3, 4, 3]
print(pole)
smaz_z_pole(pole, 1)
print(pole)
