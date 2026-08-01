
import re

p = re.compile( "(?P<ftp>ftp://)(?(ftp)(\w+\.\w{2,3})(/.*)?)" )

testy = [
  "http://sunet.se",
  "ftp://sunet.se/anime",
]

for i, test in enumerate(testy):
  print( '\n', str(i) + '.', test )
  m = p.match(test)
  print('match:', m)
  if m:
    print('group:', m.groups())
