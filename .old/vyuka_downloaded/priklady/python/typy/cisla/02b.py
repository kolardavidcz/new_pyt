# Michal Obergruber

for i in range(2, 101):
    if (i % 3 == 0 and i % 7 != 0) or (i % 3 != 0 and i % 7 == 0):
        print(i)
