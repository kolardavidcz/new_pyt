#!/usr/bin/env python3

# import modulu
import turtle

# nakreslení čtyř stran čtverce
for i in range(4):
    turtle.forward(100)
    turtle.left(90)

# hlavní GUI-smyčka (aby se okno nezavřelo samo od sebe)
turtle.mainloop()
