<!-- slide: id1, Zavedení řetězce (str literály), Core, basics -->
## Textové řetězce (`str`) v Pythonu

Textový řetězec `str` je v Pythonu 3 sekvence **Unicode znaků**.

Řetězcové literály zapisujeme pomocí jednoduchých uvozovek (apostrofů `'...'`) nebo dvojitých uvozovek (`"..."`). Pro víceřádkové texty slouží trojité uvozovky (`'''...'''` nebo `"""..."""`):

```python
# Krátké jednořádkové řetězce:
s1 = 'Ahoj, světe!'
s2 = "Python 3.12"

# Víceřádkové řetězce (zachovávají odřádkování i odsazení):
dlouhy_text = """Příliš žluťoučký kůň
    úpěl ďábelské ódy."""
```

> [!NOTE] C/Java srovnání
> V C a Javě je striktní rozdíl mezi znakem v apostrofech `'a'` (`char`) a řetězcem v uvozovkách `"a"` (`String`).
> V Pythonu typ `char` vůbec neexistuje – i samostatný znak je obyčejný jednoznakový řetězec `str` délky 1.

---
<!-- slide: id2, Možnosti zápisu řetězců v kódu, WOW, pythonic -->
## Možnosti zápisu dlouhých řetězců v kódu

Kromě trojitých uvozovek existují elegantní způsoby, jak rozdělit dlouhý text na více řádků bez vkládání nechtěných znaků nového řádku:

```python
# 1. Implicitní spojení sousedních literálů v závorkách (doporučeno PEP 8):
zprava = (
    "Toto je velmi dlouhá zpráva, která se v editoru "
    "vejde na 80 znaků na řádek a Python ji automaticky "
    "spojí do jednoho celistvého řetězce."
)

# 2. Spojení sousedních literálů na jednom řádku:
cesta = "C:\\" "Program Files\\" "Python"

# 3. Zpětné lomítko na konci řádku (line continuation):
dotaz = "SELECT * FROM uzivatele " \
        "WHERE aktivni = True"
```

Zápis v kulatých závorkách `(...)` je nejčistší a nevyžaduje náchylná zpětná lomítka na koncích řádků.

---
<!-- slide: id3, Uvozovky, apostrofy a escape sekvence, Core, basics -->
## Uvozovky a řídicí sekvence (*Escape sequences*)

Mezi apostrofy `'...'` a uvozovkami `"..."` není z hlediska funkčnosti žádný rozdíl. Výhodou je možnost snadného vkládání uvozovek druhého typu bez nutnosti zpětných lomítek:

```python
# Bez nutnosti escapování:
print("Řekl: 'Ahoj!'")
print('V adresáři "dokumenty" nic není.')

# S escapováním kolizních uvozovek:
print("V adresáři \"dokumenty\" nic není.")
print('Řekl: \'Ahoj!\'')
```

Běžné řídicí sekvence:
- `\n` – nový řádek (*newline*)
- `\t` – tabulátor
- `\\` – zpětné lomítko
- `\r` – návrat vozíku (*carriage return*)

---
<!-- slide: id4, Syrové řetězce (Raw strings), Core, pythonic -->
## Syrové řetězce (*Raw strings* `r"..."`)

Pokud před uvozovky předřadíme písmeno `r` nebo `R`, získáme **syrový řetězec** (*raw string*). V něm se zpětná lomítka `\` nepovažují za začátek řídicích sekvencí:

```python
# Běžný řetězec (\n se přeloží na nový řádek):
>>> s = "Cesta:\nove_projekty"
>>> print(s)
Cesta:
ove_projekty

# Raw řetězec (\n zůstane doslovným textem):
>>> s_raw = r"Cesta:\nove_projekty"
>>> print(s_raw)
Cesta:\nove_projekty
```

> [!TIP] Kde se `r"..."` používá nejčastěji?
> 1. **Regulární výrazy** (modul `re`): vzory jako `r"\d+\s+\w+"`.
> 2. **Cesty k souborům ve Windows**: `r"C:\Users\kolar\Documents"`.

---
<!-- slide: id5, Prázdný řetězec a konstruktor str(), Skip, basics -->
## Prázdný řetězec a konstruktor `str()`

Prázdný řetězec lze zapsat prázdnými uvozovkami `""`, apostrofy `''`, nebo voláním konstruktoru bez parametrů:

```python
prazdny_1 = ""
prazdny_2 = ''
prazdny_3 = str()

