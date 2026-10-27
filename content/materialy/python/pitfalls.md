<!-- lecture: title="Záludnosti jazyka Python" slug="materialy--python--pitfalls" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod

Ačkoliv je Python vesměs velmi elegantní, čitelný a přívětivý jazyk, obsahuje celou řadu menších či větších záludností, historických kompromisů a neočekávaných chování (*gotchas*).

Zatímco největší pasti z dob Pythonu 2 jsou dnes již minulostí, i v moderním Pythonu (3.10–3.13) na vývojáře čekají nástrahy:
- Mutabilní výchozí argumenty funkcí
- Pozdní vazba proměnných v uzávěrech (*late binding*)
- Lokální versus globální scoping (LEGB a `UnboundLocalError`)
- Mutace objektů uvnitř „neměnné“ n-tice (*tuple*)
- Práce s kódováním souborů a systémovými cestami

Tato přednáška slouží jako ucelený přehled těchto pastí s praktickými recepty, jak psát robustní a bezpečný kód.

---

<!-- slide: id=id2 title="Automatické skládání řetězců" tags="Tricky" diff="resyntax" -->
## Automatické skládání řetězců

Python automaticky spojuje literály řetězců napsané bezprostředně za sebou (oddělené pouze mezerami nebo novými řádky v závorkách):

```python
>>> s = 'Ahoj ' "světe"
>>> s
'Ahoj světe'
```

Tato vlastnost je velmi užitečná při rozdělování dlouhých textů nebo SQL dotazů bez nutnosti sčítání operátorem `+`:
```python
query = (
    "SELECT id, jmeno, email "
    "FROM uzivatele "
    "WHERE aktivni = 1"
)
```

> [!WARNING]
> **Pozor na chybějící čárku v seznamech:**
> ```python
> barvy = [
>     "cervena",
>     "zelena"   # Chybí čárka!
>     "modra",
> ]
> # Výsledek: ['cervena', 'zelenamodra'] — žádná syntaktická chyba!
> ```

---

<!-- slide: id=id3 title="Míchání tabulátorů a mezer" tags="Tricky" diff="pythonic" -->
## Míchání tabulátorů a mezer

Python 3 striktně zakazuje kombinování tabulátorů a mezer pro odsazení ve stejném bloku kódu:

```python
def foo():
    x = 1       # 4 mezery
	y = 2       # 1 tabulátor
    return x + y
# TabError: inconsistent use of tabs and spaces in indentation
```

> [!TIP]
> **Moderní standard (PEP 8):**
> Vždy odsazujte výhradně **4 mezerami** na úroveň. Ve svém editoru (VS Code, PyCharm) si nastavte:
> - `editor.insertSpaces: true`
> - `editor.tabSize: 4`
> - `editor.renderWhitespace: "selection"`

---

<!-- slide: id=id4 title="Oddělování příkazů středníkem" tags="Skip" diff="resyntax" -->
## Oddělování příkazů středníkem

Přestože je Python jazyk založený na koncích řádků, středník `;` je platným oddělovačem jednoduchých příkazů na jednom řádku:

```python
import os; print(os.getcwd()); x = 42
```

Lze dokonce umístit tělo jednoduché smyčky na stejný řádek za dvojtečku:
```python
for i in range(3): print(i); print("krok")
```

> [!NOTE]
> V produkčním kódu se středníky nepoužívají – odporují zásadě čitelnosti (PEP 8). Výjimkou jsou jednorázové příkazy v terminálu: `python -c "import sys; print(sys.version)"`.

---

<!-- slide: id=id5 title="Kódování textových souborů a UTF-8" tags="Tricky" diff="pythonic" python="3.12+" -->
## Kódování textových souborů a UTF-8

Historicky platilo, že pokud jste při volání `open('soubor.txt')` nezadali parametr `encoding`, Python použil výchozí kódování operačního systému (na Windows často `cp1250` nebo `cp1252`).

```python
# Potenciální časovaná bomba při přenosu na jiný OS:
with open("data.txt") as f:
    text = f.read()
```

