<!-- slide: id1, Vstup dat z příkazové řádky, Core, basics -->
## Uživatelský vstup a příkazová řádka

Uživatelský vstup do konzolového programu v Pythonu dělíme do dvou hlavních kategorií:

1. **Interaktivní vstup za běhu programu**:
   - Čtení z klávesnice přes standardní vstup (`sys.stdin`) pomocí funkce `input()`.
2. **Parametry příkazové řádky při spuštění**:
   - Předání přepínačů (*flags*), argumentů a cest k souborům při vyvolání skriptu (`python script.py --option hodnota soubor.txt`).

V této přednášce si ukážeme práci se standardním vstupem `input()`, nízkoúrovňovým polem `sys.argv` a historickou evoluci nástrojů pro parsování parametrů.

---
<!-- slide: id2, Interaktivní vstup „input()“, Core, basics -->
## Interaktivní vstup: funkce `input()`

Funkce `input(prompt="")` pozastaví vykonávání programu, vypíše volitelnou výzvu a čeká, dokud uživatel nestiskne klávesu `Enter`:

```python
jmeno = input("Zadejte své jméno: ")
print(f"Vítejte, {jmeno}!")
```

> [!IMPORTANT] `input()` vždy vrací textový řetězec `str`
> Pokud očekáváte číslo, musíte provést explicitní konverzi a ošetřit případnou výjimku `ValueError`:
> ```python
> try:
>     vek = int(input("Zadejte věk: "))
> except ValueError:
>     print("Chyba: Zadaná hodnota není celé číslo!")
> ```

> [!NOTE] Python 3.13 vylepšení
> Od **Pythonu 3.13** je interaktivní konzole CPythonu postavena na nové knihovně **PyREPL**, která přináší víceřádkovou editaci a barevné zvýrazňování syntaxe přímo v terminálu napříč všemi platformami (včetně Windows).

---
<!-- slide: id3, Evoluce zpracování parametrů v Pythonu, Core, basics -->
## Evoluce zpracování parametrů příkazové řádky

Pro zpracování argumentů při spuštění skriptu prošel Python několika generacemi nástrojů:

0. **`sys.argv`**: Surový seznam řetězců předaných operačním systémem. Veškeré parsování a validaci musíte napsat ručně.
1. **`getopt`**: Přímý port céčkovské funkce `getopt()`. Podporuje krátké (`-h`) i dlouhé (`--help`) přepínače, ale nenabízí automatickou nápovědu ani typovou konverzi.
2. **`optparse`**: Objektově orientovaný parser zavedený v Pythonu 2.3. Od verze Python 3.2 je **oficiálně zastaralý** (*deprecated*).
3. **`argparse`**: Současný **standard v jádře Pythonu** (od 3.2). Podporuje poziční argumenty, přepínače, subpříkazy (`git commit`, `git push`), automatickou nápovědu `--help` a typovou kontrolu.
4. **Moderní ekosystém třetích stran (`click`, `typer`)**: V moderním Pythonu je mimořádně populární knihovna **Typer**, která generuje celé CLI automaticky z moderních typových anotací funkcí.

---
<!-- slide: id4, Nízkoúrovňové argumenty: sys.argv, Core, basics -->
## Nízkoúrovňové argumenty: `sys.argv`

Modul `sys` zpřístupňuje argumenty předané operačním systémem jako obyčejný seznam řetězců `sys.argv`:

```python
# Soubor: skript.py
import sys

print(f"Celý sys.argv:  {sys.argv}")
print(f"Název skriptu:  {sys.argv[0]}")
print(f"Vlastní parametry: {sys.argv[1:]}")
```

### Spuštění z terminálu:
```bash
$ python3 skript.py alpha beta 42
Celý sys.argv:     ['skript.py', 'alpha', 'beta', '42']
Název skriptu:     skript.py
Vlastní parametry: ['alpha', 'beta', '42']
```

- `sys.argv[0]` je vždy název spouštěného skriptu (nebo prázdný řetězec při spuštění přes `python -c`).
- Všechny položky jsou typu `str` – číslo `42` je předáno jako text `'42'`.

---
<!-- slide: id5, Mezery a uvozovky v argumentech, Core, basics -->
## Mezery a uvozovky v argumentech

Operační systém rozděluje argumenty podle mezer. Pokud má jeden argument obsahovat mezery, musí být uzavřen v uvozovkách:

```bash
$ python3 skript.py "Jan Novák" --mesto "Hradec Králové"
```

V `sys.argv` se objeví:
```python
['skript.py', 'Jan Novák', '--mesto', 'Hradec Králové']
```

> [!WARNING] Rozdíly mezi Shellem v Linuxu a Windows PowerShell
> - V Unixu/Linuxu expanduje zástupné znaky (*wildcards* jako `*.py`) samotný shell (Bash/Zsh) ještě před předáním skriptu.
> - Ve Windows příkazové řádce `cmd.exe` se znaky neexpandují a do `sys.argv` dorazí doslovný řetězec `'*.py'`. Pro přenositelnost používejte modul `glob` nebo `pathlib.Path.glob()`.

