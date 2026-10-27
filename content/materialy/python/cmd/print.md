<!-- slide: id1, Funkce print(), Core, basics -->
## Funkce `print()`

Funkce `print()` je základním nástrojem pro textový výstup na konzoli i do souborů. Její kompletní signatura v moderním Pythonu je:

```python
print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)
```

### Parametry funkce:
- **`*objects`**: Libovolný počet objektů. Každý objekt je před tiskem převeden na text pomocí funkce `str(obj)`.
- **`sep`** (výchozí `' '`): Oddělovač vkládaný mezi vytištěné objekty.
- **`end`** (výchozí `'\n'`): Znak(y) připojené za poslední objekt (výchozí je odřádkování).
- **`file`** (výchozí `sys.stdout`): Cílový proud pro výstup. Musí to být jakýkoliv objekt implementující metodu `.write(str)`.
- **`flush`** (výchozí `False`): Okamžité vyprázdnění vyrovnávací paměti (*bufferu*). Při `flush=True` se data ihned odešlou na výstup bez čekání na nový řádek.

---
<!-- slide: id2, Příklady použití print(), Skip, basics -->
## Příklady použití `print()`

```python
# 1. Samostatné odřádkování bez parametrů:
print()

# 2. Vlastní oddělovač a zakončení bez odřádkování:
s1, s2, s3 = 'ahoj', 'světe', 'jak se máš'

print(s1, s2, s3, sep="|")
# Výstup: ahoj|světe|jak se máš

print(s1, s2, s3, sep=" - ", end=" -> ")
print("hotovo!")
# Výstup: ahoj - světe - jak se máš -> hotovo!

# 3. Přesměrování na chybový výstup (stderr):
import sys
print("CHYBA: Soubor nenalezen!", file=sys.stderr)

# 4. Zápis do souboru pomocí print:
with open("vystup.log", "a", encoding="utf-8") as f:
    print("Záznam události", file=f)
```

---
<!-- slide: id3, Řídicí znaky (Escape characters), Skip, resyntax -->
## Řídicí znaky (*Escape characters*)

Pokud řetězec není označen prefixem surového řetězce `r"..."` (*raw string*), Python vyhodnocuje zpětná lomítka `\` jako speciální řídicí znaky:

| Zápis | Název / Význam | Příklad |
| :--- | :--- | :--- |
| `\n` | Odřádkování (*Newline*, LF, ASCII 10) | `"Řádek 1\nŘádek 2"` |
| `\t` | Horizontální tabulátor (ASCII 9) | `"Jméno:\tJan"` |
| `\r` | Návrat na začátek řádku (*Carriage Return*, ASCII 13) | V kombinaci s `\r\n` (Windows) nebo pro progress bary |
| `\\` | Zpětné lomítko | `"C:\\cesta\\k\\souboru"` |
| `\'`, `\"` | Uvozovky uvnitř řetězce ohraničeného stejnými uvozovkami | `'To je \'Python\''` |
| `\xHH` | Znak zadaný 2 hexadecimálními ciframi | `"\x41"` $\implies$ `'A'` |
| `\uXXXX` | 16bitový Unicode znak | `"\u03b1"` $\implies$ `'α'` |
| `\UXXXXXXXX`| 32bitový Unicode znak | `"\U0001F40D"` $\implies$ `'🐍'` |
| `\N{name}` | Unicode znak podle oficiálního názvu | `"\N{SNAKE}"` $\implies$ `'🐍'` |

---
<!-- slide: id4, Formátování výstupu (f-string vs format), Core, pythonic -->
## Formátování výstupu: Moderní f-řetězce vs. `format()`

V moderním Pythonu existují 3 generace formátování textu:

```python
jmeno, prumer = "Karel", 1 / 3

# 1. Doporučený moderní standard: f-stringy (Python 3.6+, PEP 498)
print(f"Student {jmeno} má průměr {prumer:.2f}.")

# 2. Metoda str.format() (Python 2.6 / 3.0+):
print("Student {0} má průměr {1:.2f}.".format(jmeno, prumer))

