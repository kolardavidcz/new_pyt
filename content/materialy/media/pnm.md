<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod do rodiny grafických formátů PNM / Netpbm

Rodinu formátů **PNM** (*Portable Anymap*) navrhl v 80. letech Jef Poskanzer. Původním cílem bylo vytvořit univerzální rastrový formát, který by bylo možné bezpečně přenášet v těle e-mailů jako čistý 7bitový ASCII text.

### Proč se PNM formáty používají dodnes?
- **Absolutní jednoduchost**: Formát neobsahuje žádnou kompresi (LZO, Deflate, JPEG), barevné profily ani složité kontejnery.
- **Triviální parser**: Čtení a zápis obrázku v libovolném jazyce vyžaduje jen několik málo řádek kódu bez externích knihoven.
- **Pracovní standard**: Slouží jako referenční formát pro výuku počítačové grafiky, ladění algoritmů počítačového vidění a propojování utilit v Unix pipelinech (*Netpbm toolkit*).

> [!NOTE]
> Formát je nevhodný pro dlouhodobou archivaci či web z důvodu absence komprese, ale je bezkonkurenční pro rychlé dynamické generování grafiky v Pythonu.

---
<!-- slide: id=id2 title="Rozdělení" tags="Core" diff="basics" -->
## Šest variant formátů Netpbm

Systém Netpbm dělí formáty podle **barevné hloubky** a typu **kódování dat** (textové ASCII vs. binární):

| Typ formátu | ASCII (textový) | Binární | Barevná reprezentace |
| :--- | :---: | :---: | :--- |
| **PBM** (*Portable Bitmap*) | **P1** | **P4** | Monochromatický (černobílý, 1 bit / pixel) |
| **PGM** (*Portable Graymap*) | **P2** | **P5** | Stupně šedi (typicky 8 bitů, maxval 255) |
| **PPM** (*Portable Pixmap*) | **P3** | **P6** | Plnobarevný RGB (3 kanály, 24 bitů / pixel) |

### Srovnání ASCII vs. Binární:
- **ASCII (P1, P2, P3)**: Čitelné v libovolném textovém editoru, snadno se tvoří ručně, ale soubor je obrovský (jeden RGB pixel v P3 zabere až 12 znaků s mezerami).
- **Binární (P4, P5, P6)**: Datová část je uložena přímo v bajtech (P6 zabere přesně 3 bajty na pixel), hlavička však zůstává v ASCII.

---
<!-- slide: id=id3 title="Struktura" tags="Tricky" diff="pythonic" -->
## Obecná struktura souboru PNM

Každý soubor rodiny PNM má textovou hlavičku zakončenou bílým znakem, následovanou rastrovými daty:

```text
MAGICKÉ_ČÍSLO        # P1 až P6
[# nepovinný komentář začínající mřížkou]
ŠÍŘKA VÝŠKA          # Rozměry v pixelech (ASCII čísla oddělená mezerou/novým řádkem)
MAXVAL               # Pouze pro PGM a PPM: maximální hodnota složky (např. 255)
ODDĚLOVAČ            # PRÁVĚ JEDEN bílý znak (obvykle \n)
DATA_OBRÁZKU         # Matice pixelů
```

> [!CAUTION]
> **Past na Windows (CRLF vs. LF):** U binárních variant (P4, P5, P6) musí za řádkem `MAXVAL` následovat **přesně jeden bajt** oddělovače (nejlépe `\n`, tj. `0x0A`). Pokud na Windows zapíšete soubor v textovém režimu a za hlavičku se vloží `\r\n` (`0x0D 0x0A`), bajt `\r` posune všechna binární data o jeden bajt a celý obrázek bude mít posunuté barvy!

---
<!-- slide: id=id4 title="PBM ASCII (P1)" tags="Core" diff="basics" -->
## PBM v textovém režimu (P1)

V černobílém formátu PBM představuje `0` bílou barvu (prázdno) a `1` černou barvu (inkoust):

