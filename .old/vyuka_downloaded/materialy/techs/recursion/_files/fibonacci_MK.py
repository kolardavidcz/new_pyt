# Kryštof Mareš

def fibonacci(vstup, a, b, i):
   if vstup != i:
       i += 1
       print(a + b)
       fibonacci(vstup, b, a+b, i)

vstup = 15
a, b = 0, 1

fibonacci(vstup, a, b, 0)
