from turtle import *

ts = getscreen()

def right():
    seth(0)
    fd(10)

def up():
    seth(90)
    fd(10)

def left():
    seth(180)
    fd(10)

def down():
    seth(270)
    fd(10)

ts.onkey(right, 'Right')
ts.onkey(up, 'Up')
ts.onkey(left, 'Left')
ts.onkey(down, 'Down')

ts.listen()

done()
