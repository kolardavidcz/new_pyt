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
# ~ zobrazení obrázku
# ~ zjištění informací o konkrétním pixelu
#
root = Tk()
root.title('PNM jako bajtová data')

photo = PhotoImage(data=bytes(duha))
pixel = photo.get(128, 128)
print(pixel)
print(type(pixel))

canvas = Canvas(root, width=256, height=256)
image = canvas.create_image((256, 256), image=photo, anchor=SE)
canvas.pack()

#
# hlavní udržovací smyčka GUI
#
root.mainloop()
