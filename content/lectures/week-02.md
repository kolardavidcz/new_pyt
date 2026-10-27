<!-- slide: id=id1 title="Úvod a osnova" tags="Core" diff="basics" -->
## Master Přednáška 2: Textové řetězce (str), Kódování Unicode a Regulární výrazy

Vítejte ve druhé přednášce kurzu programování v jazyce Python. Dnešním tématem je práce s textem — nejběžnějším formátem pro výměnu vědeckých, bioinformatických i webových dat.

### Osnova dnešní 90minutové přednášky:
1. **Architektura textu**: C/Java modely (`char[]`, `std::string`, `String`) vs. CPython `str`.
2. **`str` pod kapotou**: Standard PEP 393 (Flexible String Representation) a immutabilita.
3. **Základní manipulace**: Indexování, řetězcové řezy (*slicing*) a proč v Pythonu neexistuje typ `char`.
4. **Metody řetězců**: Čištění (`strip`), dělení (`split`), skládání (`join`) a bezpečné hledání.
5. **Text vs. Bajty**: Rozdíl mezi `str` a `bytes`, kódování UTF-8, `.encode()` a `.decode()`.
6. **Past s kódováním v OS**: Proč vždy explicitně psát `encoding="utf-8"` u souborového I/O.
7. **Evoluce formátování**: Od `%` přes `.format()` k f-stringům a novinky Pythonu 3.12 (PEP 701).
8. **Čtení textových proudů**: Iterace přes soubor po řádcích v paměťové složitosti $O(1)$.
9. **Regulární výrazy (modul `re`)**: Raw stringy `r"..."`, chamtivost, skupiny a funkce `search` vs. `match`.
10. **Produkční most**: Předkompilace `re.compile()`, pojmenované skupiny a čitelné regexy s `re.VERBOSE`.

---
<!-- slide: id=id2 title="C/Java vs. Python: Reprezentace textu" tags="Core" diff="paradigm" -->
## Architektura textu: Od bajtového pole k plnému Unicode

V nízkoúrovňových a kompilovaných jazycích je reprezentace textu zatížena historickým vývojem:

```text
[ C / C++ ]
  char s[] = "ahoj";        ──> Pole 8bitových bajtů zakončené nulovým bajtem '\0' (ASCII / lokální kódování)
  std::string               ──> Dynamické pole bajtů (nerozumí vícebajtovým UTF-8 znakům bez knihoven)

[ Java ]
  String s = "ahoj";        ──> Pole 16bitových UTF-16 code units (char[]).
                                Emodži a historická písma vyžadují dva znaky (surrogate pairs)!

[ CPython 3 ]
  s = "ahoj 🐍"             ──> Plnohodnotný řetězec abstraktních Unicode znaků (Code Points).
                                Žádné ukončovací nuly, žádné surrogate pairs, O(1) indexace!
```

### Zásadní rozdíl: V Pythonu NEEXISTUJE samostatný typ `char`!
V C a Javě je `char` 1bajtový či 2bajtový primitivní celočíselný typ.
V Pythonu je i jediný znak textu **plnohodnotným jednoznakovým řetězcem typu `str`**:
```python
znak = "A"
print(type(znak))  # <class 'str'>
print(len(znak))   # 1
```

---
<!-- slide: id=id3 title="str pod kapotou: PEP 393" tags="Core" diff="paradigm" -->
## `str` pod kapotou: Standard PEP 393 (Flexible String Representation)

Jak může CPython zaručit, že přístup k libovolnému znaku `s[i]` má časovou složitost **$O(1)$**, když znaky v Unicode mohou mít různou délku v bajtech?

Od Pythonu 3.3 používá CPython standard **PEP 393**:
Interpret při vytvoření řetězce zkontroluje nejvyšší kódový bod znaku a zvolí nejúspornější fixní šířku pro **celý řetězec**:

| Nejvyšší znak v řetězci | Šířka znaku v paměti | Kódování paměti | Příklad obsahu |
| :--- | :--- | :--- | :--- |
| Do `U+00FF` (do 255) | **1 bajt** per znak | Latin-1 / ASCII | `"hello world"` |
| Do `U+FFFF` (do 65 535) | **2 bajty** per znak | UCS-2 | `"český text (řečtina, azbuka)"` |
| Nad `U+FFFF` | **4 bajty** per znak | UCS-4 | `"chemie ⚗️ a emodži 🐍"` |

```python
import sys

s1 = "hello"       # 1 bajt per znak
s2 = "příliš"      # 2 bajty per znak (obsahuje české znaky s diakritikou)
s3 = "had 🐍"      # 4 bajty per znak (emodži vyžaduje UCS-4)

print(sys.getsizeof(s1))  # 54 bajtů (hlavička + 5×1 B)
print(sys.getsizeof(s2))  # 86 bajtů (hlavička + 6×2 B)
print(sys.getsizeof(s3))  # 96 bajtů (hlavička + 5×4 B)
```

