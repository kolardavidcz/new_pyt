import inspect
from pprint import pprint

def gen():
    yield 1

info = inspect.getfullargspec(gen)
print(info)

print()

info = inspect.getfullargspec(pprint)
print(info)
