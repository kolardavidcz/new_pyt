import skola
import inspect

def gen():
    yield 1
 
info = inspect.ismodule( skola )
print(info)
 
info = inspect.isclass( skola.Školák )
print(info)
 
info = inspect.isfunction( lambda x: x )
print(info)
 
info = inspect.isgeneratorfunction( gen )
print(info)
