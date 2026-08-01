#!/usr/bin/env python3

import turtle

# otočení na sever
turtle.left(90)

def strom(délka):
    turtle.forward(délka)   # kmen stromu
    turtle.left(50)         # otočení pro kreslení větve vlevo
    strom(délka * 0.7)      # levá část větví
    turtle.right(100)       # otočení pro kreslení větve vpravo
    strom(délka * 0.7)      # pravá část větví
    turtle.left(50)         # otočení do původního směru
    turtle.backward(délka)  # návrat na začátek (invariance)

# spuštění vykreslování stromu
strom(100)

# počkání na zavření okna uživatelem
turtle.done()
