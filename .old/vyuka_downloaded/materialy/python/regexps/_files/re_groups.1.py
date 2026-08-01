import re

text = "http://vyuka.ookami.cz/materialy/python/regexps/overview.xml"

pattern = re.compile(r"http://(?P<host>[^/]*)(?P<path>/.*/)(?P<file>.*\.xml)")
matches = pattern.match(text)

if matches:
    print( matches.group() )
    print()
    print( matches.groups() )
    print()
    print( matches.groupdict() )
