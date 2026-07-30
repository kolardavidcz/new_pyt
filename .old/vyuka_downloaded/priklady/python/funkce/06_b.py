
def vyrob_seznam(*args, key=None):
    if key != None:
        assert callable(key) == True
        return sorted(args, key=key)
    else:
        return sorted(args)

print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a')) )
print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a'), key=lambda x: x[0]) )
print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a'), key=lambda x: x[1]) )
print( vyrob_seznam((2, 'b'), (1, 'c'), (3, 'a'), key='ahoj') )
