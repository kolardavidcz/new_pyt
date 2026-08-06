
lines = []

with open('cestina.2.txt', mode='r', encoding='utf-8') as f:
    lines = f.readlines()

with open('cestina.3.out', mode='w', encoding='utf-8') as f:
    f.writelines( lines )

with open('cestina.3.out', mode='r', encoding='utf-8') as f:
    print( f.readlines() )

