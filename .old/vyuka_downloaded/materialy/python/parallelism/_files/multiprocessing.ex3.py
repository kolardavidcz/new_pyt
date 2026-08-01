import os
from multiprocessing import Process
import time

def f():
    print(os.getpid(), ": právě jsem se spustil, začínám pracovat...")
    time.sleep(os.getpid() % 7) #generická náročná operace...
    print(os.getpid(), ": trvalo mi to", (os.getpid() % 7), "s.")

if __name__ == '__main__':
    for i in range(7):
        Process(target=f, args=()).start()
