#!/usr/bin/env python3

from PIL import Image
import numpy as np

# načtení obrázku
img = Image.open('kvetina.jpg')
data = np.asarray(img, dtype=np.float)

# aplikace filtru
def apply_filter(data):
    output = np.zeros(data.shape[:2])
    output = (
        -data[0:-2,0:-2] -   data[0:-2,1:-1] - data[0:-2,2:] -
         data[1:-1,0:-2] + 9*data[1:-1,1:-1] - data[1:-1,2:] -
         data[2:  ,0:-2] -   data[2:  ,1:-1] - data[2:  ,2:]
    )
    return output

# výstupní pole
X, Y, Z = data.shape
out = np.zeros([X-2, Y-2, Z])

# aplikace filtru
for i in range(3):
    out[:,:,i] = apply_filter(data[:,:,i])

# uložení výstupu
out_img = np.clip(out, 0, 255)
out_img = np.asarray(out_img, dtype=np.uint8)
img_out = Image.fromarray(out_img, 'RGB')
img_out.save('kvetina-zostrena_vect.jpg')
