<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Želví grafika: Kompletní přehled a praktické recepty

Tato přednáška slouží jako referenční příručka a sbírka postupů pro práci s modulem **`turtle`** ve standardní knihovně Pythonu.

Příkazy lze volat dvěma rovnocennými způsoby:
1. **Procedurálně na modulu**: `import turtle; turtle.forward(100)` (řídí výchozí anonymní želvu).
2. **Objektově na instanci**: `t = turtle.Turtle(); t.forward(100)` (doporučeno pro aplikace s více kreslicími objekty).

Většina příkazů má pro pohodlí programátora krátké aliasy (např. `fd` pro `forward`, `lt` pro `left`, `rt` pro `right`, `pu` pro `penup`, `pd` pro `pendown`).

---
<!-- slide: id=id2 title="Pohyby želvy – relativně" tags="Core" diff="basics" -->
## Relativní pohyby z pohledu želvy

Základem želví grafiky jsou relativní posuny orientované podle aktuálního natočení želvy:

- **`forward(vzdalenost)`** (alias `fd`): Posun o zadaný počet kroků/pixelů vpřed.
- **`backward(vzdalenost)`** (aliasy `bk`, `back`): Posun o zadaný počet kroků vzad bez změny orientace.
- **`left(uhel)`** (alias `lt`): Otočení želvy na místě doleva o zadaný úhel ve stupních.
- **`right(uhel)`** (alias `rt`): Otočení želvy na místě doprava o zadaný úhel.

```python
import turtle as t

t.forward(100)  # 100 px dopředu
t.left(90)      # otočka o 90 stupňů doleva
t.forward(50)   # 50 px nahoru
```

---
<!-- slide: id=id3 title="Pohyby želvy – absolutně s kreslením" tags="Core" diff="basics" -->
## Absolutní pohyby s kreslením: `goto()`

Kromě relativních kroků se želva může přesunout přímo na konkrétní souřadnice v rovině:

- **`goto(x, y)`** (aliasy `setpos`, `setposition`): Přesun na bod `[x, y]`. Pokud je pero dole, želva zanechá spojitou čáru z původního do nového bodu.
- **`setx(x)`**: Změní pouze souřadnici $x$, hodnota $y$ zůstane zachována.
- **`sety(y)`**: Změní pouze souřadnici $y$, hodnota $x$ zůstane zachována.

```python
# Parametr goto lze předat jako dvě čísla, n-tici i vektor Vec2D:
t.goto(150, -80)
t.goto((0, 0))  # návrat do počátku
```

---
<!-- slide: id=id4 title="Pohyby želvy – absolutně bez kreslení" tags="WOW" diff="pythonic" -->
## Absolutní přesun bez kreslení: `teleport()`

V **Pythonu 3.12** přibyla nová vestavěná metoda **`teleport()`**, která umožňuje okamžitý přesun na nové souřadnice bez kreslení stopy a bez nutnosti ručně volat `penup()` a `pendown()`:

```python
# Signatura od Pythonu 3.12+:
turtle.teleport(x=None, y=None, *, fill_gap=False)
```

### Způsoby volání `teleport()`:
```python
t.teleport(100, 200)   # Přesun na souřadnice [100, 200]
t.teleport(150)        # Změna pouze x na 150 (y zůstává)
t.teleport(y=-50)      # Změna pouze y na -50 (x zůstává)
```

Nová metoda zjednodušuje kód a eliminuje chyby spojené se zapomenutým spuštěním pera po přesunu.

---
<!-- slide: id=id5 title="„teleport()“ vs „goto()“" tags="Tricky" diff="pythonic" -->
## Srovnání: `teleport(fill_gap=...)` a vyplňování

Parametr **`fill_gap`** určuje chování při aktivním vyplňování polygonu (`begin_fill()`):

```python
from turtle import *

pensize(4)
fillcolor("lightgreen")
begin_fill()

# 1. Kreslení prvního tvaru
fd(50); lt(90); fd(50); lt(90); fd(50)

# 2. Přesun na nové místo
# S fill_gap=False (výchozí): vzniknou dva samostatně vyplněné polygony
teleport(x=-120, fill_gap=False)

# Kreslení druhého tvaru
fd(50); lt(90); fd(50); lt(90); fd(50)
end_fill()
```

- **`fill_gap=False`**: Přeruší polygon – obrazce před a po teleportu se vyplní jako nezávislé ostrůvky.
- **`fill_gap=True`**: Chová se geometricky jako `goto()`, avšak spojnice mezi body zůstává neviditelná (bez obrysové čáry).

