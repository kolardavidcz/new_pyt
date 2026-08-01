for i in range(2, 101):
    d3, d7 = (i % 3 == 0), (i % 7 == 0)
    if d3 or d7:
        if d3 and d7: continue
        print(i)