### Moderní stav (PEP 597 & PEP 686):
- Od Pythonu 3.10 lze zapnout varování `python -X warn_default_encoding skript.py`.
- **PEP 686:** Od Pythonu 3.15 bude UTF-8 povinným výchozím kódováním pro všechny `open()` operace.
- V moderním Pythonu lze UTF-8 režim vynutit proměnnou prostředí `PYTHONUTF8=1` nebo přepínačem `python -X utf8`.

> [!IMPORTANT]
> Zlaté pravidlo: **Vždy explicitně specifikujte `encoding="utf-8"`!**
> ```python
> with open("data.txt", "r", encoding="utf-8") as f:
>     text = f.read()
> ```

---

<!-- slide: id=id6 title="Výchozí kódování zdrojových kódů" tags="Core" diff="basics" -->
## Výchozí kódování zdrojových kódů

V Pythonu 3 je výchozím kódováním všech zdrojových souborů (`.py`) **UTF-8**.

Můžete zcela bezpečně používat české znaky v řetězcích i komentářích:
```python
zprava = "Příliš žluťoučký kůň úpěl ďábelské ódy"
```

Deklarace typu `# -*- coding: utf-8 -*-` byla povinná v Pythonu 2, ale v moderním Pythonu 3 je již zbytečná a není potřeba ji do nových souborů psát.

---

<!-- slide: id=id7 title="Není Unicode jako Unicode: BOM" tags="Tricky" diff="newconcept" -->
## Není Unicode jako Unicode: BOM

Některé textové editory na Windows (např. historický Notepad) ukládají na začátek souborů v UTF-8 tzv. **BOM** (*Byte Order Mark* – bajty `EF BB BF`).

Pokud takový soubor načtete s běžným kódováním `utf-8`:
```python
with open("data.txt", encoding="utf-8") as f:
    first_line = f.readline()
    print(first_line == "id,jmeno")  # FALSE! first_line začíná neviditelným znakem \ufeff!
```

### Řešení v Pythonu:
Použijte speciální vestavěný kodek **`utf-8-sig`**:
```python
with open("data.txt", encoding="utf-8-sig") as f:
    first_line = f.readline()
    print(first_line == "id,jmeno")  # True! BOM je automaticky detekován a odstraněn.
```

---

<!-- slide: id=id8 title="„Řetězce“ v moderním Pythonu" tags="Skip" diff="basics" -->
## Řetězce (`str`) vs Bajty (`bytes`)

V moderním Pythonu 3 je přísně oddělen text od binárních dat:
- **`str`**: Sekvence Unicode znaků (abstraktní text).
- **`bytes`**: Sekvence surových 8bitových hodnot (např. `b"data"`).

```python
text = "Příliš žluťoučký kůň"
surova_data = text.encode("utf-8")     # str -> bytes
zpet_na_text = surova_data.decode("utf-8") # bytes -> str
```

> [!NOTE]
> V Pythonu 3 nelze text a bajty implicitně sčítat ani porovnávat (`"a" + b"b"` vyvolá `TypeError`).

---

<!-- slide: id=id9 title="Cesty k souborům a zpětná lomítka" tags="Tricky" diff="resyntax" python="3.12+" -->
## Cesty k souborům a zpětná lomítka

Častou chybou na Windows je zápis cest se zpětnými lomítky:
```python
# CHYBA: \n a \t se interpretují jako nový řádek a tabulátor!
path = "C:\novy_projekt\test.txt"
```

### Moderní řešení: Modul `pathlib`
V moderním Pythonu se pro práci s cestami vždy používá **`pathlib.Path`**:
```python
from pathlib import Path

# Univerzální na Windows, Linuxu i macOS s lomítkem /:
data_file = Path("C:/novy_projekt/test.txt")
# Nebo relativně:
data_file = Path("data") / "vystupy" / "vysledky.json"
```

---

<!-- slide: id=id10 title="Relativní cesty k souborům" tags="Tricky" diff="newconcept" -->
## Relativní cesty k souborům