len(prazdny_1)  # 0
bool(prazdny_1) # False (prázdný řetězec je v logickém kontextu 'falsy')
```

### Konstruktor `str(obj)` pro převod na text:
Funkce `str()` převede libovolný objekt na jeho čitelnou textovou reprezentaci:
```python
>>> str(12345)
'12345'
>>> str([1, 2, 3])
'[1, 2, 3]'
>>> str(None)
'None'
```

---
<!-- slide: id6, Řetězce jako sekvence (Indexování a Slicing), Skip, basics -->
## Řetězce jako sekvence (Indexování a řezy)

Řetězec je sekvenční datový typ indexovaný celými čísly od nuly:

```python
xs = "Ahoj, světe!"
# Indexy zleva:   0  1  2  3  4  5  6  7  8  9 10 11
# Znaky:          A  h  o  j  ,     s  v  ě  t  e  !
# Indexy zprava: -12 -11 -10 -9 -8 -7 -6 -5 -4 -3 -2 -1
```

```python
>>> len(xs)
12
>>> xs[0]      # První znak
'A'
>>> xs[-1]     # Poslední znak
'!'

# Řezy (slicing) [start:stop:step]:
>>> xs[0:4]    # Znaky 0 až 3 (stop je otevřený konec)
'Ahoj'
>>> xs[:4]     # Vynechaný start -> od začátku
'Ahoj'
>>> xs[6:]     # Vynechaný stop -> až do konce
'světe!'
>>> xs[::2]    # Každý druhý znak
'Ao,svt!'
>>> xs[::-1]   # Otočení řetězce pozpátku!
'!etěvs ,johA'

# Operátory in a násobení:
>>> "svět" in xs
True
>>> "ha" * 3
'hahaha'
```

---
<!-- slide: id7, Iterace přes řetězec smyčkou for-in, Core, pythonic -->
## Iterace přes řetězec smyčkou `for-in`

Protože je řetězec iterovatelný (*iterable*), lze jej procházet běžným `for` cyklem:

```python
# Přímý průchod po znacích:
for znak in "Python":
    print(znak, end=" ")
# Výstup: P y t h o n

# Průchod s indexem pomocí enumerate():
for idx, znak in enumerate("ahoj"):
    print(f"{idx}: {znak}")

# Průchod v opačném pořadí (reversed):
for znak in reversed("kód"):
    print(znak, end="")  # dók

# Seřazené znaky v abecedním pořadí (sorted vrátí list):
znaky = sorted("cba")
print(znaky)  # ['a', 'b', 'c']
```

---
<!-- slide: id8, Neměnnost řetězců (Immutability), Tricky, resyntax -->
## Neměnnost řetězců (*Immutability*)

Řetězce jsou **neměnné** (*immutable*). Znak na daném indexu nelze přepsat:

```python
>>> s = "python"
>>> s[0] = "P"
TypeError: 'str' object does not support item assignment
```

Jakákoliv operace, která zdánlivě mění řetězec (např. `+`, `.replace()`, `.upper()`), ve skutečnosti **vytvoří v paměti zbrusu nový objekt řetězce**:

```python
# Operátor += vytvoří nový řetězec a přepojí visačku proměnné:
s = "Ahoj"
s += " světe"  # Vzniká nový objekt 'Ahoj světe'
```

> [!TIP] Spojování mnoha řetězců v cyklu
> Zřetězení v cyklu přes `+=` má kvadratickou složitost $O(n^2)$ kvůli neustálému přealokování paměti.
> Vždy ukládejte části do seznamu a spojte je metodou `''.join(seznam)`, což proběhne lineárně v čase **$O(n)$**.

---
<!-- slide: id9, Formátování výstupu (f-string, format, %), Core, pythonic -->
## Formátování řetězců v praxi

Přehled moderních přístupů k formátování:

```python
nazev = "Kniha"
cena = 499.50
sleva = 0.20

