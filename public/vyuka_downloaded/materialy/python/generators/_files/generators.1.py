# z objektu, který je sám iterátorem/generátorem
def generátor():
    yield from [x for x in 'Ahoj! ']
 
for x in generátor():
    print(x)
