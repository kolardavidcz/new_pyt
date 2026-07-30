from multiprocessing import Process, Lock, Value
import random

def f(l, x):
    l.acquire()
    x.value += random.randint(1, 10)
    print(x.value)
    l.release()

if __name__ == '__main__':
    lock = Lock()
    n = Value('d', 0)
    sez = list()
    
    # a) zavedení a spuštění procesů
    for i in range(10):
        sez.append(Process(target=f, args=(lock, n)))
        sez[i].start()
    
    # b) počkáme na dokončení všech procesů..
    for i in range(10):
        sez[i].join()
    
    # c) ..a pak můžeme pokračovat dále
    print("Všechny procesy doběhly, hodnota n:", n.value)
