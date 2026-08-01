#!/usr/bin/env python3

from pathlib import Path
import stat

p = Path('modetest.py')
mode = p.stat().st_mode
print(mode, '⇔', oct(mode), '⇔', bin(mode))

# posledních 12 bitů (tři oktalová čísla)
# ~ na Unixech klasická přístupová práva a vlastnosti
#   (tedy to, co je nastavitelné přes „Path.chmod()“)
# ~ PS: 0o7777 = 0b111111111111
print(
    'Práva:',
    oct(stat.S_IMODE(mode)),
    '=', oct(mode & 0o7777),
    '=', bin(mode & 0o7777),
    '⇒', stat.filemode(mode)
)

# ~ zbývající bity jsou informace o typu souboru
print(
    'Typ:',
    oct(stat.S_IFMT(mode)),
    '=', oct(mode & 0o170000),
    '=', bin(mode & 0o170000)
)