---
<!-- slide: id=id6 title="PS: vektor „Vec2D“" tags="WOW" diff="pythonic" -->
## Vektorová třída `Vec2D`

Modul `turtle` exportuje 2D vektorovou třídu **`Vec2D`**, která rozšiřuje standardní neměnnou n-tici (`tuple`) o lineární algebru:

```pycon
>>> from turtle import Vec2D
>>> a = Vec2D(3, 4)
>>> b = Vec2D(1, 2)
>>> a + b
(4.00,6.00)
>>> a * 2           # skalární násobení
(6.00,8.00)
>>> abs(a)          # velikost vektoru (Euklidovská norma): sqrt(3^2 + 4^2)
5.0
>>> a * b           # skalární součin: 3*1 + 4*2 = 11
11
>>> a.rotate(90)    # rotace vektoru o úhel ve stupních proti směru ručiček
(-4.00,3.00)
```

Metoda `pos()` vrací právě instanci `Vec2D`, což usnadňuje vektorové výpočty ve fyzikálních simulacích.

---
<!-- slide: id=id7 title="Ovládání pera" tags="Core" diff="basics" -->
## Stav kreslicího pera

- **`penup()`** (aliasy `pu`, `up`): Zvedne pero; želva se pohybuje bez kreslení čáry.
- **`pendown()`** (aliasy `pd`, `down`): Položí pero; želva za sebou kreslí stopu.
- **`pensize(sirka)`** (alias `width`): Nastaví tloušťku čáry v pixelech.
- **`isdown()`**: Vrátí `True`, pokud je pero položeno na plátně.

```python
t.pensize(5)
t.forward(50)
t.penup()
t.forward(30)  # mezera bez kreslení
t.pendown()
t.forward(50)
```

---
<!-- slide: id=id8 title="Vyplňování (uzavřených) obrazců barvou" tags="Core" diff="basics" -->
## Vyplňování uzavřených obrazců

Plocha ohraničená tahy želvy se vyplňuje pomocí dvojice příkazů:

```python
t.fillcolor("crimson")
t.begin_fill()

# Cesta tvořící uzavřený nebo polootevřený polygon
for _ in range(3):
    t.forward(100)
    t.left(120)

t.end_fill()
```

Dotaz na aktuální stav vyplňování:
```python
if t.filling():
    print("Právě probíhá záznam bodů pro výplň")
```

---
<!-- slide: id=id9 title="Nastavení barev I" tags="Core" diff="basics" -->
## Nastavení barev pera a výplně

Barvy lze definovat textovým názvem, RGB trojicí nebo obojím najednou:

```python
# 1. Samostatné pero
t.pencolor("darkblue")
t.pencolor(0.2, 0.4, 0.8)

# 2. Samostatná výplň
t.fillcolor("#ffcc00")

# 3. Nastavení obou barev současně: color(pero, vyplan)
t.color("navy", "gold")
```

Volání `pencolor()` nebo `fillcolor()` bez parametrů vrátí aktuálně nastavenou hodnotu.

---
<!-- slide: id=id10 title="Nastavení barev II" tags="Tricky" diff="basics" -->
## Barevné režimy: `colormode`

Výchozí nastavení pro číselné RGB hodnoty je rozsah reálných čísel $0.0$ až $1.0$.

Pokud chcete zadávat barvy v celých číslech $0$ až $255$, je nutné přepnout režim:

```python
import turtle

# Přepnutí na celočíselný rozsah (0 až 255):
turtle.colormode(255)
turtle.pencolor(255, 128, 0)  # Oranžová barva

# Přepnutí zpět na desetinný rozsah (0.0 až 1.0):
turtle.colormode(1.0)
turtle.pencolor(1.0, 0.5, 0.0)
```

---
<!-- slide: id=id11 title="Kružnice I" tags="Tricky" diff="basics" -->
## Kreslení kružnic: `circle()`

Příkaz pro kružnici má specifickou geometrii:

```python
turtle.circle(radius, extent=None, steps=None)
```

> [!WARNING]
> Střed kružnice **není** v místě, kde želva stojí! Želva se pohybuje po obvodu kružnice, přičemž střed leží ve vzdálenosti `radius` kolmo vlevo od aktuálního směru pohledu želvy.

```python
t.circle(100)  # Nakreslí celou kružnici o poloměru 100 px vlevo od želvy
```

Po dokončení plné kružnice (`extent=None` nebo `360`) se želva nachází na přesně stejném místě a se stejným natočením jako na začátku.

