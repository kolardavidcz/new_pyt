import subprocess

p = subprocess.Popen("sort", stdin=subprocess.PIPE, 
                             stdout=subprocess.PIPE, 
                             stderr=subprocess.PIPE)
print( "handle:", p )
output, error = p.communicate( b"hello\nhow\nare\nyou" )
print( "output:", output )
print( "error:", error )
