
with open('japonstina.txt', mode='br') as f:
  txt = f.read(3)

with open('japonstina.out', mode='bw') as f:
  bajtů = f.write(txt)
  print('Zapsáno bajtů:', bajtů)
