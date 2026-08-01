
def bigger_than(xs, y):
  ret = []
  for x in xs:
    if x > y:
      ret.append(x)
  return ret

# ukázkové zadání
xs = [1, 2, 3, 1, 2, 1, 2, 4, 6, 2,]
n = 3

print(xs, n)
print( bigger_than(xs, n) )