> [!NOTE]
> Díky PEP 393 je Pythoní práce s Unicode paměťově úsporná a indexování `s[i]` probíhá pouhým násobením indexu šířkou buňky ($O(1)$).

---
<!-- slide: id=id4 title="Neměnnost (Immutability) a spojování" tags="Core" diff="tricky" -->
## Neměnnost (*Immutability*) a Past kvadratického spojování

Objekty typu `str` jsou v Pythonu **striktně neměnné (immutable)**. Jakmile je řetězec vytvořen, nelze změnit žádný jeho znak:
```python
s = "Python"
s[0] = "J"  # TypeError: 'str' object does not support item assignment
```

### Proč je řetězec neměnný?
1. **Hešovatelnost**: Řetězec lze bezpečně použít jako klíč ve slovníku (`dict`) a prvek v množině (`set`).
2. **Bezpečnost paměti**: Řetězce lze bezpečně sdílet mezi vlákny bez zamykání.
3. **Internování (*String Interning*)**: CPython ukládá identifikátory a krátké texty pouze jednou v globální tabulce singletonů (`sys.intern()`).

### Kritická past: Skládání textu pomocí `+=` v cyklu:
```python
# KATASTROFÁLNÍ ANTIPATTERN: Časová složitost O(n^2)!
vysledek = ""
for slovo in velky_seznam_slov:
    vysledek += slovo  # Při každé iteraci se alokuje a kopíruje celý nový string!

# SPRÁVNÝ IDIOM: Časová složitost O(n)!
casti = []
for slovo in velky_seznam_slov:
    casti.append(slovo)
vysledek = "".join(casti)  # Alokuje paměť přesně jednou na základě celkové délky
```

---
<!-- slide: id=id5 title="Indexování a řetězcové řezy" tags="Core" diff="basics" -->
## Indexování a řezy řetězců (*String Slicing*)

Řetězce plně implementují sekvenční protokol:
$$\text{retezec}[\text{start} : \text{stop} : \text{krok}]$$

```python
text = "Bionformatika"

print(text[0])       # 'B' (první znak)
print(text[-1])      # 'a' (poslední znak)
print(text[0:4])     # 'Bion' (polouzavřený interval [0, 4))
print(text[:4])      # 'Bion' (od začátku)
print(text[4:])      # 'formatika' (až do konce)
print(text[::2])     # 'Bnomti' (každý druhý znak)
print(text[::-1])    # 'akitaminoinB' (obrácení řetězce!)
```

### Bezpečnost řezů oproti indexování:
Pokud přistoupíte k indexu mimo rozsah řetězce, Python vyvolá chybu:
```python
text[100]  # IndexError: string index out of range
```
Řezy (*slices*) jsou však k mezím tolerantní a automaticky se oříznou:
```python
print(text[4:100])  # 'formatika' (žádná chyba nevznikne)
```

---
<!-- slide: id=id6 title="Čištění a vyhledávání v textu" tags="Core" diff="basics" -->
## Metody řetězců: Čištění a vyhledávání

Při zpracování reálných dat potřebujeme text normalizovat a testovat:

### 1. Ořezání bílých znaků:
```python
radek = "   24.5 ; 10.2 \n\t"
cisty = radek.strip()  # Odstraní mezery, tabulátory a konce řádků na obou stranách
print(repr(cisty))     # '24.5 ; 10.2'
```

### 2. Testy začátku a konce:
Metody `.startswith()` a `.endswith()` přijímají i n-tici (*tuple*) možností:
```python
soubor = "experiment_01.csv"
if soubor.endswith((".csv", ".tsv", ".txt")):
    print("Podporovaný tabulkový formát!")
```

### 3. Vyhledání podřetězce: `.find()` vs. `.index()`:
```python
email = "student@vscht.cz"

# find() vrací index prvního výskytu, nebo -1 pokud podřetězec neexistuje:
pozice = email.find("@")  # 7
nenalezeno = email.find("#")  # -1 (bezpečné pro podmínky)

# index() funguje stejně, ale při nenalezení vyvolá výjimku ValueError:
# email.index("#")  # ValueError: substring not found!
```

---
<!-- slide: id=id7 title="Dělení a spojování: split a join" tags="Core" diff="basics" -->
## Metody řetězců: Dělení (`split`) a spojování (`join`)

Zpracování CSV, TSV a konfiguračních řádek:

### 1. Metoda `.split(separator=None, maxsplit=-1)`:
```python
# Bez argumentu: dělí podle libovolně dlouhých shluků mezer a tabulátorů!
zaznam = "Jan    Novak   25   Praha"
print(zaznam.split())  # ['Jan', 'Novak', '25', 'Praha']

# S konkrétním oddělovačem:
csv_radek = "Aspirin;C9H8O4;180.16"
print(csv_radek.split(";"))  # ['Aspirin', 'C9H8O4', '180.16']

# Omezení počtu rozdělení:
hlavicka = "KEY = VALUE = EXTRA"
klic, hodnota = hlavicka.split(" = ", maxsplit=1)
```

### 2. Metoda `separator.join(iterable)`:
Všimněte si, že metoda `join` je volána **na oddělovači**, nikoliv na seznamu:
```python
hodnoty = ["10.5", "20.3", "15.8"]
vysledny_radek = "\t".join(hodnoty)
print(vysledny_radek)  # '10.5\t20.3\t15.8'
```

> [!NOTE]
> Proč je syntaxe `", ".join(seznam)` a ne `seznam.join(", ")`?
> Protože `join` funguje nad **jakýmkoliv iterovatelným objektem** (n-tice, množina, souborový generátor), aniž by tyto objekty musely dědit ze společné třídy seznamu!

---
<!-- slide: id=id8 title="Text vs. Bajty: str vs. bytes" tags="Core" diff="paradigm" -->
## Text vs. Bajty: Duální model `str` a `bytes`

Jedna z největších změn mezi Pythonem 2 a moderním Pythonem 3:
**Text a binární data jsou striktně oddělené typy!**

```text
[ str ]               Unicode text (abstraktní znaky: 'A', 'ř', '🐍')
  │
  ├─── .encode("utf-8") ───►  [ bytes ]  Surová binární data (bity v paměti / síti / disku)
  │                                │
  └─── .decode("utf-8") ◄──────────┘
```

```python
text = "Čeština 🐍"
print(type(text))        # <class 'str'>
print(len(text))         # 9 znaků

surove_bajty = text.encode("utf-8")
print(type(surove_bajty))  # <class 'bytes'>
print(len(surove_bajty))   # 14 bajtů! (české znaky zabírají 2 B, emodži 4 B)
print(surove_bajty)      # b'\xc4\x8ce\xc5\xa1tina \xf0\x9f\x90\x8d'
```

### Pravidlo pro vývojáře:
- **Uvnitř vašeho programu**: Vždy pracujte výhradně s typem `str`.
- **Na hranicích systému** (čtení ze sítě, zápis na disk, komunikace s C knihovnami): Převádějte data přes `.encode()` a `.decode()`.

---
<!-- slide: id=id9 title="Kódování UTF-8 a řešení chyb" tags="Core" diff="basics" -->
## Kódování UTF-8 a strategie ošetření chyb

UTF-8 je dominantní světový standard pro ukládání textu:
- Znaky základní ASCII (0–127) zabírají přesně **1 bajt** (100% zpětná kompatibilita).
- Evropská diakritika, řečtina, hebrejština zabírají **2 bajty**.
- Asijská písma zabírají **3 bajty**.
- Emodži a historické symboly zabírají **4 bajty**.

### Co když narazíte na poškozená data?
Při dekódování můžete specifikovat parametr `errors`:

```python
poskozena_data = b"Teplota: 25 \xb0C"  # Znak stupně v kódování ISO-8859-1, nikoliv UTF-8!

# 1. Výchozí striktní režim (vyvolá výjimku):
# poskozena_data.decode("utf-8")  # UnicodeDecodeError!

# 2. Náhrada nečitelných znaků symbolem  (U+FFFD):
print(poskozena_data.decode("utf-8", errors="replace"))
# 'Teplota: 25 C'

# 3. Ignorování poškozených bajtů:
print(poskozena_data.decode("utf-8", errors="ignore"))
# 'Teplota: 25 C'
```

---
<!-- slide: id=id10 title="Past s kódováním v souborovém I/O" tags="Core" diff="tricky" -->
## Past s kódováním v operačním systému

Při čtení nebo zápisu textových souborů pomocí `open()` se mnoho programátorů dopouští zásadní chyby:

```python
# KATASTROFÁLNÍ ZÁPIS:
with open("vysledky.txt", "w") as f:
    f.write("Naměřená hodnota: 15.4 °C")
```

### Proč je tento kód nebezpečný?
Pokud nespecifikujete parametr `encoding`, CPython použije **výchozí kódování operačního systému**:
- Na Linuxu a macOS: téměř vždy UTF-8.
- Na Windows: často historické kódování **CP1250** (středoevropské Windows) nebo **CP1252**!
- Důsledek: Skript, který vám funguje na Linuxu, na Windows zhaví s `UnicodeEncodeError`, jakmile zkusíte zapsat emoji nebo cizí znak!

