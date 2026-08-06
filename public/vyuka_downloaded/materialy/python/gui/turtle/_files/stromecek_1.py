#!/usr/bin/env python3

import turtle

# otočení na sever
turtle.left(90)

# 0. kopie
turtle.forward(100)     # kmen stromu
turtle.left(50)         # otočení pro kreslení větve vlevo..

# 1. kopie (kratší větve)
turtle.forward(90)      # ..a větev vlevo
...                     # (tady bude kreslení dalších dvou kopií)
turtle.backward(90)     # návrat na začátek (invariance)

# 0. kopie
turtle.right(100)       # otočení pro kreslení větve vpravo..

# 2. kopie (kratší větve)
turtle.forward(90)      # ..a větev vpravo
...                     # (tady bude kreslení dalších dvou kopií)
turtle.backward(90)     # návrat na začátek (invariance)

# 0. kopie
turtle.left(50)         # otočení do původního směru
turtle.backward(100)    # návrat na začátek (invariance)

# počkání na zavření okna uživatelem
turtle.done()
