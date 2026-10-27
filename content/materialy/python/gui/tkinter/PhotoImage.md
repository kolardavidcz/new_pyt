<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Práce s obrázky v Tkinteru: `PhotoImage`

Třída **`tkinter.PhotoImage`** je základním nástrojem pro vykreslování rastrových obrázků na plátno (`Canvas`) nebo do popisků a tlačítek (`Label`, `Button`).

### Podporované formáty v CPythonu:
- **GIF**: Plná podpora (včetně transparentní barvy, bez animací).
- **PNM / PPM / PGM**: Standardní formáty Netpbm (binární podtypy P5 a P6).
- **PNG**: V moderním Tkinteru (s knihovnou Tcl/Tk 8.6+) je **PNG formát plně nativně podporován** včetně alfa kanálu!

### Zdroje dat pro `PhotoImage`:
1. **Soubor na disku**: parametr `file="cesta/k/obrazku.png"`.
2. **Bajtový řetězec v paměti**: parametr `data=b"..."` (např. dynamicky generovaný PPM nebo PNG).
3. **Base64 řetězec**: vhodné pro vkládání ikon přímo do zdrojového kódu bez externích souborů.

> [!TIP]
> Pokud v aplikaci potřebujete pracovat s formáty JPEG, WebP, TIFF nebo provádět rotace a filtry, doporučuje se sáhnout po externí knihovně **Pillow** (`PIL.ImageTk.PhotoImage`).

---
<!-- slide: id=id2 title="Obrázek ze souboru" tags="Core" diff="basics" -->
## Načtení obrázku ze souboru

Základní načtení souboru a jeho umístění na plátno:

```python
import tkinter as tk

root = tk.Tk()
root.title("Obrázek ze souboru")

# 1. Načtení obrázku (PNG, GIF nebo PPM)
photo = tk.PhotoImage(file="duha-2.png")
w, h = photo.width(), photo.height()

# 2. Vytvoření plátna odpovídajících rozměrů
canvas = tk.Canvas(root, width=w, height=h, highlightthickness=0)
canvas.pack()

# 3. Vložení obrázku na souřadnice s ukotvením (anchor)
# SE = South-East (souřadnice určují pravý dolní roh)
# NW = North-West (souřadnice určují levý horní roh, výchozí střed CENTER)
canvas.create_image(w, h, image=photo, anchor=tk.SE)

# Prevence smazání obrázku Garbage Collectorem:
canvas.photo_ref = photo

root.mainloop()
```

Metody `photo.width()` a `photo.height()` vrací rozměry obrázku v pixelech.

---
<!-- slide: id=id3 title="Obrázek jako bajtový řetězec" tags="WOW" diff="pythonic" -->
## Dynamické generování rastru v paměti

Obrázek není nutné ukládat na disk – můžeme jej sestavit přímo v operační paměti jako sekvenci bajtů (např. formát PNM/PPM) a předat parametru `data`:

```python
import tkinter as tk

# 1. Sestavení binární hlavičky PPM (P6 = binární RGB, rozměr 256x256, max barva 255)
duha = bytearray(b"P6 256 256 255\n")

# 2. Generování gradientních RGB pixelů
line = bytearray()
for i in range(256):
    line.extend([0, i, 127])  # R=0, G=i, B=127

for _ in range(256):
    duha.extend(line)

# 3. Zobrazení v Tkinteru přímo z bajtů
root = tk.Tk()
root.title("PNM jako dynamická bajtová data")

# Parametr data vyžaduje neměnný typ bytes
photo = tk.PhotoImage(data=bytes(duha))

canvas = tk.Canvas(root, width=256, height=256)
canvas.create_image(256, 256, image=photo, anchor=tk.SE)
canvas.pack()

canvas.image_ref = photo
root.mainloop()
```

Tento přístup umožňuje bleskurychlé zobrazování procedurální grafiky, fraktálů nebo výstupů ze simulací bez I/O režie disku.

---
<!-- slide: id=id4 title="GIF jako BASE64-data" tags="Skip" diff="basics" -->
## Vkládání ikon pomocí Base64

Obrázková data zakódovaná do textového řetězce **Base64** lze předat přímo parametru `data`:

```python
import tkinter as tk
import base64

# Ukázka miniaturní ikony v Base64 (1x1 pixel red GIF)
RED_DOT_B64 = """
R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
"""

root = tk.Tk()
root.title("Base64 ikona")

photo = tk.PhotoImage(data=RED_DOT_B64.strip())

label = tk.Label(root, text="Ikona načtená z paměti:", image=photo, compound=tk.LEFT)
label.pack(padx=20, pady=20)

label.photo_ref = photo
root.mainloop()
```

### Výhody Base64 v desktopových aplikacích:
- Jednoduchá distribuce jednosouborových skriptů (`app.py`).
- Žádné riziko `FileNotFoundError` při spuštění z jiného pracovního adresáře.

---
<!-- slide: id=id5 title="Další vlastnosti" tags="Skip" diff="basics" -->
## Pokročilé vlastnosti a Tcl/Tk bridge