# Moderní doporučený standard: f-string (Python 3.6+)
info = f"{nazev}: {cena * (1 - sleva):.2f} Kč"
print(info)
# Kniha: 399.60 Kč

# Zápis s metodou format():
info2 = "{0}: {1:.2f} Kč".format(nazev, cena * (1 - sleva))

# Vnořené výrazy v f-stringu (Python 3.12+):
# Od 3.12 lze uvnitř složených závorek používat uvozovky bez omezení:
print(f"Položka: {nazev.upper() if cena > 100 else 'levná'}")
```

---
<!-- slide: id10, Zarovnání textu: center(), ljust(), rjust(), Skip, pythonic -->
## Zarovnání textu: `center()`, `ljust()`, `rjust()`

Pro formátování pevných textových tabulek na konzoli nabízí `str` metody pro doplnění výplňových znaků:

```python
slovo = "Python"

# Zarovnání na střed (délka 20):
print(slovo.center(20))
# '       Python       '

# Zarovnání s vlastním výplňovým znakem:
print(slovo.center(20, "="))
# '=======Python======='

# Zarovnání vlevo:
print(slovo.ljust(15, "."))
# 'Python.........'

# Zarovnání vpravo:
print(slovo.rjust(15, " "))
# '         Python'

# Doplnění nulami zleva (užitečné pro čísla):
print("42".zfill(5))
# '00042'
```

---
<!-- slide: id11, Analýza obsahu řetězce (metody isXXX), Core, basics -->
## Analýza obsahu řetězce (metody `is...()`)

Testovací metody vracející pravdivostní hodnotu `bool`:

```python
# Alfanumerické znaky:
"user123".isalnum()     # True
"user_123".isalnum()    # False (podtržítko není písmeno ani číslice)

# Pouze písmena:
"Praha".isalpha()       # True
"Praha 1".isalpha()     # False (obsahuje mezeru a číslici)

# Pouze číslice:
"12345".isdigit()       # True
"12.34".isdigit()       # False (tečka není číslice)

# Bílé znaky (mezery, tabulátory, nové řádky):
"   \t\n  ".isspace()   # True

# Velikost písmen:
"python".islower()      # True
"PYTHON".isupper()      # True
"Válka S Mloky".istitle() # True (každé slovo začíná velkým písmenem)

# Platný identifikátor proměnné v Pythonu:
"moje_promenna".isidentifier() # True
"123promenna".isidentifier()   # False (nesmí začínat číslicí)
```

---
<!-- slide: id12, Validace reálných čísel z textu, Tricky, pythonic -->
## Validace reálných čísel z textu

Zatímco `s.isdigit()` ověří celé číslo bez znaménka, metoda jako `s.isfloat()` v Pythonu **neexistuje**.

Nejspolehlivějším a nejvíce pythonickým přístupem (filozofie EAFP: *Easier to Ask for Forgiveness than Permission*) je blok `try-except`:

```python
def je_cislo(text: str) -> bool:
    """Ověří, zda text představuje platné číslo (celé i reálné, včetně znaménka)."""
    try:
        float(text)
        return True
    except ValueError:
        return False

print(je_cislo("42"))       # True
print(je_cislo("-3.1415"))  # True
print(je_cislo("1e-5"))     # True (vědecký zápis)
print(je_cislo("abc"))      # False
```

---
<!-- slide: id13, Počítání výskytů podřetězců: count(), Core, basics -->
## Počítání výskytů: metoda `count()`

Metoda `s.count(sub[, start[, end]])` spočítá počet **nepřekrývajících se** výskytů podřetězce:

```python
text = "slon, pes, kočka, pes, myš, pes"

print(text.count("pes"))    # 3
print(text.count("kůň"))    # 0

# Pozor na překrývající se vzory:
# Ve 'aaaa' najde 'aa' pouze 2x (indexy 0-1 a 2-3), nikoliv 3x:
print("aaaa".count("aa"))   # 2
```

Lze omezit rozsah hledání výřezem `start` a `end`:
```python
# Hledáme od indexu 10 dále:
print(text.count("pes", 10)) # 2
```

---
<!-- slide: id14, Testování začátku a konce: startswith() a endswith(), WOW, pythonic -->
## Začátek a konec řetězce: `startswith()` a `endswith()`

Ověří, zda řetězec začíná nebo končí daným vzorem:

```python
url = "https://mff.cuni.cz"