# 3. Zastaralé % formátování (printf-style):
print("Student %s má průměr %.2f." % (jmeno, prumer))
```

> [!TIP] Ladicí f-stringy `f"{expr=}"` (Python 3.8+)
> Pro rychlé a přehledné ladění proměnných použijte rovnítko za výrazem:
> ```python
> x = 42
> print(f"{x=}, {x*2=}")
> # Výstup: x=42, x*2=84
> ```

---
<!-- slide: id5, Format Specification Mini-Language, Core, pythonic -->
## Format Specification Mini-Language

Za dvojtečkou uvnitř složených závorek `{hodnota:specifikace}` lze detailně konfigurovat vzhled výstupu:

$$\text{[[fill]align][sign][\#][0][width][grouping][.precision][type]}$$

- **Zarovnání a výplň**:
  - `<` vlevo, `>` vpravo, `^` na střed. Před znak zarovnání lze zadat vyplňovací znak (např. `{:*^20}`).
- **Znaménko**:
  - `+` zobrazí vždy znaménko (`+` i `-`), ` ` (mezera) zobrazí mezeru pro kladná čísla.
- **Šířka a oddělovače**:
  - Minimální šířka pole (např. `{:10}`).
  - `_` nebo `,` pro oddělovač tisíců (např. `f"{1_000_000:_}"` $\implies$ `'1_000_000'`).
- **Přesnost a typ**:
  - `.2f` (2 desetinná místa u reálného čísla), `.4e` (vědecký zápis).
  - `%` (vynásobí 100 a přidá znak `%`).

```python
>>> f"{123.4567:+.2f}"
'+123.46'

>>> f"{'TITULEK':=^20}"
'======TITULEK======='
```

---
<!-- slide: id6, Zanořené formátovací výrazy, WOW, pythonic -->
## Zanořené formátovací výrazy

Uvnitř f-stringů a metody `.format()` lze hodnoty formátovací specifikace (šířku, přesnost) dynamicky řídit jinými proměnnými:

```python
slovo = "Ahoj"
sirka = 30
zarovnani = "^"
vypln = "-"

# Dynamická šablona ve f-stringu:
vystup = f"{slovo:{vypln}{zarovnani}{sirka}}"
print(vystup)
# Výstup: -------------Ahoj--------------

cislo = 3.14159265
desetinna_mista = 3
print(f"{cislo:.{desetinna_mista}f}")
# Výstup: 3.142
```

---
<!-- slide: id7, Zastaralé formátování pomocí operátoru %, Tricky, resyntax -->
## Zastaralé formátování operátorem `%`

Před příchodem `str.format()` a f-stringů se používal Céčkovský operátor `%` (*printf style*):

```python
# Zápis se slovníkem:
>>> "%(jazyk)s má %(verze)d verze." % {"jazyk": "Python", "verze": 3}
'Python má 3 verze.'

# Zápis s n-ticí:
>>> "%s má průměr %.2f" % ("Petr", 1.555)
'Petr má průměr 1.56'
```

> [!WARNING] Úskalí operátoru `%`
> Pokud proměnná za operátorem `%` je `tuple`, Python ji automaticky rozbalí jako jednotlivé argumenty. Pokud má předávaná proměnná sama o sobě hodnotu n-tice, způsobí to zákeřnou chybu `TypeError`:
> ```python
> data = (1, 2)
> "%s" % data       # TypeError: not all arguments converted during string formatting
> "%s" % (data,)    # Nutno obalit do jednoprvkové n-tice!
> ```
> Ve f-stringu `f"{data}"` tento problém vůbec neexistuje.

---
<!-- slide: id8, Řetězcové šablony s format(), Core, pythonic -->
## Vícenásobně použitelné šablony: `format()`

Zatímco f-stringy se vyhodnocují okamžitě v místě zápisu, metoda `.format()` je ideální pro **předem definované šablony**, do kterých se data vkládají opakovaně:

```python
sablona_radku = """
<tr>
    <th>{kod}</th>
    <td>{nazev}</td>
    <td style="text-align: right;">{cena:.2f} Kč</td>
</tr>
""".strip()

zbozi = [
    ("K01", "Klávesnice", 1290.0),
    ("M02", "Myš", 650.5),
    ("M03", "Monitor", 5499.9),
]

print("<table>")
for kod, nazev, cena in zbozi:
    print(sablona_radku.format(kod=kod, nazev=nazev, cena=cena))
print("</table>")
```

---
<!-- slide: id9, Bezpečné šablony: string.Template, Core, newconcept -->
## Bezpečné šablony: `string.Template`

Pro šablony, které pocházejí z **nedůvěryhodných externích zdrojů** (např. konfigurační soubory nebo texty zadané uživatelem), je standardní `.format()` nebezpečný (umožňuje číst atributy objektů).

Standardní knihovna nabízí bezpečnou třídu **`string.Template`**:

```python
from string import Template

