
# vstup
x = int( input('Zadejte číslo v desítkovém tvaru: ') )

# výpočet
num = x
binary = ""
while num:
  binary = str(num & 1) + binary
  num >>= 1

print( '{0} desítkově = {1} binárně'.format(x, binary) )
