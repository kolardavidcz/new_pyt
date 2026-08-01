import pickle

with open('test1.pickle', mode='br') as f:
    obj = pickle.load(f)

print(obj)
print(obj['seznam'])
print(obj[12])
