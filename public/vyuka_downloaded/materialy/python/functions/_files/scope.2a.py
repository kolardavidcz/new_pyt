# toto je proměnná 'x' na globální úrovni
x = 'vnější'

def outer():
    # toto je proměnná 'x' na místní úrovni funkce 'outer'
    x = 'vnitřní'
    print(x)
     
    def inner():
        # toto je proměnná 'x' na místní úrovni funkce 'inner'
        x = 'vnitřnější'
     
    inner()
    print(x)

print(x)
outer()
print(x)
