import pickle

slovník = {
    'seznam': [1, 2, 3, range(3)],
    12: "Ahoj, světe!",
}

with open('test1.pickle', mode='bw') as f:
    pickle.dump(slovník, f)
