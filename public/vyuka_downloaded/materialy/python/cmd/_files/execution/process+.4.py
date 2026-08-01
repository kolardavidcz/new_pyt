import subprocess

try:
    proces = subprocess.run("exit 1", shell=True, check=True)
except subprocess.CalledProcessError as err:
    print('Chyba:', err)
