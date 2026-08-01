class Rodič:
    def __init__(self):
        print('Rodič!')

class Potomek(Rodič):
    def __init__(self):
        super().__init__()
        print('Potomek!')

p = Potomek()   # Rodič! & Potomek!
