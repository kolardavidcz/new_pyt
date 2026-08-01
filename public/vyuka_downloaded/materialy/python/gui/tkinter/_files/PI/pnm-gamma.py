#!/usr/bin/env python3

from tkinter import *

root = Tk()
root.title('test gamma')

photo_1 = PhotoImage(file='duha-2.ppm', gamma=2.1)
photo_2 = PhotoImage(file='duha-2.ppm')

canvas = Canvas(root, width=512, height=512)
image_1 = canvas.create_image((256, 256), image=photo_1, anchor=SE)
image_2 = canvas.create_image((256, 256), image=photo_2, anchor=NW)
canvas.pack()

root.mainloop()