print(url.startswith("https://")) # True
print(url.endswith(".cz"))        # True
```

> [!TIP] Předání n-tice možností (*Tuple of Prefixes*)
> Obě metody podporují jako argument **n-tici** (`tuple`). Vrátí `True`, pokud řetězec vyhovuje **kterémukoliv** z uvedených vzorů:
> ```python
> soubor = "obrazek.png"
> 
> # Test na více přípon současně:
> if soubor.endswith((".png", ".jpg", ".jpeg", ".webp")):
>     print("Jedná se o podporovaný obrázek.")
> ```

---
<!-- slide: id15, Vyhledávání podřetězců: index() vs. find(), Tricky, pythonic -->
## Vyhledávání podřetězců: `find()` vs. `index()`

Python nabízí dvě dvojice metod pro nalezení pozice podřetězce:

```python
s = "Ahoj, světe!"

# 1. Metoda find() / rfind() -> vrací -1 při nenalezení:
pos = s.find("svět")    # 6
chybi = s.find("pes")   # -1

# 2. Metoda index() / rindex() -> vyvolá ValueError při nenalezení:
pos2 = s.index("svět")  # 6
# s.index("pes")        # ValueError: substring not found
```

> [!CAUTION] Past metody `find()`
> Protože `-1` je v Pythonu pravdivá hodnota (*truthy*) a zároveň platný záporný index, kód:
> ```python
> if s.find("pes"):  # POZOR! -1 se vyhodnotí jako True!
>     ...
> ```
> je závažná chyba. V podmínkách vždy používejte operátor `in`:
> ```python
> if "pes" in s:
>     ...
> ```

---
<!-- slide: id16, Změna velikosti písmen a casefold(), Skip, basics -->
## Změna velikosti písmen a Unicode

Metody pro transformaci velikosti písmen:

```python
text = "Příliš ŽLUŤOUČKÝ kůň"

print(text.upper())      # "PŘÍLIŠ ŽLUŤOUČKÝ KŮŇ"
print(text.lower())      # "příliš žluťoučký kůň"
print(text.title())      # "Příliš Žluťoučký Kůň"
print(text.capitalize()) # "Příliš žluťoučký kůň" (pouze první písmeno textu)
print(text.swapcase())   # "pŘÍLIŠ žluťoutký KŮŇ"
```

> [!TIP] `casefold()` pro Unicode porovnávání bez ohledu na velikost
> Pro porovnávání textů bez ohledu na velikost písmen (*case-insensitive*) nepoužívejte `.lower()`, nýbrž **`.casefold()`**.
> Zvládá speciální Unicode ekvivalence, např. německé ostré `ß`:
> ```python
> s1 = "straße"
> s2 = "STRASSE"
> s1.lower() == s2.lower()       # False ('straße' != 'strasse')
> s1.casefold() == s2.casefold() # True ('strasse' == 'strasse')
> ```

---
<!-- slide: id17, Ořezávání předpon a přípon: removeprefix() a removesuffix(), WOW, pythonic -->
## Ořezávání předpon a přípon (Python 3.9+)

Od verze **Python 3.9** (PEP 616) máme k dispozici dvě jednoznačné a bezpečné metody:

```python
nazev = "IMG_4281.jpg"

# Odstranění předpony:
cisty_nazev = nazev.removeprefix("IMG_")
print(cisty_nazev)  # "4281.jpg"

# Odstranění přípony:
kmen = cisty_nazev.removesuffix(".jpg")
print(kmen)         # "4281"
```

Pokud řetězec zadanou předponu či příponu neobsahuje, metody vrátí původní řetězec beze změny:
```python
"soubor.txt".removesuffix(".pdf")  # "soubor.txt"
```

---
<!-- slide: id18, Ořezávání bílých znaků: strip(), lstrip(), rstrip(), Tricky, pythonic -->
## Ořezávání okrajů: `strip()`, `lstrip()`, `rstrip()`

Metoda `strip()` odstraňuje znaky ze začátku a konce řetězce:

```python
# Bez parametrů odstraňuje bílé znaky (mezery, tabulátory, \n):
raw = "   \n\t  Uživatelský vstup  \r\n  "
print(repr(raw.strip()))
# 'Uživatelský vstup'

