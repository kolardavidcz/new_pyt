#!/usr/bin/env python3

from tkinter import *


class App:
    
    def __init__(self, master):
        # a) rámeček pro rozvržení plochy
        master_frame = Frame(master)
        master_frame.pack()
        # b) rámeček pro umístění obrázku
        img_frame = LabelFrame(master_frame, text="obrázek")
        img_frame.pack(fill=BOTH, expand=1)
        # b1) obrázek
        photo = PhotoImage(file='duha.gif')
        img = Label(img_frame, image=photo)
        img.photo = photo   # (aby nebyl obrázek zrušen při GC)
        img.pack()
        # c) rámeček pro umístění tlačítek
        btn_frame = Frame(master_frame, relief=RAISED, borderwidth=1)
        btn_frame.pack(fill=BOTH, expand=1)
        # c1) tlačítko pro zavření aplikace
        self.button_close = Button(
            btn_frame, text="ZAVŘÍT", fg="red", command=btn_frame.quit
        )
        self.button_close.pack(side=LEFT, padx=5, pady=5)
        # c2) tlačítko pro výpis na konzoli
        self.button_print = Button(btn_frame, text="print", command=self.print)
        self.button_print.pack(side=RIGHT, padx=5, pady=5)
    
    def print(self):
        print("zpráva z GUI do konzole")


def main():
    root = Tk()
    root.title('Aplikace s tlačítky')
    app = App(root)
    root.mainloop()

if __name__ == '__main__':
    main()
