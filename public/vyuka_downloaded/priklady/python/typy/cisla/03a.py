
import math

for n in range(2, 101):
    for x in range( 2, int(math.sqrt(n)) + 1 ):
        if n % x == 0:
            break
    else:
        print(n, end=' ')
