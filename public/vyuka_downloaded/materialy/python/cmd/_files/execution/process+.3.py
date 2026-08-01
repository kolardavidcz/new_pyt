import subprocess

proces = subprocess.run("ls; exit 1", shell=True, stdout=subprocess.PIPE)

print('args:', proces.args)
print('returncode:', proces.returncode)
print('stdout:', proces.stdout)
print('stderr:', proces.stderr)