---
<!-- slide: id6, Validace parametrů pomocí sys.argv, Core, basics -->
## Ruční validace parametrů pomocí `sys.argv`

Při použití pouhého `sys.argv` musíte délku a typy argumentů kontrolovat ručně:

```python
import sys

def main() -> None:
    # Očekáváme přesně 1 argument za názvem skriptu:
    if len(sys.argv) != 2:
        print(f"Použití: {sys.argv[0]} <cesta_k_souboru>", file=sys.stderr)
        sys.exit(1)  # Ukončení s nenulovým návratovým kódem chyby
    
    cesta = sys.argv[1]
    print(f"Zpracovávám soubor: {cesta}")

if __name__ == "__main__":
    main()
```

Pro cokoliv složitějšího než 1–2 argumenty se však ruční práce se `sys.argv` stává nepřehlednou a náchylnou k chybám.

---
<!-- slide: id7, Modul getopt (C-style parser), Core, resyntax -->
## Modul `getopt` (C-style parser)

Modul `getopt` emuluje chování stejnojmenné funkce z jazyka C:

```python
import getopt
import sys

try:
    opts, args = getopt.getopt(
        sys.argv[1:],
        "ho:v",                       # Krátké přepínače (: znamená povinnou hodnotu)
        ["help", "output=", "verbose"] # Dlouhé přepínače (= znamená povinnou hodnotu)
    )
except getopt.GetoptError as err:
    print(f"Chyba argumentů: {err}", file=sys.stderr)
    sys.exit(2)

for opt, arg in opts:
    if opt in ("-h", "--help"):
        print("Nápověda k programu...")
        sys.exit(0)
    elif opt in ("-o", "--output"):
        vystup = arg
```

`getopt` negeneruje automatickou nápovědu ani nepřevádí datové typy – dnes slouží výhradně pro zpětnou kompatibilitu se starými céčkovskými nástroji.

---
<!-- slide: id8, Historický modul optparse, Skip, basics -->
## Historický modul `optparse` (Deprecated)

V Pythonu 2.3 přibyl modul `optparse`, který poprvé přinesl deklarativní definici parametrů a automaticky generovanou nápovědu `--help`:

```bash
$ python optparse_ukazka.py --help
Usage: optparse_ukazka.py [options] filename

Options:
  --version             show program's version number and exit
  -h, --help            show this help message and exit
  -x, --xhtml           create a XHTML template instead of HTML
  -c CSSFILE, --cssfile=CSSFILE
                        CSS file to link
```

> [!NOTE] Dnes již nepoužívat
> Modul `optparse` nepodporoval poziční argumenty ani vnořené subpříkazy a od verze Python 3.2 byl **plně nahrazen modulem `argparse`**. V novém kódu jej nikdy nepoužívejte.

---
<!-- slide: id9, Ukázka zápisu v optparse vs. argparse, Skip, resyntax -->
## Porovnání zápisu: `optparse` vs. moderní `argparse`

Jak se kód transformoval z historického `optparse` do moderního `argparse`:

```python
# HISTORICKÝ KÓD (optparse):
# from optparse import OptionParser
# parser = OptionParser(usage="usage: %prog [options] filename")
# parser.add_option("-c", "--cssfile", default="style.css")
# options, args = parser.parse_args()

# MODERNÍ KÓD (argparse):
import argparse

parser = argparse.ArgumentParser(description="Generátor HTML šablon")
parser.add_argument("filename", help="Vstupní soubor")
parser.add_argument("-c", "--cssfile", default="style.css", help="CSS stylopis")
parser.add_argument("-x", "--xhtml", action="store_true", help="Generovat XHTML")

args = parser.parse_args()
print(f"Zpracovávám: {args.filename}, stylopis: {args.cssfile}, xhtml: {args.xhtml}")
```

`argparse` automaticky kontroluje existenci povinného argumentu `filename` a vrací přehledný objekt `args`, kde k parametrům přistupujeme jako k atributům `args.cssfile`.

---
<!-- slide: id10, Pohled do moderní praxe: Typer a Click, Skip, basics -->
## Pohled do moderní praxe: Knihovny `Typer` a `Click`

V moderním Pythonu (3.10+) se pro tvorbu profesionálních CLI aplikací nejčastěji používá knihovna **Typer** (založená na Click a Pydantic):

```python
# pip install typer
import typer
from pathlib import Path

app = typer.Typer()

@app.command()
def build(
    cesta: Path,
    css: str = "style.css",
    xhtml: bool = False,
    pocet: int = 1,
) -> None:
    """Zkompiluje vstupní šablonu do cílového formátu."""
    typer.echo(f"Kompiluji {cesta} s profilem {css} ({pocet}x)...")

if __name__ == "__main__":
    app()
```

### Proč je Typer tak populární?
- Využívá standardní **typové anotace** Pythonu (`Path`, `int`, `bool`).
- Automaticky zajistí převod typů, validaci, nápovědu `--help` a doplňování v shellu (shell completion).
