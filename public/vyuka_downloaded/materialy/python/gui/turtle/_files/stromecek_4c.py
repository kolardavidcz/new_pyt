#!/usr/bin/env python3

import turtle

# otočení na sever
turtle.left(90)

# minimální vykreslovaná délka větví
MIN = 10

def strom(délka):
    # ukončovací podmínka rekurze (tzv. kotva)
    if délka < MIN: return
    # výběr barvy pro tento krok
    aktuální = turtle.pencolor()
    if délka < 20: barva = 'green'
    else: barva = 'brown'
    turtle.pencolor(barva)
    # jinak kreslíme další iteraci
    turtle.forward(délka/3)
    turtle.left(30)
    strom(délka*2/3)
    turtle.right(30)
    turtle.forward(délka/6)
    turtle.right(25)
    strom(délka/2)
    turtle.left(25)
    turtle.forward(délka/6)
    turtle.left(20)
    strom(délka/2)
    turtle.right(20)
    turtle.forward(délka/6)
    turtle.right(20)
    strom(délka/3)
    turtle.left(35)
    strom(délka/3)
    # návrat na začátek
    turtle.right(15)
    turtle.backward(délka*5/6)
    turtle.pencolor(aktuální)

# spuštění vykreslování stromu
turtle.tracer(100)
strom(200)

# počkání na zavření okna uživatelem
turtle.done()
