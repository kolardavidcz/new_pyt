
def otoc(xs):
  ret = []
  for x in xs:
    ret.insert(0, x)
  return ret

# ukázkové zadání
xs = [1, 2, 3, 1, 2, 1, 2, 4, 6, 2,]

print(xs)
print( otoc(xs) )