Relativní cesty v Pythonu se vždy vztahují k **aktuálnímu pracovnímu adresáři** (`os.getcwd()`), ze kterého byl interpret spuštěn, nikoliv k umístění samotného `.py` souboru!

```bash
# Spuštění z jiné složky způsobí FileNotFoundError:
cd /home/user
python /projekty/app/main.py  # Hledá soubory v /home/user, nikoliv v /projekty/app!
```

### Správné řešení pomocí `__file__`:
```python
from pathlib import Path

# Cesta k adresáři, ve kterém leží tento běžící skript:
BASE_DIR = Path(__file__).resolve().parent

# Soubory otevíráme relativně k tomuto skriptu:
data_path = BASE_DIR / "data" / "konfigurace.json"
with open(data_path, "r", encoding="utf-8") as f:
    config = f.read()
```

---

<!-- slide: id=id11 title="Formátování řetězců (f-strings)" tags="WOW" diff="pythonic" python="3.12+" -->
## Formátování řetězců (f-strings)

F-strings (`f"..."`) jsou standardem od Pythonu 3.6. Pokud potřebujete v textu vypsat samotnou složenou závorku, zdvojte ji:

```python
jmeno = "Alice"
print(f"Uživatel {{{jmeno}}}")  # Vypíše: Uživatel {Alice}
```

### Revoluce v Pythonu 3.12 (PEP 701):
V Pythonu 3.12 byla odstraněna veškerá dřívější syntaktická omezení f-stringů:
- Uvnitř výrazu lze použít stejné uvozovky jako venku:
  ```python
  f"Položka: {data['klic']}"  # Dříve vyžadovalo střídání " a '
  ```
- Uvnitř složených závorek jsou povoleny zpětná lomítka i víceřádkové výrazy:
  ```python
  f"Seznam:\n{'\n'.join(polozky)}"
  ```

---

<!-- slide: id=id12 title="„True + True == 2“" tags="Tricky" diff="resyntax" -->
## „True + True == 2“

V Pythonu je typ `bool` přímým podtypem celočíselného typu `int`:
- `True` má číselnou hodnotu `1`
- `False` má číselnou hodnotu `0`

```python
>>> isinstance(True, int)
True
>>> True + True
2
>>> True * 10
10
```

Tento mechanismus umožňuje elegantní počítání splněných podmínek:
```python
cisla = [4, -2, 8, -5, 12]
kladnych = sum(x > 0 for x in cisla)  # Sečte True (1) a False (0) -> 3
```

---

<!-- slide: id=id13 title="Bublání proměnných smyčky ven" tags="Tricky" diff="paradigm" -->
## Bublání proměnných smyčky ven

Na rozdíl od Javy či C++, bloky `for`, `while`, `if` ani `with` v Pythonu **nevytvářejí nový lexikální rozsah platnosti** (*scope*).

Řídicí proměnná smyčky zůstává po jejím skončení existovat v okolním kontextu:
```python
for x in range(5):
    pass

print(x)  # Vypíše 4! Proměnná x zůstala v lokálním/globálním prostoru.
```

> [!WARNING]
> Pokud máte v téže funkci stejnojmennou proměnnou, smyčka `for` její hodnotu přepíše.

---

<!-- slide: id=id14 title="Rozsah proměnných v generátorech" tags="Skip" diff="resyntax" -->
## Rozsah proměnných v generátorech

V Pythonu 3 má každá generátorová notace (*list comprehension*, *set comprehension*, *dict comprehension*) svůj **vlastní izolovaný scope**:

```python
[i for i in range(5)]
# Dotaz na i skončí chybou:
print(i)  # NameError: name 'i' is not defined
```

Pomocná proměnná `i` tedy v moderním Pythonu z generátoru ven neprobublá.

---

<!-- slide: id=id15 title="Bublání pomocných proměnných walrus operátoru" tags="WOW" diff="newconcept" -->
## Bublání pomocných proměnných walrus operátoru

