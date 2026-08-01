#!/usr/bin/env python3

from tkinter import *

#
# příprava obrázku (modro-zelená duha 256x256)
#
duha = bytearray('P6 256 256 255 ', 'ascii')
line = bytearray()
for i in range(256):
    line.extend([0, i, 127])
for i in range(256):
    duha.extend(line)

#
# zobrazení obrázku
#
root = Tk()
root.title('PNM jako bajtová data')

photo = PhotoImage(data=bytes(duha))

canvas = Canvas(root, width=256, height=256)
image = canvas.create_image((256, 256), image=photo, anchor=SE)
canvas.pack()

root.mainloop()
