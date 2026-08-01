
def invert_dict_multi(dictionary):
  """handles multiple different keys for one value"""
  
  ret = {}
  for k, v in dictionary.items():
      if v in ret:
          ret[v].append(k)
      else:
          ret[v] = [k]
  return ret


# test
d1 = { 1:'A', 2:'B', }
d2 = { 1:'A', 2:'B', 3:'B', 4:'A', 5:'C', }

print(d1)
print( invert_dict_multi(d1) )

print()

print(d2)
print( invert_dict_multi(d2) )
