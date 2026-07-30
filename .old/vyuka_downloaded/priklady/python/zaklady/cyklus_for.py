
jméno = "Pirát Pirátovič"

# 1.
for znak in jméno:
    print(znak)


# 2.
for i in range(11):
    print(i)


# 3.
for i in range(11):
    print("Ahoj!")


# 4.
sum = 0
for i in range(11):
    sum += i
print(sum)


# 5.
sum = 0
for i in range(11):
    sum += i
print( sum / len(range(11)) )


# 6.
for i in range( len(jméno) ):
    if i % 2 == 1:
        print( jméno[i] )


# 7.
for i in range( len(jméno) ):
    if i % 3 == 2:
        print( jméno[i] )