Výjimkou z izolace generátorů je operátor přiřazení **`:=`** (*walrus*, Python 3.8+):

Pokud v comprehensions použijete `:=`, proměnná se přiřadí do **nadřazeného rozsahu platnosti**:

```python
data = ["jablko", "banan", "kiwi", "pomeranc"]
delky = [d for ovoce in data if (d := len(ovoce)) > 5]

print(delky)  # [6, 8]
print(d)      # 8! Proměnná d z walrus operátoru probublala ven!
```

> [!NOTE]
> Chování je navrženo úmyslně, aby bylo možné hodnotu spočítanou ve filtru použít i po skončení generátoru.

---

<!-- slide: id=id16 title="Iterace po měněném objektu" tags="Tricky" diff="paradigm" -->
## Iterace po měněném objektu

Základní pravidlo: **Nikdy nemodifikujte seznam během přímé iterace přes něj!**

```python
cisla = [1, 2, 2, 3, 4]
for x in cisla:
    if x == 2:
        cisla.remove(x)

print(cisla)  # [1, 2, 3, 4] — Druhá dvojka byla přeskočena!
```

Proč? Smazáním prvku se posunou interní indexy v poli, ale iterátor se posune na další index, čímž prvek přeskočí.

### Správné řešení:
1. **Filtrování nového seznamu (nejrychlejší & nejčistší):**
   ```python
   cisla = [x for x in cisla if x != 2]
   ```
2. **Iterace přes kopii:**
   ```python
   for x in cisla.copy():
       if x == 2:
           cisla.remove(x)
   ```

---

<!-- slide: id=id17 title="„while“ a přiřazení (Walrus operator)" tags="WOW" diff="pythonic" python="3.12+" -->
## „while“ a přiřazení (Walrus operator)

Python zakazuje běžné přiřazení `=` uvnitř podmínek, aby nedošlo k záměně s porovnáním `==`:
```python
# SyntaxError: invalid syntax
while line = file.readline():
    pass
```

Od Pythonu 3.8 máme k dispozici operátor přiřazovacího výrazu **`:=`** (*Walrus operator*, PEP 572):
```python
# Čtení souboru po blocích:
while chunk := file.read(8192):
    process(chunk)

# Zpracování regulárního výrazu:
if match := pattern.search(text):
    print("Nalezeno:", match.group())
```

---

<!-- slide: id=id18 title="Výchozí parametry proměnného typu u funkcí" tags="Tricky" diff="newconcept" -->
## Výchozí parametry proměnného typu u funkcí

Nejznámější past v Pythonu: **Výchozí parametry funkcí se vyhodnocují pouze jednou – při definici funkce, nikoliv při jejím volání!**

```python
def pridej_prvek(polozka, seznam=[]):
    seznam.append(polozka)
    return seznam

print(pridej_prvek(1))  # [1]
print(pridej_prvek(2))  # [1, 2] — WTF?! Tentýž seznam byl zachován!
```

Objekt `[]` se vytvoří jednou v paměti a při každém volání bez druhého parametru se sdílí tatáž instance.

### Jediné správné řešení (idiom `None`):
```python
def pridej_prvek(polozka, seznam=None):
    if seznam is None:
        seznam = []
    seznam.append(polozka)
    return seznam
```

---

<!-- slide: id=id19 title="Výchozí hodnota parametru funkce referencí" tags="Tricky" diff="newconcept" -->
## Výchozí hodnota parametru funkce referencí

Stejný princip platí i pro výchozí hodnoty odkazující na proměnné:

```python
x = 10

def ukaz(val=x):
    print(val)

ukaz()  # 10
x = 99
ukaz()  # Stále 10! Výchozí hodnota se zafixovala v okamžiku definice def.
```

---

<!-- slide: id=id20 title="Jména lokální funkci (`UnboundLocalError`)" tags="Tricky" diff="paradigm" -->
## Jména lokální funkci (`UnboundLocalError`)