### Zlaté pravidlo moderního Pythonu:
```python
# VŽDY a bez výjimky uvádějte explicitní UTF-8:
with open("vysledky.txt", "w", encoding="utf-8") as f:
    f.write("Naměřená hodnota: 15.4 °C ⚗️")
```

---
<!-- slide: id=id11 title="Evoluce formátování: Od % k f-stringům" tags="Core" diff="basics" -->
## Evoluce formátování: Od operátoru `%` k moderním f-stringům

Python prošel třemi generacemi formátování řetězců:

### 1. Generace: Operátor `%` (ve stylu C `printf`)
```python
jmeno = "Alice"; vek = 22
print("Student: %s, věk: %d" % (jmeno, vek))  # Zastaralé od roku 2008
```

### 2. Generace: Metoda `.format()` (Python 2.6 / 3.0)
```python
print("Student: {}, věk: {}".format(jmeno, vek))
print("Student: {n}, věk: {v}".format(n=jmeno, v=vek))
```

### 3. Generace: Formátované řetězcové literály — **f-stringy** (Python 3.6+, PEP 498)
```python
print(f"Student: {jmeno}, věk: {vek}")
```

### Proč jsou f-stringy absolutním standardem:
- **Přímá čitelnost**: Výrazy vkládáte přímo do textu ve složených závorkách `{}`.
- **Rychlost**: F-stringy se neparsují za běhu jako formátovací řetězce, ale překládají se přímo do optimalizovaného bajtkódu (jsou rychlejší než `.format()` i `%`).
- **Podpora libovolných výrazů**: `{vek + 1}`, `{jmeno.upper()}`, `{len(seznam)}`.

---
<!-- slide: id=id12 title="F-stringy: Specifikátory formátu" tags="Core" diff="basics" -->
## F-stringy: Čísla, zarovnání a formátovací značky

Za proměnnou uvnitř složených závorek můžete přidat dvojtečku `:` a formátovací specifikátor:

```python
pi = 3.1415926535
castka = 1250000.5
pomer = 0.8526

# 1. Počet desetinných míst a zaokrouhlování:
print(f"Pí: {pi:.2f}")            # 'Pí: 3.14'

# 2. Oddělovač tisíců (čárka nebo podtržítko):
print(f"Částka: {castka:,.2f} Kč") # 'Částka: 1,250,000.50 Kč'
print(f"Částka: {castka:_.2f} Kč") # 'Částka: 1_250_000.50 Kč'

# 3. Procentuální formát:
print(f"Úspěšnost: {pomer:.1%}")   # 'Úspěšnost: 85.3%'

# 4. Zarovnání textu a výplň:
jmeno = "Test"
print(f"'{jmeno:<10}'")           # ''Test      '' (zarovnání vlevo)
print(f"'{jmeno:>10}'")           # ''      Test'' (zarovnání vpravo)
print(f"'{jmeno:^10}'")           # ''   Test   '' (vycentrování)
print(f"Kód: {42:0>6}")           # 'Kód: 000042' (doplnění nulami)
```

### Rychlý debugging s operátorem `=` (Python 3.8+):
```python
x = 42; y = 100
print(f"{x=}, {y=}, {x + y=}")  # Vypíše: 'x=42, y=100, x + y=142'
```

---
<!-- slide: id=id13 title="Novinky f-stringů v Pythonu 3.12 (PEP 701)" tags="Core" diff="newconcept" -->
## Novinky f-stringů v Pythonu 3.12+ (PEP 701)

Před verzí Python 3.12 měly f-stringy několik nepříjemných syntaktických omezení. Standard **PEP 701** přepsal gramatiku f-stringů přímo do formálního PEG parseru.

### Co je nově povoleno od Pythonu 3.12:

```python
studenti = {"Alice": [1, 2, 1], "Bob": [3, 2, 2]}

# 1. Opakované použití stejných uvozovek uvnitř výrazu:
# (Dříve bylo nutné střídat jednoduché ' a dvojité " uvozovky!)
info = f"Student: {studenti["Alice"]}"

# 2. Zpětná lomítka a escape sekvence uvnitř složených závorek:
radky = ["první", "druhý", "třetí"]
print(f"Výpis:\n{'\n'.join(radky)}")

# 3. Komentáře uvnitř víceřádkových f-stringů:
vypocet = f"Výsledek: {
    sum(studenti['Alice'])  # sečteme známky
    / len(studenti['Alice']) # spočítáme průměr
:.2f}"
```

---
<!-- slide: id=id14 title="Čtení textových proudů po řádcích" tags="Core" diff="basics" -->
## Čtení textových souborů: Streamování v $O(1)$ paměti

