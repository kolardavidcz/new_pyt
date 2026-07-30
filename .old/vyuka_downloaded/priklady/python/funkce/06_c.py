# Vyacheslav Tretyachenko & Dávid Jakubec

def vyrob_seznam(*args, key=None):
    return sorted(args, key=key)    # protože 'None' je skutečné výchozí nastavení pro 'key' u 'sorted'

print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a')) )
print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a'), key=lambda x: x[0]) )
print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a'), key=lambda x: x[1]) )