```plain
P1
# Písmeno 'J' o rozměrech 7 x 10 pixelů
7 10
0 0 0 0 0 0 0
0 0 0 0 0 1 0
0 0 0 0 0 1 0
0 0 0 0 0 1 0
0 0 0 0 0 1 0
0 0 0 0 0 1 0
0 0 0 0 0 1 0
0 1 0 0 0 1 0
0 0 1 1 1 0 0
0 0 0 0 0 0 0
```

Tento soubor lze přímo otevřít v GIMPu, IrfanView nebo načíst v Pythonu. Jednotlivé bity mohou být odděleny mezerami nebo novými řádky.

---
<!-- slide: id=id5 title="PBM binary (P4)" tags="Tricky" diff="newconcept" -->
## Binární PBM (P4) a bitové balení

Ve variantě **P4** jsou pixely baleny po **8 bitech do jednoho bajtu** (nejvýznamnější bit *MSB* odpovídá pixelu nejvíce vlevo):

- 1 řádek o šířce 7 pixelů se zaokrouhlí nahoru na celý bajt (8 bitů), přičemž poslední bit se ignoruje (doplní se nulou).
- Pokud má obrázek šířku 10 pixelů, každý řádek zabere $\lceil 10 / 8 \rceil = 2$ bajty.
- Přebytečné bity na konci každého řádku se zarovnávají na hranici celého bajtu.

Tato bitová reprezentace dosahuje maximální úspory paměti pro binární masky a černobílé dokumenty.

---
<!-- slide: id=id6 title="PS: Vynucení zobrazení pixelů bez vyhlazování" tags="Skip" diff="basics" -->
## Inspekce pixelů v prohlížečích (Pixel Art režim)

Při ladění grafických algoritmů na malých rozlišeních (např. 16×16 nebo 32×32 pixelů) moderní prohlížeče obrázků automaticky aplikují bilineární či bikubické vyhlazování (*anti-aliasing*), což způsobí rozmazání jednotlivých bodů.

Pro přesnou kontrolu pixelů je nutné vyhlazování vypnout:
- **IrfanView**: `View -> Display options -> Uncheck "Use Resample for zooming"`.
- **VS Code**: rozšíření pro zobrazení obrázků nabízí volbu `Image: Pixelated`.
- **CSS ve webovém prohlížeči**:
  ```css
  img.pixelated {
      image-rendering: pixelated; /* Chrome/Edge */
      image-rendering: crisp-edges; /* Firefox */
  }
  ```

---
<!-- slide: id=id7 title="PGM ASCII (P2)" tags="Skip" diff="basics" -->
## PGM v textovém režimu (P2)

Obrázek ve stupních šedi specifikuje v hlavičce rozsah jasu `maxval` (např. 15 nebo 255). Hodnota `0` je černá, hodnota `maxval` je bílá:

```plain
P2
# Nápis 'AHOJ' o rozměrech 24 x 7 pixelů, 16 stupňů šedi (0 až 15)
24 7
15
0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0
0  3  3  3  3  0  0  7  0  0  7  0  0 11 11 11 11  0  0  0  0  0 15  0
0  3  0  0  3  0  0  7  0  0  7  0  0 11  0  0 11  0  0  0  0  0 15  0
0  3  3  3  3  0  0  7  7  7  7  0  0 11  0  0 11  0  0  0  0  0 15  0
0  3  0  0  3  0  0  7  0  0  7  0  0 11  0  0 11  0  0 15  0  0 15  0
0  3  0  0  3  0  0  7  0  0  7  0  0 11 11 11 11  0  0 15 15 15 15  0
0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0
```

Každé číslo odpovídá intenzitě jednoho pixelu.

---
<!-- slide: id=id8 title="PGM binary (P5)" tags="Tricky" diff="newconcept" -->
## Binární PGM (P5)

Formát **P5** ukládá každý pixel jako jeden samostatný bajt (`0` až `255`):