Pod kapotou třídy `PhotoImage` běží grafický subsystém knihovny Tk. Pokud pythonní wrapper některou metodu přímo neexponuje, můžeme volat vnitřní Tcl příkazy přes objekt `photo.tk.call()`:

V dalších slajdech se podíváme na:
- Hardwarovou gama korekci přímo při vykreslení.
- Ořez a zvětšení sub-oblastí (*zooming / subsampling*).
- Čtení a zápis jednotlivých pixelů (`get()` a `put()`).

---
<!-- slide: id=id6 title="Gama-korekce" tags="Skip" diff="basics" -->
## Hardwarová gama-korekce obrázku

Tkinter umožňuje upravit jas a kontrast načítaného obrázku pomocí parametru **`gamma`**:

```python
import tkinter as tk

root = tk.Tk()
root.title("Srovnání gama korekce")

# Obrázek s vyšší hodnotou gama (světlejší střední tóny)
photo_bright = tk.PhotoImage(file="duha-2.ppm", gamma=2.2)

# Původní obrázek bez korekce (gamma=1.0)
photo_normal = tk.PhotoImage(file="duha-2.ppm")

canvas = tk.Canvas(root, width=512, height=256)
canvas.create_image(256, 128, image=photo_normal, anchor=tk.E)
canvas.create_image(256, 128, image=photo_bright, anchor=tk.W)
canvas.pack()

canvas.ref = [photo_bright, photo_normal]
root.mainloop()
```

Hodnota `gamma > 1.0` obrázek prosvětluje (zvýrazňuje detaily ve stínech), zatímco hodnota `gamma < 1.0` jej ztmavuje.

---
<!-- slide: id=id7 title="Kopie obrázku „-copy“" tags="Skip" diff="newconcept" -->
## Kopírování a transformace výřezů

Objekt `PhotoImage` umí kopírovat data mezi dvěma instancemi včetně transformací:

```python
import tkinter as tk

root = tk.Tk()
root.title("Výřez a zvětšení")

src = tk.PhotoImage(file="duha.png")

# Vytvoření cílového prázdného obrázku
dest = tk.PhotoImage()

# Volání nízkoúrovňového Tcl příkazu copy:
# -from x1 y1 x2 y2: souřadnice zdrojového výřezu
# -to x1 y1: cílová pozice
# -zoom factor: celočíselné zvětšení
dest.tk.call(dest, "copy", src, "-from", 50, 50, 150, 150, "-to", 0, 0, "-zoom", 2)

label = tk.Label(root, image=dest)
label.pack()

label.ref = dest
root.mainloop()
```

V moderním Pythonu je pro pokročilejší operace (rotace o libovolný úhel, antialiasingové škálování) standardem knihovna **Pillow** (`PIL.Image.crop()`, `PIL.Image.resize()`).

---
<!-- slide: id=id8 title="Získání dat obrázku „-data“ & „put()“" tags="Skip" diff="newconcept" -->
## Zápis pixelů pomocí metody `put()`

Metoda **`put()`** umožňuje dynamicky přepisovat pixely v existujícím `PhotoImage`:

```python
import tkinter as tk

root = tk.Tk()
photo = tk.PhotoImage(width=100, height=100)

# 1. Zápis jednoho pixelu nebo řádku barev:
photo.put("#ff0000", to=(10, 10))  # Červený bod na [10, 10]

# 2. Zápis bloku pixelů formou matice řetězců:
gradient = [
    ["#ff0000", "#00ff00"],
    ["#0000ff", "#ffff00"]
]
photo.put(gradient, to=(20, 20, 22, 22))

canvas = tk.Canvas(root, width=100, height=100)
canvas.create_image(50, 50, image=photo)
canvas.pack()

canvas.ref = photo
root.mainloop()
```

---
<!-- slide: id=id9 title="Data pixelu „get()“" tags="Tricky" diff="pythonic" -->
## Čtení barev pixelů metodou `get()`

Pro inspekci barvy konkrétního pixelu na souřadnicích `(x, y)` slouží metoda **`photo.get(x, y)`**:

```python
import tkinter as tk

root = tk.Tk()
photo = tk.PhotoImage(file="duha-2.png")

# Zjištění barvy pixelu na pozici [50, 50]:
pixel_color = photo.get(50, 50)
print(f"Hodnota: {pixel_color}, Typ: {type(pixel_color)}")
```

### Chování v různých verzích Pythonu:
- **V moderním Pythonu 3 (Tk 8.6+)**: metoda `get(x, y)` vrací přehlednou n-tici celých čísel **`(r, g, b)`**, např. `(0, 128, 255)`.
- **V historických verzích (Python 2 / starší Tkinter)**: metoda vracela mezerou oddělený řetězec, např. `'0 128 255'`.

> [!WARNING]
> Metoda `get()` čte pixely přímo přes X11/Win32/Cocoa rozhraní po jednom. Čtení celé obrazovky pixel po pixelu v Python smyčce je pomalé. Pro hromadné zpracování obrazu vždy použijte NumPy pole nebo Pillow!
