import subprocess

try:
    print('Volám externí proces…')
    proces = subprocess.run("python timeout.py", shell=True, timeout=3)
    print('Konec!')
except subprocess.TimeoutExpired as err:
    print('Chyba:', err)
