
def concat_dicts(d1, d2):
  d = {}
  for k,v in d1.items():
    d[k] = v
  for k,v in d2.items():
    d[k] = v
  return d

# test
print( concat_dicts( {"a":1, "b":2, "c":3}, {"d":7, "e":8} ) )
