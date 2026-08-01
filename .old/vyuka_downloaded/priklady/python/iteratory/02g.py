# generátor..
def lichá_čísla():
    číslo = -1
    while True:
        číslo += 2
        yield číslo

# ..a jeho použití
g = lichá_čísla()
print( next(g) )
print( next(g) )
print( next(g) )
