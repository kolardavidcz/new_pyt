
LIMIT = 13

def fib(n):
    if n <= 1:
        return n
    else:
        return fib(n-1) + fib(n-2)

for i in range(1, LIMIT+1):
    print( fib(i), end=' ' )