Když pracujete se soubory o velikosti gigabajtů (sekvenační data, experimentální měření, serverové logy), musíte šetřit paměť RAM:

```python
# ŠPATNĚ: f.readlines() nebo f.read() načte celý soubor naráz do paměti!
with open("obri_experiment.csv", "r", encoding="utf-8") as f:
    radky = f.readlines()  # Při 10GB souboru program zkolabuje na Out-of-Memory!

# SPRÁVNĚ A IDIOMATICKY: Objekt souboru je líným iterátorem řádků!
with open("obri_experiment.csv", "r", encoding="utf-8") as f:
    for radek in f:
        radek = radek.strip()
        if not radek or radek.startswith("#"):
            continue  # Přeskoč prázdné řádky a komentáře
        zpracuj_radek(radek)
```

> [!TIP]
> Díky tomu, že `open()` vrací iterátor, spotřebovává procházení souboru v CPythonu konstantní množství paměti $O(1)$ (velikost interní vyrovnávací paměti, typicky 8 KB).

---
<!-- slide: id=id15 title="Proč regulární výrazy (Regex)?" tags="Core" diff="basics" -->
## Proč regulární výrazy (*Regular Expressions*)?

Základní metody `str` (`split`, `find`, `startswith`) stačí pro jednoduché úlohy s fixními oddělovači.
V reálném světě jsou však data nestrukturovaná nebo variabilní:
- Jak ověřit, zda je text validní e-mailovou adresou?
- Jak z logu vytáhnout všechny IP adresy a chybové kódy?
- Jak najít vzor chemického vzorce nebo DNA motivu s proměnným počtem opakování?

K tomu slouží **regulární výrazy (RegEx)** — specializovaný deklarativní minisystém zabudovaný do standardní knihovny v modulu **`re`**.

```python
import re

text = "Uživatel jan.novak@vscht.cz poslal 3 zprávy z IP 192.168.1.105 v 14:30."

# Nalezení e-mailu:
email = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
if email:
    print("Nalezen e-mail:", email.group())  # 'jan.novak@vscht.cz'
```

---
<!-- slide: id=id16 title="Raw stringy r'...' a zpětná lomítka" tags="Core" diff="newconcept" -->
## Surové řetězce: Proč u regulárních výrazů VŽDY psát `r"..."`?

V běžném textovém řetězci má zpětné lomítko `\` speciální význam (*escape sekvence*):
`\n` je nový řádek, `\t` je tabulátor.

V regulárních výrazech má zpětné lomítko také speciální význam:
`\d` je číslice, `\b` je hranice slova.

Pokud byste použili běžný řetězec, nastane tzv. **Backslash Plague**:
Abyste regexu předali sekvenci `\b`, musíte v běžném řetězci napsat `"\\b"`. Chcete-li hledat doslovný znak `\`, musíte napsat `"\\\\"`!

### Řešení: Raw string literály `r"..."`
Předřazené písmeno `r` říká CPythonu: *Ignoruj jakékoliv escape sekvence a interpretuj zpětná lomítka doslovně!*

```python
# ŠPATNĚ (nebezpečné, \b může být interpretováno jako backspace):
vzor = "\\d+\\.\\d+"

# SPRÁVNĚ a čistě:
vzor = r"\d+\.\d+"
```

> [!IMPORTANT]
> Pro všechny regulární výrazy v Pythonu bez výjimky používejte zápis **`r"..."`**!

---
<!-- slide: id=id17 title="Stavební kameny regulárních výrazů" tags="Core" diff="basics" -->
## Základní stavební kameny syntaxe regulárních výrazů

| Symbol | Význam | Příklad | Shoduje se s |
| :--- | :--- | :--- | :--- |
| **`.`** | Libovolný znak (kromě nového řádku `\n`) | `k.t` | `kat`, `kot`, `k9t` |
| **`\d`** | Libovolná číslice (0–9) | `\d\d` | `42`, `07` |
| **`\D`** | Libovolný znak kromě číslice | `\D+` | `ahoj` |
| **`\w`** | Znak slova (písmena, číslice, podtržítko) | `\w+` | `promenna_1` |
| **`\s`** | Bílý znak (mezera, tabulátor, nový řádek) | `\s+` | `   `, `\t\n` |
| **`[abc]`** | Znaková třída: právě jeden ze zadaných znaků | `[A-Z]` | Libovolné velké písmeno |
| **`[^abc]`** | Negovaná třída: jakýkoliv znak KROMĚ zadaných | `[^0-9]` | Jakýkoliv nečíselný znak |
| **`^` / `$`** | Kotvy: Začátek řádku (`^`) a Konec řádku (`$`) | `^\d+$` | Řetězec tvořený pouze čísly |
| **`\b`** | Hranice slova | `\bpes\b` | `'pes'`, ale ne `'pesek'` |

---
<!-- slide: id=id18 title="Kvantifikátory: Chamtivost vs. Línost" tags="Core" diff="tricky" -->
## Kvantifikátory: Chamtivé (*Greedy*) vs. Líné (*Non-greedy*)

Kvantifikátory určují, kolikrát se smí předchozí prvek opakovat:
- `*` : 0 nebo vícekrát.
- `+` : 1 nebo vícekrát.
- `?` : 0 nebo 1krát (volitelný prvek).
- `{n,m}` : minimálně $n$-krát, maximálně $m$-krát.

### Záludnost chamtivého vyhodnocování:
Regulární výrazy jsou ve výchozím nastavení **chamtivé (greedy)** — snaží se spolknout co nejdelší možný podřetězec:

```python
import re

