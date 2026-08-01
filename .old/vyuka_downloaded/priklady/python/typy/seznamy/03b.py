# Staniek Štěpán

def index_prvku(sez, n):
    ret = []
    for i,j in enumerate(sez):
        if j == n:
            ret.append(i)
    return ret

xs = [1, 2, 3, 1, 2, 1, 2, 4, 6, 2,]
n = 1
print(index_prvku(xs, n))
