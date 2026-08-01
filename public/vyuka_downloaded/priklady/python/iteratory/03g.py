# generátor..
def vlastnosti(objekt):
    vlastnosti = dir(objekt)
    index = -1
    while index + 1 < len(vlastnosti):
        index += 1
        yield vlastnosti[index]

# ..a jeho použití
for v in  vlastnosti([]):
    print(v)
