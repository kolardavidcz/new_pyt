# toto je proměnná 'x' na globální úrovni
x = 'vnější'

def outer():
    # toto je proměnná 'x' na místní úrovni funkce 'outer'
    x = 'vnitřní'
    print(x)
     
    def inner():
        # díky klíčovému slovu 'nonlocal' odpovídá tato místní
        # proměnná 'x' proměnné stejného jména na úrovni o jednu výš
        nonlocal x
        x = 'vnitřnější'
     
    inner()
    print(x)

print(x)
outer()
print(x)
