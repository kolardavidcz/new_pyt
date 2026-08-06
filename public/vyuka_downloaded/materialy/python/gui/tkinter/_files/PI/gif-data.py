#!/usr/bin/env python3

from tkinter import *

root = Tk()
root.title('test kopírování výřezu')

canvas = Canvas(root, width=768, height=640)

photo_1 = PhotoImage(file='duha_vicenasobna.5.gif')
image_1 = canvas.create_image((512, 512), image=photo_1, anchor=SE)

subimg = photo_1.tk.call(photo_1, 'data', '-from', 256, 128, 512, 256, '-grayscale')

photo_2 = PhotoImage()
photo_2.put(subimg)
image_2 = canvas.create_image((512, 512), image=photo_2, anchor=NW)

canvas.pack()

root.mainloop()
