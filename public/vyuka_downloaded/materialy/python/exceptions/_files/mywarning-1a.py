
class MyWarning(Warning):
    pass

try:
    raise MyWarning('Ahoj ^_~')
except MyWarning as warn:
    print('Varování!', warn)
