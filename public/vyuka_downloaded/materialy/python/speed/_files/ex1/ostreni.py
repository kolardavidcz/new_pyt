#!/usr/bin/env python3

from PIL import Image
import numpy as np

# načtení obrázku
img = Image.open('kvetina.jpg')         # shape: 500×375
data = np.asarray(img, dtype=np.float)  # shape: 375×500×3

# definice filtru
filtr = np.array([
    [-1, -1, -1],
    [-1,  9, -1],   # 9=8+1 ⇔ filtr + originál
    [-1, -1, -1],
])

# aplikace filtru
def apply_filter(data, maska, output):
    # rozměry vstupního obrázku
    data_w, data_h = data.shape     # Pillow a Numpy mají opačné pořadí
    # aplikace masky
    for y in range(1, data_h - 2):
        for x in range(1, data_w - 2):
            výřez = data[x-1:x+2,y-1:y+2]
            output[x, y] = (výřez * maska).sum()

# výstupní pole
X, Y, Z = data.shape
out = np.zeros([X-2, Y-2, Z])   # shape: 373×498×3

# aplikace filtru
for i in range(3):
    apply_filter(data[:,:,i], filtr, out[:,:,i])

# uložení výstupu
out_img = np.clip(out, 0, 255)
out_img = np.asarray(out_img, dtype=np.uint8)
img_out = Image.fromarray(out_img, 'RGB')
img_out.save('kvetina-zostrena.jpg')
