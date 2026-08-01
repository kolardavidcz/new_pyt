# Takhle to už radši nedělejte:

def vyrob_seznam(*args):
    xs = [x for x in args]
    xs.sort()
    return xs

print( vyrob_seznam(1, 2, 3) )
print( vyrob_seznam(4, 5, 6, 1, 2, 3) )
print( vyrob_seznam('a', 'b', 'a', 'c') )