---
<!-- slide: id=id12 title="Kružnice II – polygony" tags="Skip" diff="basics" -->
## Pravidelné n-úhelníky pomocí `steps`

Kružnice je interně aproximována lomenou čarou. Pomocí parametru **`steps`** lze vytvořit libovolný pravidelný mnohoúhelník vepsaný do pomyslné kružnice:

```python
t.circle(80, steps=3)  # Rovnostranný trojúhelník
t.circle(80, steps=5)  # Pravidelný pětiúhelník
t.circle(80, steps=6)  # Pravidelný šestiúhelník
t.circle(80, steps=8)  # Pravidelný osmiúhelník
```

Jedná se o nejjednodušší způsob kreslení pravidelných polygonů v želví grafice.

---
<!-- slide: id=id13 title="Kružnice III – výseče" tags="Skip" diff="basics" -->
## Kruhové oblouky: parametr `extent`

Parametr **`extent`** udává úhel oblouku ve stupních:

```python
# Kladný úhel: oblouk proti směru hodinových ručiček
t.circle(100, extent=90)   # Čtvrtkružnice

# Záporný úhel: oblouk po směru hodinových ručiček (želva couvá)
t.circle(100, extent=-180) # Půlkruh v opačném směru
```

Po vykreslení oblouku zůstává želva na koncovém bodě s tečným natočením k oblouku.

---
<!-- slide: id=id14 title="„Tečky“ aneb maličké kružnice" tags="Skip" diff="basics" -->
## Kreslení bodů: `dot()`

Pro vykreslení plného kruhového bodu přímo na aktuální pozici želvy slouží metoda **`dot()`**:

```python
t.dot(20, "crimson")  # Bod o průměru 20 pixelů červené barvy

t.teleport(50, 0)
t.dot("navy")          # Výchozí velikost bodu podle pensize
```

Na rozdíl od `circle()` se střed bodu nachází přesně na souřadnicích želvy a kreslení je okamžité.

---
<!-- slide: id=id15 title="Vypsání textu" tags="Skip" diff="basics" -->
## Textový výstup na plátno: `write()`

Želva umí do plochy vykreslovat text libovolným fontem:

```python
t.write(
    "Ahoj ze světa Turtle!",
    move=False,
    align="center",
    font=("Arial", 14, "bold")
)
```

- **`move=True`**: Želva se po vypsání textu přesune na pravý dolní roh opsaného textu.
- **`align`**: Možnosti zarovnání `"left"`, `"center"`, `"right"`.

---
<!-- slide: id=id16 title="Schování želvy" tags="Skip" diff="basics" -->
## Viditelnost a tvar želvy

- **`hideturtle()`** (alias `ht`): Skryje ikonu želvy (výrazně zrychluje kreslení).
- **`showturtle()`** (alias `st`): Znovu zobrazí želvu.
- **`isvisible()`**: Vrátí `True`, pokud je želva viditelná.
- **`shape("turtle")`**: Změna tvaru kurzoru (`"arrow"`, `"turtle"`, `"circle"`, `"square"`, `"triangle"`, `"classic"`).

---
<!-- slide: id=id17 title="Zrychlení želvy" tags="Tricky" diff="pythonic" -->
## Zrychlení vykreslování a optimalizace

Pro složité kresby a fraktály je standardní animace příliš pomalá:

```python
# 1. Maximální rychlost animace
t.speed(0)

# 2. Úplné vypnutí animace přes obrazovku (tracer)
screen = turtle.Screen()
screen.tracer(0, 0)  # Vypne automatické překreslování po každém tahu!

# ... tisíce tahů želvou ...

# 3. Jednorázové překreslení celé scény najednou:
screen.update()
```

Použitím `screen.tracer(0)` se výpočet fraktálu zrychlí z několika minut na zlomek sekundy!

---
<!-- slide: id=id18 title="Změna soustavy souřadné" tags="Skip" diff="basics" -->
## Nastavení rozměrů okna a vlastních souřadnic

- **`screensize(šířka, výška, bg)`**: Nastaví rozměry vnitřního plátna.
- **`setworldcoordinates(llx, lly, urx, ury)`**: Změní mapování souřadnic plátna (Lower-Left a Upper-Right):
  ```python
  # Nastaví souřadnice okna tak, že [0, 0] je v levém dolním rohu a [10, 10] v pravém horním:
  screen.setworldcoordinates(0, 0, 10, 10)
  ```
Tato transformace je ideální pro vykreslování matematických grafů funkcí bez nutnosti ručního přepočítávání pixelů.

