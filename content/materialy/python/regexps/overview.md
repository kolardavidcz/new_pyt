<!-- slide: id1, Úvod do regulárních výrazů, Skip, basics -->
## Regulární výrazy v Pythonu

Regulární výrazy (*regular expressions* / *regex*) slouží pro pokročilé vyhledávání, validaci a transformaci textu podle předepsaných vzorů. Využijeme je především pro:

1. **Validaci a inspekci**: Ověření, zda text odpovídá formátu (e-mail, rodné číslo, URL, datum).
2. **Extrakci dat**: Vyhledání všech výskytů specifických entit a tokenů v nestrukturovaném textu.
3. **Nahrazování a parsování**: Komplexní transformace tam, kde základní metody typu `str` (`split`, `replace`) nestačí.

> [!NOTE] C/C++ a Java srovnání
> V C vyžaduje parsování složité volání `strtok`, `sscanf` nebo manuální stavové automaty. V Pythonu zvládne standardní modul `re` stejnou práci na několik málo řádků.

---
<!-- slide: id2, Modul „re“ a kompilační příznaky, Core, basics -->
## Standardní modul `re`

Všechny nástroje pro práci s regulárními výrazy jsou obsaženy ve standardním modulu `re`:

```python
import re
```

### Hlavní kompilační příznaky (*flags*):
Příznaky ovlivňují chování vyhledávacího enginu. Lze je kombinovat bitovým operátorem `|` (*bitwise OR*):

| Dlouhý název | Zkratka | Význam |
| :--- | :--- | :--- |
| `re.IGNORECASE` | `re.I` | Ignoruje velikost písmen (nerozlišuje velká a malá). |
| `re.MULTILINE` | `re.M` | Kotvy `^` a `$` matchují začátek a konec **každého řádku**, nikoliv pouze celého řetězce. |
| `re.DOTALL` | `re.S` | Znak tečky `.` matchuje **jakýkoliv znak včetně nového řádku `\n`**. |
| `re.VERBOSE` | `re.X` | Uvolněný režim: ignoruje bílé znaky a umožňuje vkládat komentáře za `#`. |
| `re.ASCII` | `re.A` | Zkratky `\w`, `\b`, `\s`, `\d` matchují pouze ASCII znaky místo celého Unicode. |

---
<!-- slide: id3, Kompilace vzorů – re.compile(), Core, resyntax -->
## Kompilace vzorů: `re.compile()`

Pokud tentýž regulární výraz používáte v programu opakovaně (např. v cyklu), je doporučeno jej předkompilovat pomocí `re.compile()`:

```python
import re

# Vždy používejte surové řetězce r"..." kvůli zpětným lomítkům:
pattern = re.compile(r"<([a-z]\w*).*?>", re.IGNORECASE | re.MULTILINE)
```

### Proč předkompilovat?
- **Výkon**: Řetězcový zápis se přeloží do vnitřní stavové reprezentace pouze jednou.
- **Čistota kódu**: Zkompilovaný objekt má metody (`pattern.search()`, `pattern.findall()`), což zpřehledňuje volání.

> [!TIP] Vždy používejte `r"..."` pro regulární výrazy
> Bez prefixu `r` interpret Pythonu vyhodnotí sekvence jako `\b` (backspace) nebo `\n` ještě před předáním do enginu `re`. U syrového řetězce dorazí do enginu doslovné znaky `\` a `b` (hranice slova).

---
<!-- slide: id4, Iterativní vyhledávání – finditer(), WOW, pythonic -->
## Paměťově efektivní vyhledávání: `finditer()`

Metoda `finditer()` je nejvíce pythonickým způsobem prohledávání textu. Vrací **líný iterátor** přes všechny nepřekrývající se nálezy ve formě objektů `re.Match`:

```python
import re

html = """
<p class="para1">
    Odstavec s <em>důrazem</em> a <b>tučným</b> textem.
</p>
"""

pattern = re.compile(r"<([a-z]\w*).*?>", re.IGNORECASE)

for match in pattern.finditer(html):
    print(f"Nalezen tag na pozici {match.span()}: {match.group()}")
```

### Výstup:
```text
Nalezen tag na pozici (1, 18): <p class="para1">
Nalezen tag na pozici (34, 38): <em>
Nalezen tag na pozici (61, 64): <b>
```

Paměťová složitost je $O(1)$ vůči počtu nálezů – ideální pro gigabajtové logy a datové proudy.

---
<!-- slide: id5, Objekt zásahu (re.Match), Core, pythonic -->
## Objekt zásahu (`re.Match`)

Při úspěšném nálezu vrátí metody objekt `re.Match`, který obsahuje kompletní metadata o shodě:

```python
match = pattern.search('<a href="https://vscht.cz">Web</a>')

