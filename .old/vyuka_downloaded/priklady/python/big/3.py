from time import time

t_start = time()

četnosti = {}
with open('syn2010_word.vyber-ascii.txt') as f:
    for line in f:
        line = line.strip()
        l = len(line)
        if l in četnosti:
            četnosti[l].append(line)
        else:
            četnosti[l] = [line]

print(time() - t_start)

'''
0.2342698574066162
0.19629144668579102
0.2030785083770752
0.2030777931213379
0.1874227523803711
'''