html = "<div>První blok</div><div>Druhý blok</div>"

# 1. Chamtivý kvantifikátor .* (spolkne vše až po POSLEDNÍ </div>):
chamtivy = re.findall(r"<div>.*</div>", html)
print(chamtivy)
# ['<div>První blok</div><div>Druhý blok</div>']

# 2. Líný kvantifikátor .*? (zastaví se u NEJBLIŽŠÍHO </div>):
liny = re.findall(r"<div>.*?</div>", html)
print(liny)
# ['<div>První blok</div>', '<div>Druhý blok</div>']
```

> [!WARNING]
> Přidáním otazníku `?` za kvantifikátor (`*?`, `+?`) přepnete vyhodnocování do líného (*reluctant*) režimu.

---
<!-- slide: id=id19 title="Funkce re: search vs. match vs. fullmatch" tags="Core" diff="basics" -->
## Klíčové funkce modulu `re`: `search`, `match` a `fullmatch`

Častý zdroj chyb: Jaký je rozdíl mezi těmito třemi funkcemi?

```python
text = "Chyba na řádku 42: neplatný vstup"
```

### 1. `re.search(pattern, text)`:
Prohledává **celý text** a vrátí první místo, kde vzor vyhovuje:
```python
m = re.search(r"\d+", text)
print(m.group())  # '42' (úspěšně nalezeno uprostřed textu)
```

### 2. `re.match(pattern, text)`:
Ověřuje shodu **POUZE na samém začátku textu**:
```python
m = re.match(r"\d+", text)
print(m)  # None! (Protože na začátku textu je slovo 'Chyba', nikoliv číslice)
```

### 3. `re.fullmatch(pattern, text)`:
Vyžaduje, aby vzor pokryl **celý text od prvního do posledního znaku**:
```python
# Ideální pro formulářové validace (např. rodné číslo, PSČ):
psc = "16000"
if re.fullmatch(r"\d{5}", psc):
    print("Platné PSČ!")
```

---
<!-- slide: id=id20 title="Práce s objektem shody (Match Object)" tags="Core" diff="basics" -->
## Práce s objektem shody (`Match Object`)

Pokud vyhledávací funkce uspěje, nevrací pouhý text, ale bohatý objekt typu `re.Match`:

```python
import re

zprava = "Naměřeno pH: 7.35 v laboratoři L12"
m = re.search(r"pH:\s*(\d+\.\d+)", zprava)

if m is not None:
    # 1. Celý nalezený úsek:
    print("Celá shoda:", m.group(0))      # 'pH: 7.35'

    # 2. Počáteční a koncový index v původním řetězci:
    print("Počátek:", m.start())           # 9
    print("Konec:", m.end())               # 17
    print("Rozpětí (span):", m.span())     # (9, 17)

    # 3. Extrahovaná závorková skupina:
    print("Samotná hodnota pH:", m.group(1))  # '7.35'
```

### Moderní walrus operátor `:=` pro zkrácení zápisu:
```python
if m := re.search(r"pH:\s*(\d+\.\d+)", zprava):
    print("Hodnota pH je:", m.group(1))
```

---
<!-- slide: id=id21 title="Závorkové skupiny (Capturing Groups)" tags="Core" diff="newconcept" -->
## Závorkové skupiny (*Capturing Groups*) a rozbalování

Kulaté závorky `(...)` v regulárním výrazu slouží k **extrakci konkrétních částí vzoru**:

```python
datum = "Datum experimentu: 2026-10-27"
vzor = r"(\d{4})-(\d{2})-(\d{2})"

m = re.search(vzor, datum)
if m:
    rok = m.group(1)     # '2026'
    mesic = m.group(2)   # '10'
    den = m.group(3)     # '27'

    # Metoda .groups() vrátí n-tici všech skupin:
    rok, mesic, den = m.groups()
    print(f"Den: {den}, Měsíc: {mesic}, Rok: {rok}")