# Používá syntaxi s dolarem ($jmeno nebo ${jmeno}):
sab = Template("Dobrý den, $jmeno. Váš kód je ${kod}_CZ.")

zprava = sab.substitute(jmeno="Jano", kod="789")
print(zprava)
# Výstup: Dobrý den, Jano. Váš kód je 789_CZ.

# safe_substitute() nevyhodí KeyError při chybějícím klíči:
neuplna = sab.safe_substitute(jmeno="Jano")
print(neuplna)
# Výstup: Dobrý den, Jano. Váš kód je ${kod}_CZ.
```

---
<!-- slide: id10, ANSI Escape sekvence pro barvy v terminálu, Skip, basics -->
## ANSI Escape sekvence v terminálu

Terminály podporující standard ANSI VT100 zpracovávají speciální řídicí sekvence uvozené kódem Escape (`\033[` nebo `\x1b[`):

```python
# \033[1m zapne tučné písmo, \033[0m resetuje styl na výchozí:
print("\033[1mTučný text\033[0m Normální text")

# \033[31m zapne červené popředí, \033[32m zelené:
print("\033[31mCHYBA:\033[0m Soubor nenalezen!")
print("\033[32mÚSPĚCH:\033[0m Hotovo!")
```

> [!NOTE] Podpora ve Windows
> Moderní **Windows Terminal** i integrovaný terminál ve VS Code podporují ANSI sekvence nativně bez nutnosti externích utilit.

---
<!-- slide: id11, Vybrané ANSI kódy a barvy, Skip, basics -->
## Vybrané ANSI kódy a barvy

| Kód | Význam | Kód | Barva popředí |
| :--- | :--- | :--- | :--- |
| `\033[0m` | Reset všech stylů a barev | `\033[30m` | Černá |
| `\033[1m` | Tučný text (*Bold*) | `\033[31m` | Červená |
| `\033[2m` | Zeslabený text (*Dim*) | `\033[32m` | Zelená |
| `\033[3m` | Kurzíva (*Italic*) | `\033[33m` | Žlutá |
| `\033[4m` | Podtržený text (*Underline*) | `\033[34m` | Modrá |
| `\033[7m` | Inverzní barvy (*Reverse*) | `\033[35m` | Purpurová (Magenta) |
| `\033[2J` | Smazání celé obrazovky | `\033[36m` | Azurová (Cyan) |
| `\033[H` | Přesun kurzoru do rohu [0, 0] | `\033[37m` | Bílá |

Barvy pozadí se nastavují kódy `40` až `47` (např. `\033[41m` pro červené pozadí).

---
<!-- slide: id12, Knihovny pro moderní CLI (Rich), Skip, pythonic -->
## Moderní CLI v Pythonu: Knihovna `rich`

Místo ručního skládání nízkoúrovňových ANSI kódů se v moderním Pythonu používá populární standardní knihovna **`rich`**:

```python
# Namísto:
# print("\033[1;31mChyba!\033[0m")

# Použijte rich:
from rich import print as rprint
from rich.table import Table

rprint("[bold red]Chyba:[/bold red] Operace selhala!")
rprint("[bold green]Úspěch![/bold green] Uloženo do [underline cyan]data.json[/underline cyan]")
```

`rich` automaticky detekuje možnosti terminálu, poskytuje barevný syntax highlighting pro kód i datové struktury a podporuje tabulky, progress bary i Markdown.

---
<!-- slide: id13, Zjištění velikosti terminálu: shutil, Skip, pythonic -->
## Zjištění velikosti terminálu: `shutil`

Pokud skript generuje oddělovače nebo tabulky přizpůsobené šířce okna, lze aktuální rozměry zjistit pomocí `shutil.get_terminal_size()`:

```python
import shutil

# Zjištění počtu sloupců a řádků:
velikost = shutil.get_terminal_size(fallback=(80, 24))
sloupce = velikost.columns
radky = velikost.lines

print(f"Terminál má rozměry: {sloupce}x{radky}")

# Dynamický oddělovač přes celou šířku terminálu:
print("=" * sloupce)
```

Funkce nejprve otestuje proměnné prostředí `COLUMNS` a `LINES`, následně se dotáže operačního systému přes deskriptor standardního výstupu, a v případě přesměrování (např. do souboru či roury) použije zadanou hodnotu `fallback`.
