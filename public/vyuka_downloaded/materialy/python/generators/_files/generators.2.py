# z vlastního dalšího subgenerátoru
def subgenerátor():
    for x in 'Ahoj! ':
        yield x
 
def generátor():
    yield from subgenerátor()
 
for x in generátor():
    print(x)