---
<!-- slide: id=id19 title="Posun kanvasu" tags="Skip" diff="newconcept" -->
## Skrolovatelné plátno: `ScrolledCanvas`

Pokud kresba přesahuje fyzické rozměry monitoru, lze želví grafiku vložit do komponenty `turtle.ScrolledCanvas`:

```python
import tkinter as tk
import turtle

root = tk.Tk()
root.title("Skrolovatelná želví grafika")

scrolled_canvas = turtle.ScrolledCanvas(root, width=600, height=500)
scrolled_canvas.pack(fill=tk.BOTH, expand=True)

screen = turtle.TurtleScreen(scrolled_canvas)
screen.screensize(2000, 2000)

t = turtle.RawTurtle(screen)
t.circle(300)

root.mainloop()
```

---
<!-- slide: id=id20 title="Poziční stav želvy I" tags="Core" diff="basics" -->
## Čtení a obnova stavu želvy

Pro manipulaci s polohou a orientací:

- **`pos()` / `position()`**: Vrátí aktuální souřadnice jako `Vec2D(x, y)`.
- **`heading()`**: Vrátí aktuální azimut natočení ve stupních (0° = východ).
- **`setheading(úhel)`** (alias `seth`): Nastaví absolutní úhel natočení.
- **`xcor()` / `ycor()`**: Vrátí samostatně souřadnici $x$ resp. $y$.

```python
saved_pos = t.pos()
saved_head = t.heading()

# ... libovolné odskoky ...

t.teleport(*saved_pos)
t.setheading(saved_head)
```

---
<!-- slide: id=id21 title="Poziční stav želvy II" tags="WOW" diff="pythonic" -->
## Relativní metriky mezi želvami: `distance()` a `towards()`

Želva umí měřit vzdálenost a úhel k jinému bodu nebo dokonce k jiné želvě:

```python
t1 = turtle.Turtle()
t2 = turtle.Turtle()
t2.teleport(100, 100)

# Euklidovská vzdálenost mezi dvěma želvami:
dist = t1.distance(t2)
print("Vzdálenost:", dist)  # ~141.42

# Úhel, kterým se t1 musí otočit, aby mířila přesně na t2:
angle = t1.towards(t2)
t1.setheading(angle)  # t1 se otočí čelem k t2
```

Tato funkcionalita se využívá v jednoduchých simulacích predátor-kořist (*boids*, hejnové chování).

---
<!-- slide: id=id22 title="Mazání kresby" tags="Skip" diff="basics" -->
## Mazání kresby: `clear()` vs. `reset()`

- **`t.clear()`**: Smaže všechny tahy nakreslené touto konkrétní želvou z plátna. Pozice, natočení, barva a stav pera želvy zůstávají **zachovány**.
- **`t.reset()`**: Smaže kresbu této želvy a zároveň ji vrátí do výchozího stavu na střed `(0, 0)` s původním nastavením.
- **`turtle.clearscreen()` / `resetscreen()`**: Vyčistí celé plátno včetně všech želv.

---
<!-- slide: id=id23 title="Více želv najednou" tags="Core" diff="resyntax" -->
## Nezávislé kreslení s více instancemi

Na jednom plátně může současně pracovat více nezávislých želv:

```python
import turtle

screen = turtle.Screen()

t1 = turtle.Turtle()
t1.color("red")

t2 = turtle.Turtle()
t2.color("blue")
t2.teleport(-100, 0)

# Každá želva vykonává své příkazy nezávisle
t1.circle(50)
t2.circle(70)

screen.exitonclick()
```

Kresby jednotlivých želv jsou uloženy v oddělených vrstvách a volání `t1.clear()` neovlivní kresbu `t2`.

---
<!-- slide: id=id24 title="Více želv najednou ve vláknech" tags="Tricky" diff="newconcept" -->
## Paralelní animace ve vláknech (`threading`)

Díky tomu, že želví operace delegují na Tkinter plátno, lze více želv animovat současně pomocí standardních vláken:

```python
import turtle
from threading import Thread

t1 = turtle.Turtle()
t2 = turtle.Turtle()

def run_t1():
    t1.color("crimson")
    for _ in range(36):
        t1.forward(10)
        t1.left(10)

def run_t2():
    t2.color("royalblue")
    for _ in range(36):
        t2.forward(15)
        t2.right(10)

# Spuštění obou želv v samostatných vláknech
Thread(target=run_t1).start()
Thread(target=run_t2).start()

turtle.done()
```

Obě želvy kreslí své trajektorie souběžně na stejné plátno.

