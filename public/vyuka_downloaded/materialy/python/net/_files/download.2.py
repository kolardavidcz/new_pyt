import urllib.request

content = b''
with urllib.request.urlopen('http://vyuka/example.txt') as stream:
    content = stream.read()

print( content )
print()
print( content.decode('utf-8') )

