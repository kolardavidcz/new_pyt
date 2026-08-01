class Rodič:
    def __init__(self):
        print('Rodič!')

class Potomek(Rodič):
    pass

p = Potomek()   # Rodič!
