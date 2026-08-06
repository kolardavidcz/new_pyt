import warnings

class MyWarning(FutureWarning):
    pass

print('1')
warnings.warn(MyWarning('Velké varování!'))
print('2')