print(repr(raw.lstrip())) # Ořeže pouze zleva
print(repr(raw.rstrip())) # Ořeže pouze zprava
```

> [!WARNING] Záludnost: `strip()` bere množinu znaků, ne slovo!
> Argument metody `strip("abc")` neříká „odstraň slovo abc“, nýbrž **„odstraňuj jakýkoliv ze znaků 'a', 'b', 'c', dokud nenarazíš na jiný znak“**:
> ```python
> >>> "www.vscht.cz".strip("w.cz")
> 'sht'  # Odstranilo 'w', tečku i 'c' ze slova vscht!
> 
> # Pro bezpečné odstranění konkrétního slova použijte removeprefix / removesuffix:
> >>> "www.vscht.cz".removeprefix("www.").removesuffix(".cz")
> 'vscht'
> ```

---
<!-- slide: id19, Záměna podřetězců: replace(), Skip, basics -->
## Záměna podřetězců: metoda `replace()`

Metoda `s.replace(old, new[, count])` nahradí výskyty podřetězce novým textem:

```python
veta = "Jablko, hruška, banán, jablko"

# Nahrazení všech výskytů:
print(veta.replace("jablko", "pomeranč"))
# "Jablko, hruška, banán, pomeranč" (pozor na velikost písmen!)

# Nahrazení s omezením počtu záměn (count=1):
cesta = "user/local/bin/python"
print(cesta.replace("/", "\\", 1))
# "user\local/bin/python"
```

Pro pokročilé nahrazování podle regulárních vzorů slouží funkce `re.sub()` z modulu `re`.

---
<!-- slide: id20, Překladové tabulky: translate() a maketrans() I, WOW, newconcept -->
## Překladové tabulky: `translate()` a `maketrans()` I

Pro hromadné nahrazování jednotlivých znaků (např. odstraňování diakritiky nebo šifrování) je metoda `translate()` násobně rychlejší než řetězení mnoha `.replace()`:

```python
# Vytvoření mapovací tabulky z dvou stejně dlouhých řetězců:
vstup  = "áéíóúýčďěňřšťůž"
vystup = "aeiouycdenrstuz"
tabulka = str.maketrans(vstup, vystup)

text = "Příliš žluťoučký kůň úpěl ďábelské ódy."
odhackovano = text.translate(tabulka)
print(odhackovano)
# "Prilis zlutoucky kun upel dabelske ody."
```

Metoda `translate()` je implementována přímo v C a provádí jednoprůchodový překlad s časovou složitostí $O(n)$.

---
<!-- slide: id21, Překladové tabulky II – mazání znaků, Core, newconcept -->
## Překladové tabulky II (Mazání nežádoucích znaků)

Třetí argument funkce `str.maketrans(from, to, delete)` definuje znaky, které mají být z výsledného textu **zcela vymazány**:

```python
# Převeď 'a', 'b', 'c' na '1', '2', '3' a smaž všechny interpunkční znaky:
tabulka = str.maketrans("abc", "123", "!?,.-")

raw_text = "Ahoj, světe! Jak se máš?"
print(raw_text.translate(tabulka))
# "Ahoj světe Jk se máš"
```

Tento přístup je nejrychlejším způsobem čištění textu od interpunkce v datových vědách a NLP.

---
<!-- slide: id22, Překladové tabulky III (Slovníkové mapování), Skip, pythonic -->
## Překladové tabulky III (Slovníkové mapování)

Do `str.maketrans()` lze předat také slovník, kde klíčem je znak a hodnotou může být libovolně dlouhý řetězec nebo `None` (pro smazání znaku):

```python
# Mapování znaků na HTML entity:
html_tabulka = str.maketrans({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
})

