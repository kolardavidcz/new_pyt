class Rodič:
    def __init__(self):
        print('Rodič!')

class Potomek(Rodič):
    def __init__(self):
        print('Potomek!')

p = Potomek()   # Potomek!
