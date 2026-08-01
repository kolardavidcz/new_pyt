
# A = 65 , Z = 90
# a = 97 , z = 122

xs = "TaKhLe by TO - 123 - teDY nESlo."
ys = ''

for x in xs:
    p = ord(x)
    if p >= 65 and p <= 90:
        ys += chr(p+32)
    elif p >= 97 and p <= 122:
        ys += chr(p-32)
    else:
        ys += x

print(xs)
print(ys)
