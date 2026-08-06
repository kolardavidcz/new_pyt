import math

def vector_length( vector ):
  """This function calculates length of a 3D vector,
  vector should therefore be a sequence of 3 numbers."""

  assert len(vector) == 3
  x,y,z = vector
  return math.sqrt( x**2 + y**2 + z**2 )

print( vector_length([1,2,3]) )
print( vector_length((0,2,0)) )
print( vector_length([1,2])   )
