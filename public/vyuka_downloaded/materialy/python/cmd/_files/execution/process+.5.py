import subprocess

proces = subprocess.run("echo 'Ahoj!' 1>&2", shell=True, stderr=subprocess.PIPE)

print('args:', proces.args)
print('returncode:', proces.returncode)
print('stdout:', proces.stdout)
print('stderr:', proces.stderr)
