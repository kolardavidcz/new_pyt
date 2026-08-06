# iterátor..
class Vlastnosti:
    
    def __init__(self, objekt):
        self.vlastnosti = dir(objekt)
        self.index = -1
        
    def __iter__(self):
        return self
        
    def __next__(self):
        self.index += 1
        if self.index == len(self.vlastnosti):
            raise StopIteration
        return self.vlastnosti[self.index]
 
# ..a jeho použití
it = Vlastnosti([])
for v in it:
    print(v)
