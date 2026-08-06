from turtle import Turtle, mainloop
from threading import Thread

# zavedení dvou nezávislých želv
t1, t2 = Turtle(), Turtle()

# první želva
def kresba_1():
    t1.color('red', 'yellow')
    t1.begin_fill()
    t1.circle(100)
    t1.end_fill()

# druhá želva
def kresba_2():
    t2.left(60)
    t2.color('blue', 'green')
    t2.begin_fill()
    t2.circle(100)
    t2.end_fill()

# "paralelní" vykreslení vyplněných kružnic
# ~ nejjednodušší případ funkcí bez parametrů
Thread(target=kresba_1).start()
Thread(target=kresba_2).start()

# čekací smyčka
mainloop()
