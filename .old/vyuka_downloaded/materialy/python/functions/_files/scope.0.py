# toto je proměnná 'hodnota' na globální úrovni
hodnota = 'venku'

def zmena():
    # toto je proměnná 'hodnota' na místní úrovni funkce 'zmena'
    hodnota = 'uvnitř'

print(hodnota)
zmena()
print(hodnota)