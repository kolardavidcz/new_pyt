from collections import defaultdict
from time import time

t_start = time()

četnosti = defaultdict(list)
with open('syn2010_word.vyber-ascii.txt') as f:
    for line in f:
        line = line.strip()
        četnosti[len(line)].append(line)

print(time() - t_start)

'''
0.14059162139892578
0.15621089935302734
0.17182517051696777
0.15621733665466309
0.16502714157104492
'''
