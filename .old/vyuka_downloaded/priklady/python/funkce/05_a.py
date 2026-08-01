
def vyrob_seznam(*args):
    xs = list(args)
    xs.sort()
    return xs

print( vyrob_seznam(1, 2, 3) )
print( vyrob_seznam(4, 5, 6, 1, 2, 3) )
print( vyrob_seznam('a', 'b', 'a', 'c') )