Python zkoumá tělo funkce při kompilaci do bajtkódu. Pokud je kdekoliv ve funkci proměnné přiřazena hodnota, Python ji v celém těle funkce považuje za **lokální**:

```python
x = 42

def test():
    print(x)  # UnboundLocalError: local variable 'x' referenced before assignment
    x = 100

test()
```

Jelikož je na řádku 5 `x = 100`, proměnná `x` je označena jako lokální. Řádek 4 se pokouší číst lokální `x` ještě před jejím přiřazením.

### Řešení:
- Pokud chcete modifikovat globální proměnnou: použijte klíčové slovo **`global x`**.
- Pokud v nořené funkci modifikujete proměnnou z vnější funkce: použijte klíčové slovo **`nonlocal x`**.

---

<!-- slide: id=id21 title="Generované konstrukce uvnitř uzávěrů" tags="Tricky" diff="newconcept" -->
## Generované konstrukce uvnitř uzávěrů (*Late Binding*)

Pozdní vazba (*late binding*) způsobuje, že funkce vnořené do uzávěru hledají proměnné až v okamžiku jejich zavolání:

```python
funkce = [lambda x: i * x for i in range(4)]

# Očekáváme násobky 0, 1, 2, 3?
for f in funkce:
    print(f(2))  # Vypíše: 6, 6, 6, 6!
```

Při volání `f(2)` už smyčka dávno skončila a hodnota proměnné `i` v okolním scope je `3`. Proto $3 \times 2 = 6$.

### Řešení: Zafixování výchozím argumentem
```python
# i=i zafixuje aktuální hodnotu i v okamžiku vytvoření funkce:
funkce = [lambda x, i=i: i * x for i in range(4)]
for f in funkce:
    print(f(2))  # Vypíše: 0, 2, 4, 6!
```

---

<!-- slide: id=id22 title="„dict.fromkeys()“ a výchozí hodnota" tags="Tricky" diff="pythonic" -->
## „dict.fromkeys()“ a výchozí hodnota

Metoda `dict.fromkeys(klice, vychozi_hodnota)` přiřadí všem klíčům **přesně tutéž instanci** objektu:

```python
d = dict.fromkeys(["a", "b", "c"], [])
d["a"].append(1)

print(d)  # {'a': [1], 'b': [1], 'c': [1]} — Všechny klíče sdílí týž list!
```

### Správné řešení: Dict comprehension
```python
# Vytvoří pro každý klíč samostatnou instanci seznamu:
d = {k: [] for k in ["a", "b", "c"]}
d["a"].append(1)
print(d)  # {'a': [1], 'b': [], 'c': []}
```

---

<!-- slide: id=id23 title="Bezpečný vstup: `input()`" tags="Skip" diff="basics" -->
## Bezpečný vstup: `input()`

V moderním Pythonu funkce `input(prompt)` vždy vrací bezpečný textový řetězec (`str`):

```python
vek = input("Zadejte věk: ")
# Pro čísla je nutná explicitní konverze:
vek_cislo = int(vek)
```

> [!NOTE]
> V dávném Pythonu 2 funkce `input()` automaticky volala nebezpečný `eval()`. V Pythonu 3 je `input()` naprosto bezpečný a k žádnému samovolnému vyhodnocování kódu nedochází.

---

<!-- slide: id=id24 title="N-tice že jsou neproměnné?" tags="Tricky" diff="paradigm" -->
## N-tice že jsou neproměnné?

N-tice (*tuple*) je sice neměnná struktura (`immutable`), ale to znamená pouze to, že **nemůžete změnit reference na její prvky**. Pokud samotný prvek n-tice je mutabilní objekt (např. `list`), jeho obsah měnit lze!

```python
t = ([1, 2], "text")
t[0].append(3)
print(t)  # ([1, 2, 3], 'text') — Seznam uvnitř n-tice se změnil!
```

