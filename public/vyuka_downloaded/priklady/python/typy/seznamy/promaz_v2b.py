# Jiří Janovec
# (jak obejít trable s iterátorem smyčky for-in)

def smaz_z_pole(pole, co):
    while co in pole:
        pole.pop(pole.index(co))

print('Odstraňujeme prvek 2 (který se neopakuje po sobě):')
xs = [1, 1, 2, 3, 1, 4, 5, 4, 2, 1, 1, 1, 2, 3, 4, 3]
print(xs)
smaz_z_pole(xs, 2)
print(xs)

print()

print('Odstraňujeme prvek 1 (který se opakuje po sobě):')
pole = [1, 1, 2, 3, 1, 4, 5, 4, 2, 1, 1, 1, 2, 3, 4, 3]
print(pole)
smaz_z_pole(pole, 1)
print(pole)

print()

print('Odstraňujeme prvek 6 (který tam vůbec není):')
pole = [1, 1, 2, 3, 1, 4, 5, 4, 2, 1, 1, 1, 2, 3, 4, 3]
print(pole)
smaz_z_pole(pole, 6)
print(pole)
