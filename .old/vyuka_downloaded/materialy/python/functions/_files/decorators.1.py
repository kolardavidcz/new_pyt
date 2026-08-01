
def sečti(fn):
    def wrapper(*args, **kwargs):
        return [sum( fn(*args, **kwargs) )]
    return wrapper

def umocni(fn):
    def wrapper(*args, **kwargs):
        return [x**2 for x in fn(*args, **kwargs)]
    return wrapper

# výstup 1: filtruj
def filtruj(xs, n):
    return [x for x in xs if x < n]
print( filtruj([5, 14, 7, 3, 23, 4, 17, 6, 11], 10) )

print()

# výstup 2a: sečti(filtruj)
@sečti
def filtruj(xs, n):
    return [x for x in xs if x < n]
print( filtruj([5, 14, 7, 3, 23, 4, 17, 6, 11], 10) )

print()

# výstup 2b: umocni(filtruj)
@umocni
def filtruj(xs, n):
    return [x for x in xs if x < n]
print( filtruj([5, 14, 7, 3, 23, 4, 17, 6, 11], 10) )

print()

# výstup 3a: umocni(sečti(filtruj))
@umocni
@sečti
def filtruj(xs, n):
    return [x for x in xs if x < n]
print( filtruj([5, 14, 7, 3, 23, 4, 17, 6, 11], 10) )

print()

# výstup 3b: sečti(umocni(filtruj))
@sečti
@umocni
def filtruj(xs, n):
    return [x for x in xs if x < n]
print( filtruj([5, 14, 7, 3, 23, 4, 17, 6, 11], 10) )

print()
