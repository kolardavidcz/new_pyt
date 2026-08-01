import subprocess

args = ['python', 'error.py']
p = subprocess.Popen(args, stdin=subprocess.PIPE, 
                           stdout=subprocess.PIPE, 
                           stderr=subprocess.PIPE)
print( "handle:", p )
output, error = p.communicate()
print( "output:", output )
print( "error:", error )
print( "return code:", p.returncode )
