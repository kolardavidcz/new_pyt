
def concat_dicts(d1, d2):
  d = {}
  d.update(d1)
  d.update(d2)
  return d

# test
print( concat_dicts( {"a":1, "b":2, "c":3}, {"d":7, "e":8} ) )
