#!/usr/bin/env python3

from tkinter import *

#
# načtení dat obrázku
#
with open('duha-2.base64', 'br') as f:
    img = f.read()

#
# zobrazení obrázku
#
root = Tk()
root.title('GIF jako Base64')

photo = PhotoImage(data=img)
w, h = photo.width(), photo.height()

canvas = Canvas(root, width=w, height=h)
image = canvas.create_image((w, h), image=photo, anchor=SE)
canvas.pack()

root.mainloop()