---
<!-- slide: id=id25 title="Události myši: Interaktivní aplikace" tags="Core" diff="newconcept" -->
## Interaktivní události myši

Modul `turtle` umožňuje obsluhovat interakci uživatele:

- **`onscreenclick(fun, btn=1)`**: Zavolá `fun(x, y)` při kliknutí kamkoliv do okna.
- **`t.onclick(fun, btn=1)`**: Zavolá `fun(x, y)` při kliknutí přímo na tělo dané želvy.
- **`t.ondrag(fun, btn=1)`**: Zavolá `fun(x, y)` při tažení myší se stisknutým tlačítkem.

### Miniaturní kreslicí program na 3 řádky:
```python
import turtle

# Kliknutí na obrazovku pošle želvu na zadané souřadnice
turtle.onscreenclick(turtle.goto)
turtle.done()
```

---
<!-- slide: id=id26 title="Události klávesnice: `listen()` a `onkey()`" tags="Core" diff="newconcept" -->
## Ovládání klávesnicí a časovače

Aby okno přijímalo klávesové události, je nutné zavolat **`screen.listen()`**:

```python
import turtle

screen = turtle.Screen()
t = turtle.Turtle()

def go_forward():
    t.forward(30)

def turn_left():
    t.left(45)

def turn_right():
    t.right(45)

# Registrace obsluhy kláves
screen.onkey(go_forward, "Up")
screen.onkey(turn_left, "Left")
screen.onkey(turn_right, "Right")

# Aktivace naslouchání událostem klávesnice
screen.listen()
turtle.done()
```

Časovač **`screen.ontimer(fun, t=100)`** umožňuje spustit funkci za `t` milisekund, což slouží jako základ herní smyčky.

---
<!-- slide: id=id27 title="Vlastnosti okna" tags="Skip" diff="basics" -->
## Konfigurace okna aplikace

- **`screen.title("Titulek okna")`**: Změna textu v záhlaví okna.
- **`screen.bgcolor("#222222")`**: Nastavení barvy pozadí.
- **`screen.bgpic("pozadi.gif")`**: Vložení rastrového obrázku na pozadí plátna.
- **`screen.exitonclick()`**: Udrží okno otevřené a zavře jej po kliknutí myší.
- **`turtle.done()`**: Standardní ukončení čekací smyčky Tkinteru.

---
<!-- slide: id=id28 title="Ukládání výstupu" tags="Skip" diff="basics" -->
## Export do vektorového formátu PostScript

Hotovou kresbu z želvího plátna lze exportovat do vektorového souboru EPS (*Encapsulated PostScript*):

```python
import turtle

t = turtle.Turtle()
for _ in range(8):
    t.circle(60)
    t.left(45)

# Získání interního Tkinter plátna a export do EPS:
canvas = turtle.getcanvas()
canvas.postscript(file="kresba.eps")

turtle.done()
```

Soubor `.eps` lze následně otevřít v Inkscape, Illustratoru nebo převést pomocí Ghostscriptu do PDF či SVG.

---
<!-- slide: id=id29 title="Kompatibilita s jazykem LOGO" tags="Skip" diff="basics" -->
## Mód kompatibility s jazykem LOGO: `mode()`

V klasickém jazyce LOGO začínala želva otočená na sever a úhly se počítaly po směru hodinových ručiček (kompasový azimut):

```python
import turtle

# Přepnutí na chování jazyka LOGO:
turtle.mode("logo")
# Nyní: 0° = Sever, úhly rostou doprava (po směru ručiček)

# Výchozí matematický mód Pythonu:
turtle.mode("standard")
# Nyní: 0° = Východ, úhly rostou doleva (proti směru ručiček)
```

Tato volba usnadňuje přepis starších výukových algoritmů napsaných původně pro LOGO.

---
<!-- slide: id=id30 title="Dokumentace" tags="Skip" diff="basics" -->
## Shrnutí a zdroje pro další studium

Modul `turtle` nabízí překvapivě robustní grafické prostředí přímo v jádře standardní knihovny.

### Doporučené zdroje:
- **[Oficiální dokumentace modulu `turtle`](https://docs.python.org/3/library/turtle.html)**: Kompletní přehled všech metod objektů `Turtle` a `TurtleScreen`.
- **Brian Harvey: Computer Science Logo Style**: Klasická třísvazková učebnice algoritmizace a symbolického programování.
- **L-systémy a fraktály**: Želví grafika je ideálním výstupním interpretem pro Lindenmayerovy gramatiky a rekurzivní křivky.
