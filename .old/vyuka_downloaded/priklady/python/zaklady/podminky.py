
x, y = 2, 3

# 1.
if x >= y:
    print(x)
else:
    print(y)


# 2.
if x > y:
    print('číslo', x, 'je větší než číslo', y)
elif x == y:
    print('číslo', x, 'je stejně velké jako číslo', y)
else:
    print('číslo', y, 'je větší než číslo', x)


# 3.
if x < y:
    print('číslo', x, 'je menší než číslo', y)
elif x == y:
    print('číslo', x, 'je stejně velké jako číslo', y)
else:
    print('číslo', y, 'je menší než číslo', x)


# 4.
print( len('Pirát') > len('Pirátovič') )


# 5.
print()


# 6.
print(   False and False  or True  )
print(  (False and False) or True  )
print(   False and (False or True)  )


# 7.
print(   0 and ''  or "Ahoj!"  )
print(  (0 and '') or "Ahoj!"  )
print(   0 and ('' or "Ahoj!")  )
