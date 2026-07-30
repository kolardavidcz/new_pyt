
import re

p = re.compile( "(<)?(\w+@\w+(?:\.\w+)+)(?(1)>|$)" )

m = p.match("<user@host.com>")
print(m)
m = p.match("user@host.com")
print(m)
m = p.match("<user@host.com")
print(m)
m = p.match("user@host.com>")
print(m)
