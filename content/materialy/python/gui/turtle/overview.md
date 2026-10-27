<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod do želví grafiky (Turtle Graphics)

Zatímco většina grafických rozhraní pracuje s absolutními kartézskými souřadnicemi `[x, y]`, **želví grafika** (*Turtle Graphics*) staví na **relativních pohybech z pohledu kreslicího kurzoru** („želvy“).

### Historie a princip:
- Vymyslel ji Seymour Papert na konci 60. let 20. století pro výukový jazyk **LOGO** v rámci konstruktivistické teorie učení.
- Původně šlo o skutečné mechanické robotické „želvy“ jezdící po podlaze s fixem uprostřed.
- Želva si pamatuje svou **aktuální polohu**, **směr natočení** a **stav pera** (zda kreslí, jakou barvou a tloušťkou).

> [!TIP]
> Největší síla želví grafiky spočívá v přirozeném zápisu **rekurzivních algoritmů** a fraktálů (Kochova vločka, L-systémy), kde není nutné ručně počítat trigonometrické souřadnice vrcholů.

---
<!-- slide: id=id2 title="Základní principy I" tags="Core" diff="basics" -->
## Základní příkazy řízení želvy

Pohyb a kreslení želvy se ovládá třemi skupinami příkazů:

1. **Pohyb v prostoru**:
   - `forward(vzdálenost)` / `fd()`: posun vpřed ve směru natočení.
   - `backward(vzdálenost)` / `bk()` / `back()`: posun vzad.
2. **Změna orientace**:
   - `left(úhel)` / `lt()`: otočení doleva o zadaný úhel ve stupních.
   - `right(úhel)` / `rt()`: otočení doprava o zadaný úhel.
3. **Stav pera**:
   - `penup()` / `up()`: zvedne pero (želva se pohybuje bez kreslení čáry).
   - `pendown()` / `down()`: položí pero na plátno (želva kreslí).
   - `pensize(šířka)` / `width()`: tloušťka vykreslované stopy v pixelech.
   - `pencolor(barva)`: barva kreslené čáry.

---
<!-- slide: id=id3 title="Základní principy II" tags="Core" diff="basics" -->
## Souřadnicový systém a procedurální vs. objektový přístup

- **Výchozí stav**: Po spuštění stojí želva přesně ve středu okna na souřadnicích `(0, 0)` a její pohled směřuje na východ (úhel 0°, doprava podél osy $x$).
- **Kladné směry**: Osa $x$ roste doprava, osa $y$ roste nahoru (na rozdíl od mnoha 2D grafických API, kde $y$ směřuje dolů).

```text
               +y (Sever, 90°)
                     ▲
                     │
      -x (Západ) ────┼────► +x (Východ, 0°) [Výchozí pohled želvy]
                     │
                     ▼
               -y (Jih, 270°)
```

### Dva styly zápisu v modulu `turtle`:
- **Procedurální** (funkce modulu): `import turtle; turtle.forward(100)` – řídí jednu globální želvu.
- **Objektový** (doporučeno): `t = turtle.Turtle(); screen = turtle.Screen()` – umožňuje mít na jednom plátně libovolný počet nezávislých želv současně.

---
<!-- slide: id=id4 title="Příklad – čtverec" tags="Core" diff="pythonic" -->
## První program: Vykreslení čtverce

Pravidelný čtyřúhelník nakreslíme čtyřnásobným opakováním posunu a otočení o 90°:

```python
import turtle

# Nastavení kreslicího plátna
screen = turtle.Screen()
screen.title("Čtverec v želví grafice")

# Vytvoření želvy
t = turtle.Turtle()
t.color("royalblue")
t.pensize(3)

# Vykreslení čtyř stran čtverce
for _ in range(4):
    t.forward(120)
    t.left(90)

# Udržení okna otevřeného (GUI smyčka Tkinteru)
turtle.done()
```

Želva postupně vykreslí čtverec v prvním kvadrantu a vrátí se do výchozího bodu `(0, 0)`.