```

### Nezachytávající skupiny `(?:...)`:
Někdy potřebujete závorky pouze pro logické seskupení (např. s operátorem `|`), ale nechcete jejich obsah extrahovat do výsledků:
```python
# Skupina (?:https?|ftp) seskupí protokoly, ale nealokuje capture index:
url_vzor = r"(?:https?|ftp)://([a-zA-Z0-9\.-]+)"
m = re.search(url_vzor, "Odkaz: https://vscht.cz/studium")
print(m.group(1))  # 'vscht.cz' (přímo doména, protokol byl nezachytávající)
```

---
<!-- slide: id=id22 title="Pojmenované skupiny (?P<name>...)" tags="Core" diff="newconcept" -->
## Pojmenované skupiny: Konec nepřehledných číselných indexů

Spoléhat se na číselné indexy `m.group(1)`, `m.group(2)` je u složitějších regexů křehké: pokud doprostřed vzoru přidáte novou závorku, posunou se čísla všech následujících skupin!

Python nabízí elegantní řešení: **Pojmenované skupiny** se syntaxí `(?P<nazev>vzorec)`:

```python
radek_logu = "2026-10-27 14:32:05 [ERROR] Databáze neodpovídá na portu 5432"

vzor = r"(?P<datum>\d{4}-\d{2}-\d{2})\s+(?P<cas>\d{2}:\d{2}:\d{2})\s+\[(?P<uroven>[A-Z]+)\]\s+(?P<zprava>.*)"

m = re.search(vzor, radek_logu)
if m:
    print(m.group("uroven"))  # 'ERROR'
    print(m.group("zprava"))  # 'Databáze neodpovídá na portu 5432'

    # Metoda .groupdict() vytvoří čistý slovník Pythonu!
    data = m.groupdict()
    print(data)
    # {
    #   'datum': '2026-10-27',
    #   'cas': '14:32:05',
    #   'uroven': 'ERROR',
    #   'zprava': 'Databáze neodpovídá na portu 5432'
    # }
```

---
<!-- slide: id=id23 title="Hromadné vyhledávání: findall vs. finditer" tags="Core" diff="basics" -->
## Hromadné vyhledávání: `re.findall()` vs. `re.finditer()`

Když text obsahuje více výskytů hledaného vzoru:

```python
text = "Navážky vzorků: A=12.5g, B=3.4g, C=105.8g"
```

### 1. `re.findall(pattern, text)`:
Vrátí přímo **seznam textových řetězců** (nebo n-tic, pokud vzor obsahuje skupiny):
```python
vsechna_cisla = re.findall(r"\d+\.\d+", text)
print(vsechna_cisla)  # ['12.5', '3.4', '105.8']
```

### 2. `re.finditer(pattern, text)` — Paměťově optimální přístup:
Nevytváří seznam v paměti, ale vrací **líný generátor objektů `Match`**:
```python
for m in re.finditer(r"(?P<vzorek>[A-Z])=(?P<vaha>\d+\.\d+)g", text):
    print(f"Vzorek {m.group('vzorek')} má hmotnost {m.group('vaha')} gramů (pozice {m.span()})")
```

> [!TIP]
> Pro zpracování rozsáhlých databází či souborů vždy preferujte `re.finditer()`, protože nealokuje zbytečné seznamy a zachovává přístup k pozicím v textu.

---
<!-- slide: id=id24 title="Nahrazování textu: re.sub" tags="Core" diff="basics" -->
## Nahrazování textu: Funkce `re.sub()` a zpětné reference

Pro nahrazení vzoru jiným textem slouží funkce `re.sub()`:

### 1. Jednoduché nahrazení:
```python
import re

text = "Uživatel má telefon 123-456-789 nebo 987-654-321."
anonymizovano = re.sub(r"\d{3}-\d{3}-\d{3}", "[SKRYTO]", text)
print(anonymizovano)  # 'Uživatel má telefon [SKRYTO] nebo [SKRYTO].'
```

### 2. Zpětné reference v náhradě:
Můžete v náhradním textu použít extrahované skupiny pomocí `\g<nazev>` nebo `\1`:
```python
# Přeformátování data z YYYY-MM-DD na DD.MM.YYYY:
datumy = "Start: 2026-10-27, Konec: 2026-11-05"
cesky_format = re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\3.\2.\1", datumy)
print(cesky_format)  # 'Start: 27.10.2026, Konec: 05.11.2026'
```

### 3. Nahrazování pomocí funkce (*Callback function*):
```python
def prevod_na_kelviny(m: re.Match) -> str:
    celsius = float(m.group(1))
    return f"{celsius + 273.15:.2f} K"

