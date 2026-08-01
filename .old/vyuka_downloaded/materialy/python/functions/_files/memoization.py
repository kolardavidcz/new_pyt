from functools import cache

@cache
def fibonacci(n):
    if n<= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(111))           # 70492524767089125814114
print(fibonacci.cache_info())   # CacheInfo(hits=109, misses=112, maxsize=None, currsize=112)
