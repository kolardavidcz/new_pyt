# iterátor..
class NextChar:
    
    def __init__(self, řetězec):
        self.řetězec = řetězec
        self.index = -1
        
    def __iter__(self):
        return self
        
    def __next__(self):
        self.index += 1
        if self.index == len(self.řetězec):
            raise StopIteration
        return self.řetězec[self.index]
 
# ..a jeho použití
it = NextChar('Ahoj!')
for char in it:
    print(char)