```python
# Příklad vytvoření PGM P5 souboru v Pythonu:
width, height = 256, 256
header = f"P5\n{width} {height}\n255\n".encode("ascii")

# Přechod od černé do bílé po řádcích:
pixels = bytearray()
for y in range(height):
    for x in range(width):
        pixels.append(x)  # jas 0 až 255

with open("gradient.pgm", "wb") as f:
    f.write(header)
    f.write(pixels)
```

Celková velikost souboru je přesně `len(header) + width * height` bajtů.

---
<!-- slide: id=id9 title="PPM ASCII (P3)" tags="Skip" diff="basics" -->
## PPM v textovém režimu (P3)

Plnobarevný formát specifikuje pro každý pixel trojici hodnot **R G B**:

```plain
P3
# Obrázek 3 x 2 pixely, maxval 255
3 2
255
# Řádek 1: Červená, Zelená, Modrá
255   0   0       0 255   0       0   0 255
# Řádek 2: Žlutá, Bílá, Černá
255 255   0     255 255 255       0   0   0
```

Formát P3 je ideální pro demonstrace generování grafiky ze skriptů v raných fázích výuky programování.

---
<!-- slide: id=id10 title="PPM binary (P6)" tags="Core" diff="basics" -->
## Binární PPM (P6): Průmyslový standard

Ve formátu **P6** jsou barevná data uložena jako souvislý proud RGB tripletů:
- Každý pixel = **3 bajty** (`R`, `G`, `B`).
- Žádné oddělovače ani mezery mezi pixely ani řádky.

```python
import numpy as np

# Generování RGB plátna 100x100 pomocí NumPy a uložení do P6:
width, height = 100, 100
rgb_matrix = np.zeros((height, width, 3), dtype=np.uint8)
rgb_matrix[:, :, 0] = 255  # Nastavení červeného kanálu

header = f"P6\n{width} {height}\n255\n".encode("ascii")

with open("cervena.ppm", "wb") as f:
    f.write(header)
    f.write(rgb_matrix.tobytes())
```

---
<!-- slide: id=id11 title="Srovnávací tabulka" tags="Core" diff="resyntax" -->
## Souhrnná srovnávací tabulka PNM

| Formát | Varianta | Typ dat | Bajtů / pixel | Typické použití |
| :---: | :---: | :---: | :---: | :--- |
| **PBM** | **P1** | ASCII text | ~2 zn. | Výukové textové bitmapy |
| **PBM** | **P4** | Binární bity | **1/8 bajtu** | Černobílé skeny, tiskové masky |
| **PGM** | **P2** | ASCII text | ~4 zn. | Textové stupně šedi |
| **PGM** | **P5** | Binární bajty | **1 bajt** | Rychlé šedotónové matice, hloubkové mapy |
| **PPM** | **P3** | ASCII text | ~12 zn. | Výukové generování RGB barev |
| **PPM** | **P6** | Binární bajty | **3 bajty** | Rychlé meziformáty při zpracování videa a obrazu |

---
<!-- slide: id=id12 title="Poznámky" tags="Skip" diff="newconcept" -->
## Technické detaily a limity specifikace

1. **Délka řádku v ASCII**: Specifikace Netpbm doporučuje, aby v ASCII variantách žádný řádek nepřesáhl 70 znaků.
2. **Komentáře**: Znak `#` uvozuje komentář až do konce daného řádku. Komentář se smí vyskytnout kdekoliv v hlavičce.
3. **16bitová hloubka**: Pokud je `maxval > 255` (až do 65535), ukládá se každá složka ve variantách P5/P6 do **2 bajtů v pořadí Big-Endian** (*nejvýznamnější bajt dříve*).
4. **Snadný import do moderního Pythonu**:
   ```python
   # Načtení PPM do Pillow nebo OpenCV bez externích závislostí:
   from PIL import Image
   img = Image.open("obrazek.ppm")
   ```
