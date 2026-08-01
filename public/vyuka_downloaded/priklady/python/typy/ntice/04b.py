# ???

def tup4(string):
    ret = []
    li = string.split()
    for word in li:
        cnt = li.count(word)
        if (word, cnt) not in ret:
            ret.append((word, cnt))
    return ret

# ukázkový vstup
věta = "třistatřiatřicet stříbrných stříkaček stříkalo přes třistatřiatřicet stříbrných střech"
print(věta)
print(tup4(věta))
