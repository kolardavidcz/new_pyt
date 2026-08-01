
xs = """Tady je velmi dlouhý text,
který zabírá více řádek. Aby také 
nezabíral, když je v něm napsáno tolik
nesmyslů, že.
"""

# standardně za použití separátoru nové řádky '\n'
x1 = xs.split("\n")
print( x1 )

# za pomoci vestavěné metody
x2 = xs.splitlines()
print( x2 )