# 1. Celý zachycený text:
print(match.group())     # '<a href="https://vscht.cz">'
print(match.group(0))    # Ekvivalent group()

# 2. Zachycené podskupiny v závorkách:
print(match.groups())    # ('a',)

# 3. Pozice v původním textu:
print(match.start())     # 0 (index začátku)
print(match.end())       # 27 (index konce)
print(match.span())      # (0, 27) (dvojice start, end)
```

---
<!-- slide: id6, Vyhledání všech výskytů: findall(), Tricky, pythonic -->
## Vyhledání všech výskytů: `findall()`

Metoda `findall()` shromáždí všechny zásahy do obyčejného seznamu `list`.

> [!WARNING] Pozor na změnu typu návratové hodnoty s podskupinami!
> Výstup `findall()` závisí na přítomnosti závorek `(...)` ve vzoru:
>
> 1. **Vzor BEZ závorek**: vrací seznam řetězců (`list[str]`):
>    ```python
>    re.findall(r"\d+", "Rok 2024 a 365 dní")
>    # ['2024', '365']
>    ```
>
> 2. **Vzor S JEDNOU závorkou**: vrací seznam zachycených skupin (`list[str]`):
>    ```python
>    re.findall(r"<([a-z]+)>", "<p>Ahoj <em>světe</em></p>")
>    # ['p', 'em']
>    ```
>
> 3. **Vzor S VÍCE závorkami**: vrací seznam n-tic (`list[tuple[str, ...]]`):
>    ```python
>    re.findall(r"(\w+)=(\d+)", "a=10 b=20 c=30")
>    # [('a', '10'), ('b', '20'), ('c', '30')]
>    ```

---
<!-- slide: id7, Hledání kdekoliv v textu: search(), Core, resyntax -->
## Hledání kdekoliv v textu: `search()`

Metoda `search()` prohledává řetězec zleva doprava a vrátí **první odpovídající výskyt**, nebo `None`, pokud vzor nebyl nalezen:

```python
import re

text = "Datum vystavení: 2026-10-27, splatnost: 2026-11-10"
pattern = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")

match = pattern.search(text)
if match:
    print(f"Nalezeno první datum: {match.group()} na pozici {match.start()}")
else:
    print("Žádné datum nenalezeno.")
```

> [!TIP] Využití v podmínkách s walrus operátorem `:=` (Python 3.8+)
> ```python
> if match := pattern.search(text):
>     print(f"Datum: {match.group()}")
> ```

---
<!-- slide: id8, Hledání od začátku textu: match() vs. fullmatch(), Tricky, resyntax -->
## Hledání od začátku: `match()` a `fullmatch()`

Python rozlišuje tři různé stupně ukotvení:

- **`search(text)`**: Hledá vzor **kdekoliv** v řetězci.
- **`match(text)`**: Hledá shodu **pouze od začátku** řetězce (implicitní kotva `^`).
- **`fullmatch(text)`** (Python 3.4+): Vyžaduje, aby vzoru odpovídal **celý řetězec od začátku do konce** (ekvivalent `^vzor$`).

```python
pattern = re.compile(r"\d+")

# search najde čísla i uprostřed:
pattern.search("ID: 12345")    # <re.Match: '12345'>

# match selže, protože na začátku jsou písmena "ID":
pattern.match("ID: 12345")     # None
pattern.match("12345 (ID)")    # <re.Match: '12345'>

# fullmatch vyžaduje kompletní shodu celého textu (ideální pro validaci formulářů):
pattern.fullmatch("12345")     # <re.Match: '12345'>
pattern.fullmatch("12345 a")   # None
```

---
<!-- slide: id9, Pojmenované skupiny (Named Capture Groups), WOW, pythonic -->
## Pojmenované skupiny (*Named Capture Groups*)

Namísto nepřehledného číslování indexů `group(1)`, `group(2)` umožňuje Python pojmenovat záchytné skupiny pomocí syntaxe:

$$\mathbf{(?P<jméno\_skupiny>vzor)}$$

```python
import re

url = "https://vscht.cz:8080/studium/rozvrh"
pattern = re.compile(
    r"(?P<protokol>https?)://"
    r"(?P<domena>[^:/]+)"
    r"(?::(?P<port>\d+))?"
    r"(?P<cesta>/.*)?"
)

if m := pattern.search(url):
    # Přístup přes jméno skupiny:
    print(m.group("domena"))   # 'vscht.cz'
    print(m.group("port"))     # '8080'
    
    # Export všech skupin do přehledného slovníku:
    print(m.groupdict())
    # {'protokol': 'https', 'domena': 'vscht.cz', 'port': '8080', 'cesta': '/studium/rozvrh'}
