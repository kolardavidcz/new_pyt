import pickle

def funkce():
    return 43

slovník = {
    'fce': funkce,
    12: "Ahoj, světe!",
}

with open('test2.pickle', mode='bw') as f:
    pickle.dump(slovník, f)
