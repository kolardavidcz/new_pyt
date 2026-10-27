<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Animace v knihovně Matplotlib

Knihovna **Matplotlib** obsahuje propracovaný animační subsystém v modulu **`matplotlib.animation`**.

V praxi existují dva hlavní přístupy k tvorbě animací:

1. **`ArtistAnimation`** (*sekvence vykreslených objektů*):
   - Předem vygenerujeme seznam snímků, kde každý snímek tvoří seznam grafických prvků (*Artists*, např. čáry, body, obrázky).
   - Velmi přímočaré, pokud již máme k dispozici sadu předpočítaných dat.

2. **`FuncAnimation`** (*funkcionální / procedurální přístup*):
   - Pro každý krok animace volá Matplotlib uživatelem definovanou funkci `update(frame)`.
   - Vhodné pro matematické simulace, fyzikální modely v reálném čase a rozsáhlá data (snímky se počítají za běhu, což šetří paměť).

> [!NOTE]
> Všechny standardní funkce jako `plt.plot()`, `plt.scatter()` či `plt.imshow()` vracejí reference na vytvořené grafické objekty (*Line2D*, *PathCollection*, *AxesImage*), které lze přímo animovat.

---
<!-- slide: id=id2 title="Použití „ArtistAnimation“ I" tags="Core" diff="basics" -->
## Výchozí bod: Statické postupné vykreslení

Představme si postupné vykreslení řady prvočísel bod po bodu:

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.set_xlim(0, 8)
ax.set_ylim(0, 20)
ax.set_xlabel("Pořadí")
ax.set_ylabel("Prvočíslo")

primes = [2, 3, 5, 7, 11, 13, 17]

for i, x in enumerate(primes, start=1):
    # ax.plot vrací seznam vytvořených objektů Line2D
    lines = ax.plot(i, x, "ro")

plt.show()
```

Při tomto statickém přístupu se v okně grafu zobrazí až konečný výsledek se všemi body najednou.

---
<!-- slide: id=id3 title="Použití „ArtistAnimation“ II" tags="WOW" diff="newconcept" -->
## Tvorba animace pomocí `ArtistAnimation`

Pro vytvoření animace stačí jednotlivé vykreslené objekty (*Artists*) ukládat do seznamu a předat je třídě **`ArtistAnimation`**:

```python
import matplotlib.pyplot as plt
from matplotlib.animation import ArtistAnimation

fig, ax = plt.subplots()
ax.set_xlim(0, 8)
ax.set_ylim(0, 20)
ax.set_xlabel("Pořadí")
ax.set_ylabel("Prvočíslo")

primes = [2, 3, 5, 7, 11, 13, 17]
frames = []

for i, x in enumerate(primes, start=1):
    # V každém kroku vykreslíme jeden bod a uložíme referenci
    line = ax.plot(i, x, "ro")
    frames.append(line)

# Vytvoření animace s intervalem 400 ms mezi snímky
ani = ArtistAnimation(fig, frames, interval=400, blit=True, repeat=True)

# Uložení do souboru (vyžaduje ffmpeg pro mp4, nebo pillow pro gif):
# ani.save("animace.gif", writer="pillow")
# ani.save("animace.mp4", writer="ffmpeg")

plt.show()
```

V tomto režimu se v každém snímku zobrazí pouze bod daného kroku (bod „přeskakuje“).

---
<!-- slide: id=id4 title="Použití „ArtistAnimation“ III" tags="Core" diff="pythonic" -->
## Kumulativní animace grafu

Pokud chceme, aby body z předchozích kroků v grafu zůstávaly a postupně přibývaly, spojíme v každém snímku předchozí prvky s novými:

```python
import matplotlib.pyplot as plt
from matplotlib.animation import ArtistAnimation

fig, ax = plt.subplots()
ax.set_xlim(0, 8)
ax.set_ylim(0, 20)
ax.set_xlabel("Pořadí")
ax.set_ylabel("Prvočíslo")

