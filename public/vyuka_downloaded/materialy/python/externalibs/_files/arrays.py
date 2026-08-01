from ctypes import Structure, c_int, c_float

#
# A) samostatné pole jednoduchého typu
#
PětCelýchČísel = c_int * 5
pcč = PětCelýchČísel(1, 3, 5, 7, 9)
for číslo in pcč:
    print(číslo, end=' ')

#
# B) pole struktury jako prvek jiné struktury
#
class POINT(Structure):
    _fields_ = [("x", c_int),
                ("y", c_int)]

class MyStruct(Structure):
    _fields_ = [("id", c_float),
                ("point_array", POINT * 4)]

print('\n', len(MyStruct().point_array), sep='')
