# Ondřej Hubáček

def vyrob_seznam(*args):
    # 'args' je sice n-tice, ale sorted() si s tím poradí
    return sorted(args)

print( vyrob_seznam(1, 2, 3) )
print( vyrob_seznam(4, 5, 6, 1, 2, 3) )
print( vyrob_seznam('a', 'b', 'a', 'c') )