```

---
<!-- slide: id10, Metoda group() a extrakce parametrů, Core, pythonic -->
## Metoda `group()` a extrakce parametrů

Možnosti volání metody `group()` na objektu `re.Match`:

```python
# Mějme shodu s pojmenovanými i pozičními skupinami:
# Skupina 0: celý match
# Skupina 1 ('den'): \d{2}
# Skupina 2 ('mesic'): \d{2}
# Skupina 3 ('rok'): \d{4}

m = re.search(r"(?P<den>\d{2})\.(?P<mesic>\d{2})\.(?P<rok>\d{4})", "27.10.2026")

# Výběr jednotlivých skupin:
den = m.group(1)            # '27'
rok = m.group('rok')        # '2026'

# Hromadný výběr n-tice:
d, m_val = m.group('den', 'mesic')
print(d, m_val)             # ('27', '10')

# Bezpečná extrakce s výchozí hodnotou pro volitelné skupiny:
m.groups(default="N/A")
m.groupdict(default="N/A")
```

---
<!-- slide: id11, Rozdělení textu podle vzoru: re.split(), Tricky, pythonic -->
## Rozdělení textu podle vzoru: `re.split()`

Regulární varianta k řetězcovému `.split()` umožňuje dělit podle proměnných oddělovačů:

```python
import re

# Rozdělení podle různých interpunkčních oddělovačů s mezerami:
data = "jablko, hruska ;  banan / pomeranc"
plody = re.split(r"\s*[,;/]\s*", data)
print(plody)
# ['jablko', 'hruska', 'banan', 'pomeranc']
```

> [!TIP] Zachování oddělovačů pomocí záchytných závorek
> Pokud oddělovač uzavřete do závorek `(...)`, `re.split()` jej **nezahodí**, nýbrž vloží do výsledného seznamu mezi rozdělená slova:
> ```python
> vzorec = "10 + 20 * 30"
> tokeny = re.split(r"(\s*[\+\*]\s*)", vzorec)
> print(tokeny)
> # ['10', ' + ', '20', ' * ', '30']
> ```

---
<!-- slide: id12, Nahrazování textu: re.sub(), Core, resyntax -->
## Nahrazování textu: `re.sub()`

Funkce `re.sub(pattern, repl, string, count=0)` nahradí výskyty vzoru novým textem:

```python
import re

html = "<p>Odstavec s <script>alert(1)</script> nebezpečným kódem.</p>"

# Odstranění všech tagů <script>...</script>:
cisty = re.sub(r"<script.*?>.*?</script>", "", html, flags=re.DOTALL)
print(cisty)
# "<p>Odstavec s  nebezpečným kódem.</p>"
```

### Nahrazování pomocí funkce (*Callable replacement*):
Namísto fixního řetězce lze jako `repl` předat funkci, která obdrží objekt `match` a vrátí náhradní text:

```python
def prevod_teploty(match: re.Match) -> str:
    fahrenheit = float(match.group(1))
    celsius = (fahrenheit - 32) * 5 / 9
    return f"{celsius:.1f} °C"

text = "Dnes je 68F a zítra bude 77F."
vysledek = re.sub(r"(\d+)F", prevod_teploty, text)
print(vysledek)
# "Dnes je 20.0 °C a zítra bude 25.0 °C."
```

---
<!-- slide: id13, Zpětné reference v náhradách: \g<name>, Tricky, resyntax -->
## Zpětné reference v náhradách (`\g<...>`)

Při nahrazování lze v cílovém řetězci odkazovat na zachycené skupiny:

```python
import re

text = "Datum: 2026-10-27"

# 1. Odkaz na číslo skupiny: \g<1>, \g<2>
# Převod formátu RRRR-MM-DD na DD.MM.RRRR:
novy_text = re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\g<3>.\g<2>.\g<1>", text)
print(novy_text)
# "Datum: 27.10.2026"

# 2. Odkaz na pojmenovanou skupinu: \g<nazev>
vzor = re.compile(r"(?P<rok>\d{4})-(?P<mesic>\d{2})-(?P<den>\d{2})")
novy_text2 = vzor.sub(r"\g<den>/\g<mesic>/\g<rok>", text)
print(novy_text2)
# "Datum: 27/10/2026"
```

> [!WARNING] Proč raději `\g<1>` než `\1`?
> Pokud za odkazem `\1` bezprostředně následuje číslice (např. `\10`), parser by hledal desátou skupinu! Zápis `\g<1>0` jednoznačně odkazuje na skupinu 1 následovanou číslicí 0.

---
<!-- slide: id14, Nahrazování s počítadlem změn: re.subn(), Core, pythonic -->
## Nahrazování s počtem změn: `re.subn()`

Metoda `subn()` funguje identicky jako `sub()`, ale navíc vrací počet provedených náhrad v podobě dvojice `(vysledny_text, pocet_zmen)`:

```python
import re

text = "pes kočka pes pes papoušek pes"
pattern = re.compile(r"\bpes\b")

novy_text, pocet = pattern.subn("pes [pes]", text)

