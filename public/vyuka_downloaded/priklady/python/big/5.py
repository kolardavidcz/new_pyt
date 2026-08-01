import pickle
from time import time

t_start = time()

with open('data.pickle', 'br') as f:
    četnosti = pickle.load(f)

print(time() - t_start)

'''
0.031244993209838867
0.031235694885253906
0.031242847442626953
0.031241893768310547
0.046860694885253906
'''