---
<!-- slide: id=id5 title="Komentář" tags="Skip" diff="basics" -->
## Rychlost animace a Tkinter pod kapotou

Modul `turtle` je postaven přímo na komponentě `tkinter.Canvas`:

- **Řízení rychlosti**:
  - `t.speed(1)` až `t.speed(10)`: od nejpomalejší po nejrychlejší plynulou animaci.
  - `t.speed(0)`: vypne zpoždění animace (okamžité vykreslení).
  - `screen.tracer(0)` a `screen.update()`: úplné vypnutí překreslování během výpočtu – scéna se zobrazí až hotová v jednom okamžiku!
- **Čekací smyčka**:
  - `turtle.done()` nebo `turtle.mainloop()` je povinné na konci skriptu, aby se okno neuzavřelo ihned po dokončení kreslení.
  - Alternativně lze použít `screen.exitonclick()`, které okno zavře po kliknutí myší do plochy.

---
<!-- slide: id=id6 title="Příklad – hvězda" tags="WOW" diff="pythonic" -->
## Barevné vyplňování tvarů: Hvězda

Želva umí uzavřené geometrické útvary automaticky vybarvovat:

```python
import turtle

screen = turtle.Screen()
screen.bgcolor("#1e1e2e")

t = turtle.Turtle()
t.speed(8)

# Nastavení barvy obrysu (červená) a výplně (žlutá)
t.color("red", "gold")

t.begin_fill()
while True:
    t.forward(220)
    t.left(170)
    # Zastavení, jakmile se želva vrátí do počátečního bodu
    if abs(t.pos()) < 1:
        break
t.end_fill()

t.hideturtle()  # Skryje ikonu šipky po dokončení
screen.exitonclick()
```

Kombinace ostrého úhlu 170° a kroku 220 px vytvoří pravidelnou vícecípou hvězdu s plnou výplní.

---
<!-- slide: id=id7 title="Poznámky" tags="Core" diff="pythonic" -->
## Klíčové metody a vektorová matematika `Vec2D`

Modul `turtle` nabízí propracované pomocné třídy:

- **`begin_fill()` a `end_fill()`**: Ohraničují posloupnost tahů, jejichž vnitřek bude vyplněn barvou `fillcolor`.
- **`pos()` / `position()`**: Vrací instanci **`turtle.Vec2D(x, y)`**.
  - Objekt `Vec2D` podporuje vektorové operace:
    ```python
    v1 = turtle.Vec2D(10, 20)
    v2 = turtle.Vec2D(5, 5)
    print(v1 + v2)        # (15.00, 25.00)
    print(v1 * 2)         # (20.00, 40.00)
    print(v1.rotate(90))  # Rotace o úhel
    ```
- **`towards(x, y)`**: Vypočítá úhel natočení potřebný k tomu, aby se želva dívala na zadaný bod.
- **`distance(x, y)`**: Spočítá euklidovskou vzdálenost od aktuální pozice želvy k cílovému bodu.

---
<!-- slide: id=id8 title="Na závěr" tags="Skip" diff="basics" -->
## Využití želví grafiky v praxi

Ačkoliv vznikla jako pedagogická pomůcka, želví grafika má praktické využití v řadě oblastí:

1. **Fraktální geometrie**: Kreslení Kochovy křivky, dračí křivky (*Dragon Curve*), Hilbertovy křivky vyplňující prostor.
2. **L-systémy (*Lindenmayerovy systémy*)**: Algoritmické modelování morfologie rostlin, stromů, listů a řas na základě přepisovacích gramatik.
3. **Simulace a algoritmy**: Demonstrace prohledávání bludiště, náhodné procházky (*random walk*), animace geometrických algoritmů.
4. **Vektorový export**: Výstup ze želví grafiky lze pomocí PostScriptu (`getcanvas().postscript(file="obrazek.ps")`) nebo SVG exportovat do tiskové kvality.
