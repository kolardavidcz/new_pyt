import subprocess

# vyvolání operací náročných na čas
pr5 = subprocess.Popen(["sleep", "5"])
pr100 = subprocess.Popen(["sleep", "100"])

# a) spuštění dalšího paralelního procesu
subprocess.Popen(["echo", "Ahoj, já jsem paralelní echo!"])
print()

# b) čekání na ukončení prvního procesu
print("Čekám na", pr5)
pr5.wait()
print(pr5, "už doběhl!")
print()

# c) násilné ukončení druhého procesu
print("Na", pr100, "nebudeme čekat tak dlouho a zabijeme ho!")
pr100.send_signal(9)
