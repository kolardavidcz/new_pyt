
LIMIT = 13

a, b = 0, 1
for i in range(LIMIT):
    print(b, end=' ')
    a, b = b, a+b
