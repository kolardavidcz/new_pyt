import inspect
from pprint import pprint

args = inspect.getfullargspec(pprint)
info = inspect.formatargspec(args.args, args.varargs, args.varkw, args.defaults)
print(info)