print(f"Výsledný text: {novy_text}")
print(f"Počet nalezených a nahrazených výskytů: {pocet}")
# Počet nalezených a nahrazených výskytů: 4
```

To umožňuje snadno zjistit, zda a kolikrát byl vzor v rozsáhlém dokumentu uplatněn, aniž by bylo nutné předem volat `len(findall())`.

---
<!-- slide: id15, Přehledné psaní složitých vzorů: re.VERBOSE, WOW, pythonic -->
## Přehledný zápis regulárních výrazů: `re.VERBOSE`

Dlouhé regulární výrazy bývají nečitelné ("write-only code"). Pomocí přepínače `re.VERBOSE` (`re.X`) můžeme výraz rozdělit na více řádků, vkládat volné mezery a doplňovat komentáře:

```python
import re

# Čitelný validátor e-mailových adres:
email_pattern = re.compile(r"""
    ^                       # Začátek řetězce
    (?P<user>[\w.+-]+)      # Uživatelské jméno (písmena, tečky, plus)
    @                       # Zavináč
    (?P<host>[\w-]+)        # Doména 2. řádu
    (?:\.[\w-]+)+           # Jedna nebo více doménových přípon (.cz, .co.uk)
    $                       # Konec řetězce
""", re.VERBOSE | re.IGNORECASE)

m = email_pattern.match("student.vscht@vscht.cz")
print(m.groupdict() if m else "Neplatný e-mail")
```

Všechny běžné mezery a komentáře začínající `#` jsou enginem ignorovány. Pokud potřebujete doslovnou mezeru, zapište ji jako `\ ` nebo `[ ]`.

---
<!-- slide: id16, Zkrácený přístup přímo přes modul re, Skip, basics -->
## Přímé volání funkcí modulu `re`

Všechny metody lze volat přímo z modulu `re` bez explicitního volání `re.compile()`:

```python
import re

# Modulové funkce berou vzor jako první parametr:
re.search(r"\d+", text)
re.findall(r"\w+", text)
re.split(r",\s*", text)
re.sub(r"\s+", " ", text)
```

### Kdy použít kterou variantu?
- **Přímo přes modul**: Jednorázové použití ve skriptu. CPython si interně udržuje LRU cache pro posledních 512 zkompilovaných vzorů, takže režie je minimální.
- **Explicitní `re.compile()`**: Kód volaný opakovaně v cyklech, v knihovních modulech, nebo při použití `re.VERBOSE` komentovaných vzorů.

---
<!-- slide: id17, Překrývající se vzory a vyhlížení (Lookaround), WOW, pythonic -->
## Překrývající se vzory (*Overlapping Matches*)

Standardní metody `findall()` a `finditer()` vrací výhradně **nepřekrývající se** zásahy:

```python
import re

# Chceme najít všechna třípísmenná slova 'aba' v textu 'ababa':
print(re.findall(r"aba", "ababa"))
# Výstup: ['aba']  <- Druhé 'aba' začíná na indexu 2, kde se kryje s prvním!
```

### Řešení ve standardní knihovně: Kladné dopředné vyhlížení (*Positive Lookahead* `(?=...)`):
Vyhlížení konzumuje 0 znaků (*zero-width assertion*):

```python
# Hledáme prázdnou pozici následovanou skupinou (aba):
matches = re.findall(r"(?=(aba))", "ababa")
print(matches)
# Výstup: ['aba', 'aba']  <- Nalezena obě překrývající se slova!
```

---
<!-- slide: id18, Kdy regulární výrazy nepoužívat, Skip, basics -->
## Kdy regulární výrazy nepoužívat

Ačkoliv jsou regulární výrazy mocné, pro mnoho běžných operací jsou **zbytečně pomalé a nečitelné**:

| Úloha | Regulární výraz (nevhodné) | Idiomatický Python (rychlejší a čistší) |
| :--- | :--- | :--- |
| Začíná text prefixem? | `re.match(r"^https://", s)` | `s.startswith("https://")` |
| Končí text příponou? | `re.search(r"\.pdf$", s)` | `s.endswith(".pdf")` |
| Obsahuje text podřetězec? | `bool(re.search(r"pes", s))` | `"pes" in s` |
| Jednoduché nahrazení slova | `re.sub(r"pes", "kočka", s)` | `s.replace("pes", "kočka")` |
| Ořezání mezer | `re.sub(r"^\s+|\s+$", "", s)` | `s.strip()` |
| Parsování HTML/XML | `re.findall(r"<a href=...>", s)` | Použijte **BeautifulSoup** / `lxml`! |

> [!CAUTION] Slavné pravidlo regulárních výrazů
> *„Někteří lidé, když mají problém, řeknou si: ‚Vím, použiji regulární výrazy!‘ V tu chvíli mají problémy dva.“* — Jamie Zawinski
