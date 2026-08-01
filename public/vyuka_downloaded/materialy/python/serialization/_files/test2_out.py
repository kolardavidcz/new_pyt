import pickle

def funkce():
    return "BAF!"

with open('test2.pickle', mode='br') as f:
    obj = pickle.load(f)

print(obj)
print(obj['fce'])
print(obj['fce']())
print(obj[12])
