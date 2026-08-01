from ctypes import Structure, c_int

class POINT(Structure):
    _fields_ = [("x", c_int),
                ("y", c_int)]

class RECT(Structure):
    _fields_ = [("upperleft", POINT),
                ("lowerright", POINT)]

r = RECT(POINT(1, 2), POINT(3, 4))
print(r)
print(r.upperleft)
print(r.upperleft.y)
