from collections import defaultdict
import mmap
from time import time

t_start = time()

četnosti = defaultdict(list)
with open('syn2010_word.vyber-ascii.txt', 'br') as f:
    with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as m:
        while line := m.readline():
            line = line.strip()
            četnosti[len(line)].append(line)

print(time() - t_start)

'''
0.10934829711914062
0.15755462646484375
0.17186713218688965
0.15621495246887207
0.12656044960021973
'''
