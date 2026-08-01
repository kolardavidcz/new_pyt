#!/usr/bin/env python3

with open('soubory_win.py', newline='') as f:
    for line in f:
        print(bytes(line, encoding='utf-8'))
