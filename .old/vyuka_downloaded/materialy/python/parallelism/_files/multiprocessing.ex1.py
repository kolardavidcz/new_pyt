from multiprocessing import Process

def f(name):
    print('hello', name)

if __name__ == '__main__':
    # a) zavedeme nový proces
    # ~ v targetu je odkaz na funkci, agrs je n-tice argumentů
    p = Process(target=f, args=('bob',))
    # b) spustíme tento proces..
    p.start()
    # c) ..a počkáme na jeho dokončení
    # ~ „join()“ je blokující
    p.join()