zaznam = "Teploty: 25.0 C a 100.0 C"
print(re.sub(r"(\d+\.\d+)\s*C", prevod_na_kelviny, zaznam))
# 'Teploty: 298.15 K a 373.15 K'
```

---
<!-- slide: id=id25 title="Produkční most: Předkompilace re.compile" tags="Core" diff="newconcept" -->
## Produkční most: Předkompilace regulárních výrazů (`re.compile`)

Když zavoláte `re.search(r"...", text)`, CPython musí textový vzor tokenizovat a přeložit do bajtkódu vnitřního regulárního automatu. CPython si sice ukládá posledních cca 512 použitých vzorů do cache, ale v produkčním kódu s miliony iterací je toto neefektivní.

### Profesionální idiom:
Zkompilujte regulární výraz **jednou na úrovni modulu** do objektu `re.Pattern`:

```python
import re

# Kompilace na úrovni modulu (proběhne pouze jednou při importu):
VZOR_LOGU = re.compile(
    r"^(?P<ip>\d{1,3}(?:\.\d{1,3}){3})\s+-\s+\[(?P<cas>[^\]]+)\]\s+\"(?P<metoda>[A-Z]+)\s+(?P<url>[^\s]+)"
)

def zpracuj_webovy_log(cesta_k_souboru: str) -> list[dict[str, str]]:
    vysledky = []
    with open(cesta_k_souboru, "r", encoding="utf-8") as f:
        for radek in f:
            if m := VZOR_LOGU.match(radek):
                vysledky.append(m.groupdict())
    return vysledky
```

---
<!-- slide: id=id26 title="Produkční most: Čitelné regexy s re.VERBOSE" tags="Core" diff="newconcept" -->
## Produkční most: Čitelný a dokumentovaný regex (`re.VERBOSE`)

V softwarovém inženýrství platí vtip: *"Někdo měl problém, tak použil regulární výraz. Nyní má problémy dva."*
Důvodem je, že dlouhé regulární výrazy na jednom řádku jsou pro člověka nečitelné.

Python nabízí přepínač **`re.VERBOSE` (nebo `re.X`)**:
Ignoruje netriviální mezery a umožňuje **vkládat komentáře přímo do regulárního výrazu**:

```python
import re

REGEX_EMAIL = re.compile(r"""
    ^                        # Začátek řetězce
    (?P<user>[\w\.-]+)       # Uživatelské jméno (písmena, tečky, pomlčky)
    @                        # Znak zavináče
    (?P<domain>[a-zA-Z0-9-]+ # Doména 2. řádu
        (?:\.[a-zA-Z0-9-]+)* # Volitelné subdomény
    )
    \.                       # Tečka před TLD
    (?P<tld>[a-zA-Z]{2,})    # Národní doména nejvyššího řádu (cz, com, org)
    $                        # Konec řetězce
""", re.VERBOSE | re.IGNORECASE)

m = REGEX_EMAIL.match("kolar@vscht.cz")
print(m.groupdict())
# {'user': 'kolar', 'domain': 'vscht', 'tld': 'cz'}
```

---
<!-- slide: id=id27 title="Shrnutí a přechod do cvičení" tags="Core" diff="basics" -->
## Shrnutí přednášky a příprava na cvičení

Dnes jsme zvládli práci s textem, kódováním i pokročilým parsováním:

### Hlavní body pro zapamatování:
1. **Unicode**: `str` v Pythonu používá PEP 393; indexování je $O(1)$ a paměť se přizpůsobuje nejširšímu znaku.
2. **Immutabilita**: Řetězce nelze modifikovat na místě; pro skládání textu používejte `''.join(seznam)`, nikdy `+=` v cyklu.
3. **Kódování**: Striktně oddělujte text `str` a bajty `bytes`; soubory otevírejte **vždy s `encoding="utf-8"`**.
4. **F-stringy**: Nejrychlejší a nejčistší formátování textu; od Pythonu 3.12 podporuje uvozovky a zpětná lomítka uvnitř výrazů (PEP 701).
5. **Regex**: Používejte raw stringy `r"..."`; pro parsování definujte pojmenované skupiny `(?P<name>...)`.
6. **Produkční standard**: Regexy předkompilujte přes `re.compile()` a dokumentujte pomocí `re.VERBOSE`.

### Co vás čeká v následujícím 1,5hodinovém cvičení:
- Extrakce a čištění dat z experimentálních CSV souborů bez externích knihoven.
- Napsání regex parseru pro validaci rodných čísel a e-mailů.
- Parsování a agregace HTTP stavových kódů z reálného Apache/Nginx webového logu.
