#!/usr/bin/env python3

import turtle
import tkinter

root = tkinter.Tk()
root.geometry('500x500-5+40')
cv = turtle.ScrolledCanvas(root, width=900, height=900)
cv.pack()

screen = turtle.TurtleScreen(cv)
screen.screensize(2000,1500)
t = turtle.RawTurtle(screen)
t.hideturtle()
t.circle(100)

root.mainloop()