### Bizarní past s operátorem `+=`:
```python
t = ([1, 2],)
t[0] += [3]
# Vyvolá TypeError: 'tuple' object does not support item assignment,
# ALE prvek 3 byl do seznamu t[0] přesto úspěšně přidán!
```
Důvod: `+=` nejprve provede in-place rozšíření seznamu (úspěšně) a poté se pokusí výsledek přiřadit zpět do `t[0]` (což tuple zakáže a vyhodí výjimku).

---

<!-- slide: id=id25 title="Jednoprvkové n-tice a unpacking" tags="WOW" diff="pythonic" -->
## Jednoprvkové n-tice a unpacking

Častou chybou začátečníků je definice jednoprvkové n-tice pouhými závorkami:
```python
x = (42)    # Toto je obyčejný int! Závorky jsou vyhodnoceny jako aritmetické.
t = (42,)   # Toto je tuple! Rozhodující je čárka , nikoliv závorka.
```

Unpacking jednoho prvku pomocí čárky:
```python
hodnota, = [100]
print(hodnota)  # 100
```

---

<!-- slide: id=id26 title="„+=“ vs „= +“ u seznamů" tags="Core" diff="pythonic" -->
## „+=“ vs „= +“ u seznamů

Operátor `+=` a výraz `x = x + y` se u mutabilních objektů chovají zásadně odlišně:

```python
# 1. += volá __iadd__ (modifikace in-place stejného objektu):
a = [1, 2]
b = a
a += [3]
print(b)  # [1, 2, 3] — Změnil se i b, protože ukazuje na stejný objekt!

# 2. + volá __add__ (vytvoření nového objektu):
a = [1, 2]
b = a
a = a + [3]
print(b)  # [1, 2] — b zůstal beze změny, a ukazuje na nově vytvořený list.
```

---

<!-- slide: id=id27 title="„+=“ přijímá libovolný iterovatelný objekt" tags="Already Studied" diff="pythonic" -->
## „+=“ přijímá libovolný iterovatelný objekt

Operátor `+=` na seznamu funguje jako metoda `extend()` – přijímá libovolný iterovatelný objekt (množinu, n-tici, řetězec):

```python
xs = [1, 2]
xs += {3, 4}       # Množina se proiteruje a přidá
xs += "AB"         # Řetězec se rozpadne na znaky ['A', 'B']
print(xs)          # [1, 2, 3, 4, 'A', 'B']
```

Běžné sčítání `+` naproti tomu striktně vyžaduje shodný typ:
```python
xs = [1, 2] + {3, 4}  # TypeError: can only concatenate list (not "set") to list
```

---

<!-- slide: id=id28 title="Kuriozita: „=+“ není nový operátor" tags="Skip" diff="resyntax" -->
## Kuriozita: „=+“ není nový operátor

Pokud v kódu narazíte na zápis:
```python
x =+ 5
```
Nejedná se o žádný magický operátor. Python to vyhodnotí jako unární plus:
```python
x = (+5)  # Ekvivalentní prostému x = 5
```

---

<!-- slide: id=id29 title="Mělká vs Hluboká kopie (`copy`)" tags="Tricky" diff="pythonic" -->
## Mělká vs Hluboká kopie (`copy`)

Násobení seznamu obsahujícího vnořený seznam vytvoří pouze násobné reference na týž vnitřní objekt:

```python
matice = [[0] * 3] * 3
matice[0][0] = 1
print(matice)  # [[1, 0, 0], [1, 0, 0], [1, 0, 0]] — Změnily se všechny řádky!
```

### Správné řešení:
1. **Comprehension (nová instance pro každý řádek):**
   ```python
   matice = [[0] * 3 for _ in range(3)]
   matice[0][0] = 1  # Změní se pouze nultý řádek!
   ```
2. **Modul `copy` pro hlubokou kopii libovolných struktur:**
   ```python
   import copy
   klon = copy.deepcopy(puvodni_struktura)
   ```

---

<!-- slide: id=id30 title="Výřezy (*Slicing*) a hranice indexů" tags="Core" diff="pythonic" -->
## Výřezy (*Slicing*) a hranice indexů

