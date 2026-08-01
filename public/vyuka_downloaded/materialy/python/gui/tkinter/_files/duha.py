#!/usr/bin/env python3

import tkinter

root = tkinter.Tk()
root.title('GIF soubor')

# a) zavedení kanvasu daného rozměru jako potomka hlavního okna
canvas = tkinter.Canvas(root, width=256, height=256)
# b) načtení obrázku a jeho vložení do kanvasu s příslušným relativním umístěním
photo = tkinter.PhotoImage(file='duha.gif')
image = canvas.create_image((256, 256), image=photo, anchor=tkinter.SE)
# c) přidání kanvasu do zobrazeného boxu
canvas.pack()

root.mainloop()
