#!/usr/bin/env python3

from tkinter import *

root = Tk()
root.title('test kopírování výřezu')

canvas = Canvas(root, width=1024, height=768)

photo_1 = PhotoImage(file='duha_vicenasobna.5.gif')
image_1 = canvas.create_image((512, 512), image=photo_1, anchor=SE)

photo_2 = PhotoImage()
photo_2.tk.call(photo_2, 'copy', photo_1, '-from', 256, 128, 512, 256, '-to', 0, 0, '-zoom', 2)
image_2 = canvas.create_image((512, 512), image=photo_2, anchor=NW)

canvas.pack()

root.mainloop()
