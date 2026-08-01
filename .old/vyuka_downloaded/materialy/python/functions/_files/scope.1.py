# toto je proměnná 'hodnota' na globální úrovni
hodnota = 'venku'

def zmena():
    # díky klíčovému slovu 'global' odpovídá tato místní
    # proměnná 'hodnota' proměnné stejného jména na úrovni globální
    global hodnota
    hodnota = 'uvnitř'

print(hodnota)
zmena()
print(hodnota)