Přímý přístup k indexu mimo rozsah vyvolá `IndexError`:
```python
xs = [1, 2, 3]
x = xs[10]  # IndexError: list index out of range
```

Zatímco **výřezy (*slices*) hranice automaticky oříznou bez chyby**:
```python
xs = [1, 2, 3]
print(xs[10:])     # [] (prázdný seznam)
print(xs[:1000])   # [1, 2, 3]
```

Tato vlastnost je velmi praktická při práci s neznámou délkou dat (není potřeba předem kontrolovat délku).

---

<!-- slide: id=id31 title="Metoda `insert()` a indexy mimo rozsah" tags="Core" diff="resyntax" -->
## Metoda `insert()` a indexy mimo rozsah

Podobně jako výřezy, metoda `list.insert(index, prvek)` nikdy nevyvolá `IndexError`:

```python
xs = [1, 2, 3]
xs.insert(999, "konec")   # Vloží prvek na konec seznamu
xs.insert(-999, "zacatek") # Vloží prvek na začátek seznamu

print(xs)  # ['zacatek', 1, 2, 3, 'konec']
```

---

<!-- slide: id=id32 title="Import modulů a `sys.path`" tags="Tricky" diff="newconcept" -->
## Import modulů a `sys.path`

Když importujete modul, Python prohledává adresáře v `sys.path`. Na prvním místě je vždy **adresář obsahující spouštěný skript** (nebo aktuální adresář v REPL).

Při spouštění balíčků s relativními importy vždy spouštějte modul přepínačem **`-m`** z kořene projektu:
```bash
# SPRÁVNĚ:
python -m muj_balicek.podmodul

# ŠPATNĚ (rozbije relativní importy uvnitř balíčku):
python muj_balicek/podmodul.py
```

---

<!-- slide: id=id33 title="Třídy v moderním Pythonu: `@dataclass`" tags="Skip" diff="paradigm" python="3.12+" -->
## Třídy v moderním Pythonu: `@dataclass`

V minulosti vyžadovala definice datových tříd desítky řádků šablonovitého kódu (`__init__`, `__repr__`, `__eq__`).

Od Pythonu 3.7 je standardem **`dataclasses`**:
```python
from dataclasses import dataclass

@dataclass(slots=True, frozen=True)
class Bod:
    x: float
    y: float

b = Bod(1.0, 2.0)
print(b)  # Bod(x=1.0, y=2.0)
# b.x = 5.0  # FrozenInstanceError! Neměnný objekt šetřící paměť díky slots.
```

---

<!-- slide: id=id34 title="Atribut třídy vs Atribut instance" tags="Skip" diff="basics" -->
## Atribut třídy vs Atribut instance

Častá záměna mezi proměnnou třídy (*class attribute*) a proměnnou instance (*instance attribute*):

```python
class Pes:
    triky = []  # CHYBA: Sdíleno všemi instancemi třídy Pes!

    def pridej_trik(self, trik):
        self.triky.append(trik)

alik = Pes()
azor = Pes()
alik.pridej_trik("štěkej")
print(azor.triky)  # ['štěkej'] — Azor umí trik, který se naučil Alík!
```

### Správné řešení v `__init__`:
```python
class Pes:
    def __init__(self):
        self.triky = []  # Každý pes má vlastní nezávislý seznam
```

---

<!-- slide: id=id35 title="Dědičnost a `super()`" tags="Skip" diff="basics" -->
## Dědičnost a `super()`

Při vícenásobné dědičnosti Python používá algoritmus **C3 Linearization** k určení pořadí procházení tříd (*Method Resolution Order – MRO*).

Vždy volejte nadřazené metody pomocí **`super()`** bez argumentů:
```python
class Rodic:
    def __init__(self, jmeno):
        self.jmeno = jmeno

class Potomek(Rodic):
    def __init__(self, jmeno, vek):
        super().__init__(jmeno)  # Moderní čisté volání v Pythonu 3
        self.vek = vek
```

Pořadí MRO lze kdykoliv prozkoumat přes `Trida.mro()`.
