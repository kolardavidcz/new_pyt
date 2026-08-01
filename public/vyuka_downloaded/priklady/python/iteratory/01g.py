# generátor..
def nextchar(data):
    for i in range(len(data)):
        yield data[i]
 
# ..a jeho použití
for char in nextchar('Ahoj!'):
    print(char)