kod = 'if x < 10 and y > 20: print("OK")'
html_kod = kod.translate(html_tabulka)
print(html_kod)
# if x &lt; 10 and y &gt; 20: print(&quot;OK&quot;)
```

---
<!-- slide: id23, Dělení řetězců: split() a rsplit(), Core, basics -->
## Dělení řetězců: `split()` a `rsplit()`

Metoda `split()` rozřeže řetězec na seznam podřetězců (`list[str]`):

```python
# 1. Bez parametrů: dělí podle libovolného počtu bílých znaků (whitespace)
# a automaticky ignoruje prázdná místa na začátku i konci:
text = "  Praha   Brno    Ostrava   Plzeň  "
mesta = text.split()
print(mesta)
# ['Praha', 'Brno', 'Ostrava', 'Plzeň']

# 2. S konkrétním oddělovačem:
csv_line = "Karel;Novak;30;Praha"
polozky = csv_line.split(";")
print(polozky)
# ['Karel', 'Novak', '30', 'Praha']

# 3. Omezení maximálního počtu dělení (maxsplit):
zaznam = "id_102: Jan Novák: vedoucí oddělení: Praha"
klic, zbytek = zaznam.split(": ", maxsplit=1)
print(f"Klíč: '{klic}', Zbytek: '{zbytek}'")
```

---
<!-- slide: id24, Spojování řetězců: metoda join(), WOW, pythonic -->
## Spojování řetězců: metoda `join()`

Metoda `join()` spojí prvky iterovatelného kontejneru (seznamu, n-tice) do jednoho výsledného řetězce:

$$\text{'ODDĚLOVAČ'}.\operatorname{join}(\text{kolekce})$$

```python
slova = ["Python", "je", "mocný", "jazyk"]

# Spojení mezerou:
print(" ".join(slova))
# "Python je mocný jazyk"

# Spojení čárkou a mezerou:
print(", ".join(slova))
# "Python, je, mocný, jazyk"

# Spojení do řádků:
print("\n".join(slova))
```

> [!TIP] Rychlá normalizace mezer v textu
> Kombinace `split()` a `join()` je idiomatický způsob vyčištění vícenásobných mezer:
> ```python
> spinavy_text = "Text   s     mnoha   nadbytečnými    mezerami."
> cisty_text = " ".join(spinavy_text.split())
> # "Text s mnoha nadbytečnými mezerami."
> ```

---
<!-- slide: id25, Dělení na trojici: partition() a splitlines(), WOW, pythonic -->
## Metody `partition()` a `splitlines()`

Specializované metody pro čistší dělení:

### `partition(sep)`:
Rozdělí řetězec na pevnou trojici: `(před_separátorem, separátor, za_separátorem)`.
Na rozdíl od `split()` nikdy nezpůsobí chybu počtu položek při rozbalování:

```python
konfigurace = "port = 8080"
klic, rovnitko, hodnota = konfigurace.partition("=")

print(f"Klíč: '{klic.strip()}', Hodnota: '{hodnota.strip()}'")
# Klíč: 'port', Hodnota: '8080'

# Pokud separátor chybí, vrátí (původní_text, '', ''):
"bez_rovnitka".partition("=")  # ('bez_rovnitka', '', '')
```

### `splitlines(keepends=False)`:
Rozdělí text na řádky podle libovolného ukončení řádku (`\n`, `\r\n`, `\r`):
```python
text = "Řádek 1\r\nŘádek 2\nŘádek 3"
print(text.splitlines())
# ['Řádek 1', 'Řádek 2', 'Řádek 3']
```

---
<!-- slide: id26, Převod mezi znakem a kódem: ord() a chr(), Core, basics -->
## Práce se znaky: funkce `ord()` a `chr()`

Pro převod mezi znakem a jeho číselným kódem v Unicode tabulce slouží dvě vestavěné funkce:

- **`ord(znak)`**: Vrátí celočíselný kód (*Unicode code point*) zadaného jednoznakového řetězce.
- **`chr(cislo)`**: Vrátí znak odpovídající zadanému celočíselnému kódu.

```python
>>> ord('A')
65
>>> ord('ř')
345
>>> ord('🐍')
128013

>>> chr(65)
'A'
>>> chr(345)
'ř'
>>> chr(128013)
'🐍'
```

Céčkovská posuvná šifra (Caesarova šifra):
```python
posun = 3
zasifrovane = "".join(chr(ord(c) + posun) for c in "Ahoj")
print(zasifrovane)  # 'Dkrm'
```
