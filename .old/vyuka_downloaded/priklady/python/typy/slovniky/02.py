
def invert_dict(dictionary):
  ret = {}
  for k, v in dictionary.items():
    ret[v] = k
  return ret

# test
d1 = { 1:'A', 2:'B', }
d2 = { 1:'A', 2:'B', 3:'B', 4:'A', 5:'C', }

print(d1)
print( invert_dict(d1) )

print()

print(d2)
print( invert_dict(d2) )
