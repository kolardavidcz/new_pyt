import re

text = "http://vyuka.ookami.cz/materialy/python/regexps/overview.xml"

pattern = re.compile(r"http://(?P<host>[^/]*)(?P<path>/.*/)(?P<file>.*\.xml)")
matches = pattern.match(text)

if matches:
    print( matches.group() )
    print( matches.group(0) )
    print()
    print( matches.group(1) )
    print( matches.group('host') )
    print()
    print( matches.group(1, 3) )
    print( matches.group('host', 'file') )
