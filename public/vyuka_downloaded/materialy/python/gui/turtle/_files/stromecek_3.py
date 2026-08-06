#!/usr/bin/env python3

import turtle

# otočení na sever
turtle.left(90)

# minimální vykreslovaná délka větví
MIN = 10

def strom(délka):
    # ukončovací podmínka rekurze (tzv. kotva)
    if délka < MIN: return
    # jinak kreslíme další iteraci
    turtle.forward(délka)
    turtle.left(60)
    délka_větví = délka * 0.7   # nová délka větví z tohoto místa
    strom(délka_větví)          # levá část větví
    turtle.right(120)
    strom(délka_větví)          # pravá část větví
    turtle.left(60)
    turtle.backward(délka)

# spuštění vykreslování stromu
strom(100)

# počkání na zavření okna uživatelem
turtle.done()