primes = [2, 3, 5, 7, 11, 13, 17]
frames = []

for i, x in enumerate(primes, start=1):
    new_point = ax.plot(i, x, "ro")
    if frames:
        # Připojíme nový bod k existujícímu snímku
        frames.append(frames[-1] + new_point)
    else:
        frames.append(new_point)

ani = ArtistAnimation(fig, frames, interval=300, repeat=True)
plt.show()
```

S každým dalším snímkem tak na plátně zůstává kompletní vykreslená křivka.

---
<!-- slide: id=id5 title="Procedurální animace: „FuncAnimation“" tags="Skip" diff="basics" -->
## Průmyslový standard: `FuncAnimation`

Třída **`FuncAnimation`** je paměťově efektivnější, protože nevytváří dopředu miliony objektů, ale aktualizuje data stávajících křivek za běhu:

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

fig, ax = plt.subplots()
x_vals = np.linspace(0, 2 * np.pi, 200)
(line,) = ax.plot(x_vals, np.sin(x_vals), color="royalblue", lw=2)
ax.set_ylim(-1.2, 1.2)

def update(frame: int):
    # Aktualizace existující křivky (posun fáze vlny)
    y_vals = np.sin(x_vals + frame / 10.0)
    line.set_ydata(y_vals)
    return (line,)

ani = FuncAnimation(fig, update, frames=100, interval=30, blit=True)
plt.show()
```

Parametr **`blit=True`** zajišťuje, že se překreslují pouze pixely změněné křivky, nikoli celé osy, což radikálně zvyšuje snímkovou frekvenci (*FPS*).

---
<!-- slide: id=id6 title="PS: „pyplot.pause()“" tags="Core" diff="pythonic" -->
## Rychlé ladění bez generování souboru: `plt.pause()`

Pro okamžitou vizualizaci iteračních algoritmů (např. trénování modelu, gradientní sestup) nemusíme vytvářet animační objekt, ale stačí použít **`plt.pause()`**:

```python
import matplotlib.pyplot as plt

plt.axis([0, 8, 0, 20])
plt.xlabel("Krok")
plt.ylabel("Hodnota")

for i, x in enumerate([2, 3, 5, 7, 11, 13, 17], start=1):
    plt.plot(i, x, "ro")
    # plt.pause(t) překreslí GUI okno a pozastaví kód na t sekund
    plt.pause(0.2)

plt.show()
```

Metoda `pause()` v sobě automaticky zahrnuje zpracování zpráv operačního systému (*event loop pump*), takže okno grafu nezamrzne.

---
<!-- slide: id=id7 title="PS: „set_data()“ a vysoký výkon" tags="WOW" diff="pythonic" -->
## Vysoký výkon pomocí `set_data()`

Opakované volání `plt.plot()` nebo `plt.imshow()` ve smyčce vytváří do scény nové a nové objekty, což vede k postupnému zahlcení paměti a zpomalení vykreslování.

**Řešení: Vytvořit objekt pouze jednou a mutovat jeho data metodou `set_data()`:**

```python
import matplotlib.pyplot as plt
import numpy as np

# Inicializace mřížky 3x3 (blikající šachovnice)
grid = np.array([
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
], dtype=int)

fig, ax = plt.subplots()
ax.set_xticks([])
ax.set_yticks([])

# Vytvoření jednoho zobrazení obrázku
img = ax.imshow(grid, cmap="gray", interpolation="nearest")
plt.pause(0.5)

# Plynulá animace aktualizací existující matice
for _ in range(20):
    grid ^= 1           # Bitová inverze stavu buněk
    img.set_data(grid)  # Změna matice bez vytváření nového objektu!
    plt.pause(0.3)
```

Tento přístup je základním stavebním kamenem pro simulace celulárních automatů (např. *Conway's Game of Life*) a zobrazování video proudů v reálném čase.
