<!-- slide: id1, Úvod, Core, basics -->
## Zpracování argumentů příkazové řádky: Modul `argparse`

Téměř každý produkční skript, systémový nástroj nebo vědecký model vyžaduje předávání parametrů z příkazové řádky (CLI): cesty ke vstupním souborům, volitelné přepínače, číselné konstanty nebo režimy výpisu.

Zatímco nízkourovňový seznam `sys.argv` obsahuje pouze surové textové řetězce a vyžaduje pracné ruční parsování, standardní modul **`argparse`** (součást standardní knihovny od Pythonu 3.2+) poskytuje deklarativní rozhraní pro tvorbu profesionálních CLI nástrojů:

- Automatická tvorba přehledné a formátované nápovědy (**`-h` / `--help`**).
- Automatická typová konverze a validace hodnot (`type=int`, `type=pathlib.Path`).
- Omezení na povolené množiny voleb (`choices=[...]`).
- Podpora pro přepínače (`--verbose`), poziční argumenty i podřízené příkazy (*subcommands* jako v `git` či `docker`).
- Elegantní chybová hlášení při chybějících nebo neplatných vstupech.

---
<!-- slide: id2, Příklad, Already Studied, basics -->
## Demonstrační ukázka: CLI v akci

Podívejme se, jak se chová hotový skript využívající `argparse` při různých způsobech spuštění z terminálu:

```bash
# 1. Spuštění bez povinných parametrů -> okamžitá nápověda a chybová hláška:
$ python generator.py
usage: generator.py [-h] [--version] [-x] [-c CSSFILE] file
generator.py: error: the following arguments are required: file

# 2. Předání povinného pozičního argumentu:
$ python generator.py index.html
Namespace(cssfile='style.css', file='index.html', xhtml=False)

# 3. Zobrazení automaticky vygenerované nápovědy (--help / -h):
$ python generator.py --help
usage: generator.py [-h] [--version] [-x] [-c CSSFILE] file

positional arguments:
  file                  hlavní HTML soubor ke zpracování

options:
  -h, --help            show this help message and exit
  --version             show program's version number and exit
  -x, --xhtml           generovat XHTML šablonu místo standardního HTML
  -c CSSFILE, --cssfile CSSFILE
                        cesta k CSS stylu (výchozí: style.css)

# 4. Kombinace přepínačů s pozičním argumentem:
$ python generator.py -x -c modern.css index.html
Namespace(cssfile='modern.css', file='index.html', xhtml=True)
```

---
<!-- slide: id3, Příklad – zdrojový kód, Core, pythonic -->
## Kompletní zdrojový kód ukázky

Jak málo kódu stačí k vytvoření takto robustního CLI rozhraní:

```python
#!/usr/bin/env python3
"""Generátor webových šablon s profesionálním CLI rozhraním."""
from argparse import ArgumentParser

# 1. Inicializace parseru s popisem utility:
parser = ArgumentParser(description="Generátor webových šablon a stránek.")

# 2. Informace o verzi:
parser.add_argument("--version", action="version", version="%(prog)s 1.0.0")

# 3. Přepínač (vlajka): True/False hodnota
parser.add_argument(
    "-x", "--xhtml",
    action="store_true",
    default=False,
    help="generovat XHTML šablonu místo standardního HTML"
)

# 4. Přepínač s hodnotou a výchozím nastavením:
parser.add_argument(
    "-c", "--cssfile",
    default="style.css",
    help="cesta k CSS stylu (výchozí: %(default)s)"
)

# 5. Povinný poziční argument (nemá na začátku pomlčku):
parser.add_argument(
    "file",
    help="hlavní HTML soubor ke zpracování"
)

# 6. Naparsování argumentů z příkazové řádky:
args = parser.parse_args()

# 7. Využití hodnot v programu:
print(f"Zpracovávám soubor: {args.file}")
print(f"Stylopis: {args.cssfile}, XHTML režim: {args.xhtml}")
```

---
<!-- slide: id4, Několik poznámek, Core, basics -->
## Principy fungování `argparse`

Při práci s `ArgumentParser` platí několik klíčových pravidel:

1. **Poziční argumenty vs. přepínače**:
   - Argument bez pomlčky na začátku (např. `"file"`) je **poziční** a ve výchozím stavu povinný.
   - Argument začínající pomlčkou (např. `"-c"`, `"--cssfile"`) je **volitelný přepínač**.
2. **Objekt `Namespace`**:
   - Metoda `parser.parse_args()` vrací instanci třídy `argparse.Namespace`.
   - K jednotlivým argumentům přistupujeme jako k běžným atributům objektu: `args.file`, `args.cssfile`.
   - V případě potřeby lze `Namespace` snadno převést na běžný slovník: `vars(args)`.
3. **Automatická nápověda**:
   - Přepínače `-h` a `--help` přidává `argparse` zcela automaticky.

---
<!-- slide: id5, Vytvoření parseru, Core, basics -->
## Inicializace parseru: Třída `ArgumentParser`

Konstruktor třídy `ArgumentParser` přijímá řadu užitečných konfiguračních parametrů:

```python
from argparse import ArgumentParser

parser = ArgumentParser(
    prog="muj_nastroj",                         # Název programu v nápovědě
    description="Nástroj pro transformaci dat", # Text pod řádkem usage:
    epilog="Příklad: %(prog)s vstup.csv -v",    # Text na samém konci nápovědy
    add_help=True                               # Automatické přidání -h/--help
)
```

### Formátovací zástupné symboly:
V textech `description` i `epilog` můžete použít proměnnou `%(prog)s`, která se automaticky nahradí skutečným názvem spuštěného skriptu (např. `sys.argv[0]`).

---
<!-- slide: id6, Přidávání argumentů I, Core, resyntax -->
## Metoda `add_argument()`: Rozpoznání typu argumentu

Metoda **`add_argument()`** slouží k registraci každého očekávaného vstupu:

```python
# 1. Poziční argument (povinný, bez pomlčky):
parser.add_argument("vstupni_soubor")

# 2. Přepínač (krátká i dlouhá varianta s pomlčkou):
parser.add_argument("-v", "--verbose")
```

### Vlastní prefixové znaky (`prefix_chars`):
Ve výchozím nastavení UNIX/POSIX standard používá znak `-`. V parseru však můžete povolit i alternativní znaky (např. Windows lomítko `/` nebo `+`):

```python
parser = ArgumentParser(prefix_chars="-+/")
parser.add_argument("+v", "++verbose", action="store_true")
```

---
<!-- slide: id7, Přidávání argumentů II, Tricky, pythonic -->
## Jak se přepínače zadávají v terminálu?

`argparse` je velmi tolerantní k různým konvencím zadávání přepínačů:

```bash
# Krátký přepínač s mezerou:
$ python script.py -c style.css data.txt

# Krátký přepínač bez mezery:
$ python script.py -cstyle.css data.txt

# Dlouhý přepínač s mezerou nebo rovnítkem:
$ python script.py --cssfile style.css data.txt
$ python script.py --cssfile=style.css data.txt

# Spojování krátkých booleovských přepínačů dohromady:
# -x -v -f  lze zapsat kompaktně jako:
$ python script.py -xvf data.txt
```

Nezadané volitelné přepínače získávají ve výchozím stavu hodnotu `None`.

---
<!-- slide: id8, Získání argumentů I, Core, pythonic -->
## Parsování: Metoda `parse_args()`

Metoda **`parse_args()`** standardně čte argumenty ze systémového seznamu `sys.argv[1:]`:

```python
parser.add_argument("-x", "--xhtml", action="store_true")
parser.add_argument("file")

args = parser.parse_args()
print(f"XHTML: {args.xhtml}, Soubor: {args.file}")
```

### Testování a předávání vlastního seznamu:
Při psaní automatických unit testů nemusíte modifikovat `sys.argv`. Stačí předat seznam řetězců přímo do `parse_args()`:

```python
# Simulace volání z příkazové řádky uvnitř testu:
args = parser.parse_args(["-x", "test.html"])
assert args.xhtml is True
assert args.file == "test.html"
```

---
<!-- slide: id9, Získání argumentů II, Core, basics -->
## Automatické ošetření chyb a validace

Pokud uživatel zadá neplatnou syntaxi, vynechá povinný argument nebo předá neznámý přepínač, `argparse` automaticky:
1. Vypíše stručné použití (`usage: ...`).
2. Vypíše přesný popis chyby na `sys.stderr`.
3. Ukončí běh programu s chybovým návratovým kódem `2` (`sys.exit(2)`).

```bash
$ python script.py --neznamy-parametr
usage: script.py [-h] [-x] file
script.py: error: unrecognized arguments: --neznamy-parametr
```

Váš aplikační kód se tak nemusí starat o defenzivní kontroly přítomnosti základních argumentů.

---
<!-- slide: id10, Získání argumentů III, Tricky, basics -->
## Oddělovač přepínačů: Znak `--`

Co když poziční argument (např. název souboru nebo záporné číslo) začíná pomlčkou (např. soubor `-data.txt` nebo číslo `-5`)?

Parser by se pokusil takový argument interpretovat jako neznámý přepínač!

Řešením je standardní POSIX **oddělovač `--`**, který parseru oznámí, že všechny následující tokeny jsou výhradně **poziční argumenty**:

```bash
$ python script.py -x -- -data.txt
Namespace(file='-data.txt', xhtml=True)
```

Vše za `--` je bezpečně přiřazeno do pozičního argumentu `file`.

---
<!-- slide: id11, Vlastnosti argumentů, Skip, basics -->
## Přehled parametrů metody `add_argument()`

Chování každého argumentu lze přizpůsobit pomocí sady parametrů:

- **`default`**: Výchozí hodnota při nezadání argumentu ([detail](#id12)).
- **`required`**: Vynucení přítomnosti přepínače ([detail](#id13)).
- **`dest`**: Název atributu ve výsledném objektu `Namespace` ([detail](#id14)).
- **`type`**: Typová konverze (`int`, `float`, `pathlib.Path`, vlastní funkce) ([detail](#id15)).
- **`choices`**: Omezení na povolený výčet hodnot ([detail](#id17)).
- **`action`**: Způsob uložení (`store`, `store_true`, `append`) ([detail](#id18)).
- **`nargs`**: Počet očekávaných hodnot (`N`, `?`, `*`, `+`) ([detail](#id25)).
- **`help`**: Popis argumentu pro generování nápovědy ([detail](#id31)).
- **`metavar`**: Název proměnné v nápovědě ([detail](#id32)).

---
<!-- slide: id12, Parametr „default“, Core, basics -->
## Parametr `default`: Výchozí hodnota

Pokud uživatel nezadá volitelný argument, atribut ve výsledném `Namespace` obdrží hodnotu specifikovanou v `default`:

```python
parser.add_argument("-t", "--timeout", default=30, type=int)
parser.add_argument("-c", "--config", default="config.json")
```

```bash
$ python app.py
Namespace(config='config.json', timeout=30)
```

> [!TIP]
> Pomocí `default=argparse.SUPPRESS` můžete zařídit, že pokud uživatel přepínač nezadá, atribut v objektu `args` vůbec nevznikne (nebude přítomen).

---
<!-- slide: id13, Parametr „required“, Tricky, basics -->
## Parametr `required`: Vynucení volitelného přepínače

Někdy chceme, aby parametr měl explicitní název (např. `--api-key`), ale zároveň byl pro běh skriptu **zcela povinný**.

K tomu slouží parametr `required=True`:

```python
parser.add_argument(
    "--api-key",
    required=True,
    help="Povinný autentizační klíč k API"
)
```

```bash
$ python client.py
usage: client.py [-h] --api-key API_KEY
client.py: error: the following arguments are required: --api-key
```

---
<!-- slide: id14, Parametr „dest“, Core, basics -->
## Parametr `dest`: Vlastní název atributu

Ve výchozím nastavení se název atributu v `Namespace` odvodí z dlouhého názvu přepínače (např. `--output-file` -> `args.output_file`).

Pomocí parametru `dest` můžete název atributu explicitně přepsat:

```python
parser.add_argument(
    "-o", "--output-file",
    dest="cil",
    help="Cílový soubor"
)

args = parser.parse_args(["-o", "vysledek.csv"])
print(args.cil)  # 'vysledek.csv' (nikoliv args.output_file!)
```

---
<!-- slide: id15, Parametr „type“, WOW, pythonic -->
## Parametr `type`: Automatická typová konverze

Ve výchozím stavu jsou všechny vstupy řetězce (`str`). Pomocí `type` předepíšeme libovolný volatelný objekt (*callable*), který provede konverzi:

```python
from pathlib import Path

parser.add_argument("--port", type=int, default=8080)
parser.add_argument("--scale", type=float, default=1.0)
parser.add_argument("--vstup", type=Path, default=Path("data.txt"))
```

Pokud uživatel zadá neplatnou hodnotu (např. `--port abc`), `argparse` vyvolá čistou chybu:
`error: argument --port: invalid int value: 'abc'`

---
<!-- slide: id16, Vyrobení vlastního typu, Core, pythonic -->
## Vlastní validátor a typová konverze

Jako parametr `type` lze předat libovolnou uživatelskou funkci. Pokud je hodnota neplatná, vyvoláme **`argparse.ArgumentTypeError`**:

```python
from argparse import ArgumentParser, ArgumentTypeError

def kladne_cislo(hodnota: str) -> int:
    """Konvertuje na int a ověří, že je kladné."""
    try:
        cislo = int(hodnota)
    except ValueError:
        raise ArgumentTypeError(f"'{hodnota}' není platné celé číslo!")
    if cislo <= 0:
        raise ArgumentTypeError(f"Hodnota {cislo} musí být větší než 0!")
    return cislo

parser = ArgumentParser()
parser.add_argument("-n", "--pocet", type=kladne_cislo, required=True)
```

```bash
$ python test.py -n -5
test.py: error: argument -n/--pocet: Hodnota -5 musí být větší než 0!
```

---
<!-- slide: id17, Parametr „choices“, Core, basics -->
## Parametr `choices`: Omezení na povolený výčet

Pokud parametr smí nabývat pouze několika konkrétních hodnot, předáme kolekci do `choices`:

```python
parser.add_argument(
    "--prostredi",
    choices=["vyvoj", "test", "produkce"],
    default="vyvoj",
    help="Cílové prostředí pro nasazení"
)

# Funguje i pro číselné rozsahy:
parser.add_argument(
    "--uroven",
    type=int,
    choices=range(1, 6),
    help="Úroveň logování (1 až 5)"
)
```

```bash
$ python app.py --prostredi staging
app.py: error: argument --prostredi: invalid choice: 'staging' (choose from 'vyvoj', 'test', 'produkce')
```

---
<!-- slide: id18, Parametr „action“, Skip, basics -->
## Parametr `action`: Reakce na výskyt argumentu

Parametr `action` určuje, co se má stát s hodnotou na příkazové řádce:

- **`"store"`**: Uloží zadanou hodnotu (výchozí).
- **`"store_true"` / `"store_false"`**: Uloží booleovskou hodnotu `True` / `False` bez nutnosti zadávat hodnotu.
- **`"store_const"`**: Uloží pevnou konstantu zadanou v `const=...`.
- **`"append"`**: Přidá hodnotu do seznamu (pro opakující se přepínače).
- **`"append_const"`**: Přidá konstantu do seznamu.
- **`"count"`**: Spočítá počet výskytů přepínače (např. `-vvv` pro úroveň ukecanosti).
- **`"version"`**: Vypíše verzi a ukončí program.

---
<!-- slide: id19, action='store', Skip, basics -->
## Akce `action='store'` (Výchozí chování)

Výchozí akce parseru: přečte následující hodnotu a uloží ji pod daný název.

```python
# Obě varianty jsou ekvivalentní:
parser.add_argument("-j", "--jmeno")
parser.add_argument("-j", "--jmeno", action="store")
```

```bash
$ python script.py -j Alice
Namespace(jmeno='Alice')
```

---
<!-- slide: id20, action='store_const', Skip, basics -->
## Akce `action='store_const'`

Při přítomnosti přepínače uloží předem definovanou konstantu:

```python
parser.add_argument(
    "--debug",
    dest="uroven_logu",
    action="store_const",
    const="DEBUG",
    default="INFO"
)
```

```bash
$ python app.py          # args.uroven_logu == 'INFO'
$ python app.py --debug  # args.uroven_logu == 'DEBUG'
```

---
<!-- slide: id21, action='store_true' & action='store_false', Core, pythonic -->
## Booleovské vlajky: `store_true` a `store_false`

Nejčastější způsob tvorby binárních přepínačů:

```python
parser.add_argument(
    "-q", "--quiet",
    action="store_true",
    default=False,
    help="Tichý režim bez výpisů"
)
```

- Bez přepínače: `args.quiet == False`.
- S přepínačem `python app.py -q`: `args.quiet == True`.

---
<!-- slide: id22, action='append', Core, pythonic -->
## Vícenásobné volání: `action='append'`

Pokud chceme umožnit uživateli zadat tentýž přepínač vícekrát a všechny hodnoty shromáždit do seznamu:

```python
parser.add_argument(
    "-i", "--include",
    action="append",
    help="Adresář k zahrnutí (lze zadat opakovaně)"
)
```

```bash
$ python builder.py -i /src -i /include -i /vendor
Namespace(include=['/src', '/include', '/vendor'])
```

---
<!-- slide: id23, action='append_const', Skip, pythonic -->
## Akce `action='append_const'`

Umožňuje různým přepínačům přidávat specifické konstanty do jednoho sdíleného seznamu:

```python
parser.add_argument("--int", dest="typy", action="append_const", const=int)
parser.add_argument("--str", dest="typy", action="append_const", const=str)
```

```bash
$ python script.py --int --str --int
Namespace(typy=[<class 'int'>, <class 'str'>, <class 'int'>])
```

---
<!-- slide: id24, action='version', Skip, basics -->
## Akce `action='version'`

Standardní způsob implementace přepínače verze programu:

```python
parser.add_argument(
    "-V", "--version",
    action="version",
    version="%(prog)s 3.12.0"
)
```

```bash
$ python script.py --version
script.py 3.12.0
```
Po výpisu verze se program okamžitě korektně ukončí (`sys.exit(0)`).

---
<!-- slide: id25, Parametr „nargs“, Core, resyntax -->
## Násobnost argumentů: Parametr `nargs`

Parametr **`nargs`** určuje, kolik hodnot z příkazové řádky má být zkonzumováno:

- **`N` (celé číslo)**: Přesně $N$ hodnot složených do seznamu.
- **`'?'`**: Nula nebo jedna hodnota (volitelná hodnota).
- **`'*'`**: Libovolný počet hodnot (0 až mnoho) složených do seznamu.
- **`'+'`**: Alespoň jedna hodnota (1 až mnoho); selže, pokud nezadáme nic.

---
<!-- slide: id26, nargs=N, Core, basics -->
## Pevný počet hodnot: `nargs=N`

Očekává přesně $N$ hodnot za sebou:

```python
# Přepínač očekávající dvojici souřadnic X a Y:
parser.add_argument("--bod", nargs=2, type=float, metavar=("X", "Y"))
```

```bash
$ python geo.py --bod 12.5 50.8
Namespace(bod=[12.5, 50.8])

$ python geo.py --bod 12.5
geo.py: error: argument --bod: expected 2 arguments
```

---
<!-- slide: id27, nargs='?', Tricky, pythonic -->
## Volitelná hodnota: `nargs='?'`

Umožňuje vytvořit poziční argument, který nemusí být zadán, nebo přepínač, který může mít volitelnou hodnotu:

```python
# Poziční vstupní soubor (pokud není zadán, čte se ze sys.stdin):
import sys
parser.add_argument(
    "vstup",
    nargs="?",
    default=sys.stdin
)
```

Při nezadání se použije hodnota `default`.

---
<!-- slide: id28, nargs='*', Skip, basics -->
## Libovolný počet hodnot: `nargs='*'`

Shromáždí všechny následující argumenty do seznamu (může být i prázdný):

```python
parser.add_argument("soubory", nargs="*", help="Seznam souborů ke zpracování")
```

```bash
$ python archiver.py a.txt b.txt c.txt
Namespace(soubory=['a.txt', 'b.txt', 'c.txt'])

$ python archiver.py
Namespace(soubory=[])
```

---
<!-- slide: id29, nargs='+', Skip, basics -->
## Alespoň jedna hodnota: `nargs='+'`

Podobně jako `*`, ale vyžaduje minimálně jeden argument:

```python
parser.add_argument("soubory", nargs="+", help="Minimálně jeden soubor ke smazání")
```

```bash
$ python rm.py
rm.py: error: the following arguments are required: soubory
```

---
<!-- slide: id30, Parametr „const“, Skip, basics -->
## Parametr `const`: Konstantní hodnota

Parametr `const` dodává pevnou hodnotu v kombinacích s `action='store_const'` nebo `nargs='?'`:

```python
parser.add_argument(
    "--log",
    nargs="?",
    const="app.log",      # Použije se, pokud uživatel napíše jen --log
    default="console"     # Použije se, pokud uživatel --log nenapíše vůbec
)
```

- `python app.py` -> `args.log == 'console'`
- `python app.py --log` -> `args.log == 'app.log'`
- `python app.py --log custom.log` -> `args.log == 'custom.log'`

---
<!-- slide: id31, Parametr „help“, Core, basics -->
## Formátování textu nápovědy (`help`)

V textu nápovědy můžete využít automatické formátování metadat:

```python
parser.add_argument(
    "-p", "--port",
    type=int,
    default=8000,
    help="Síťový port serveru (výchozí: %(default)s)"
)
```

Nápověda automaticky doplní výchozí hodnotu: `(výchozí: 8000)`.

---
<!-- slide: id32, Parametr „metavar“, Skip, basics -->
## Vlastní zástupný název: Parametr `metavar`

Metoda `add_argument()` standardně odvodí název proměnné v nápovědě z názvu argumentu. Pomocí `metavar` upravíme pouze její vizuální podobu:

```python
parser.add_argument(
    "-t", "--timeout",
    metavar="SEKUNDY",
    type=int,
    help="Maximální doba čekání"
)
```

```text
options:
  -t SEKUNDY, --timeout SEKUNDY  Maximální doba čekání
```

---
<!-- slide: id33, Skupiny argumentů, Skip, basics -->
## Organizace nápovědy: `add_argument_group()`

U komplexních CLI nástrojů s desítkami parametrů je vhodné rozdělit nápovědu do logických sekcí:

```python
parser = ArgumentParser()

# Skupina pro databázi:
db_group = parser.add_argument_group("Databázové připojení")
db_group.add_argument("--db-host", default="localhost")
db_group.add_argument("--db-port", type=int, default=5432)

# Skupina pro výstup:
io_group = parser.add_argument_group("Formát výstupu")
io_group.add_argument("--json", action="store_true")
```

---
<!-- slide: id34, Navzájem se vylučující argumenty, WOW, pythonic -->
## Vzájemné vyloučení: `add_mutually_exclusive_group()`

Častý požadavek: uživatel si smí vybrat **buď volbu A, nebo volbu B, ale nikdy obě současně**!

```python
parser = ArgumentParser()
skupina = parser.add_mutually_exclusive_group(required=True)

skupina.add_argument("-v", "--verbose", action="store_true", help="Detailní výpis")
skupina.add_argument("-q", "--quiet", action="store_true", help="Úplně tichý režim")
```

```bash
$ python app.py -v -q
app.py: error: argument -q/--quiet: not allowed with argument -v/--verbose
```

Parametr `required=True` navíc zajistí, že uživatel musí zvolit právě jednu z těchto možností.

---
<!-- slide: id35, Výchozí hodnoty argumentů, Tricky, pythonic -->
## Globální výchozí hodnoty: `set_defaults()`

Metoda **`parser.set_defaults()`** umožňuje přepsat nebo doplnit výchozí hodnoty globálně (např. po načtení konfiguračního souboru):

```python
parser = ArgumentParser()
parser.add_argument("-x", default="A")
parser.set_defaults(x="B", extra_parametr=100)

args = parser.parse_args([])
print(args.x)              # 'B'
print(args.extra_parametr) # 100
```

---
<!-- slide: id36, Částečné zpracování, WOW, pythonic -->
## Částečné zpracování: `parse_known_args()`

Pokud váš skript slouží jako wrapper nad jiným programem a chcete zpracovat pouze své vlastní argumenty a zbytek předat dál:

```python
parser = ArgumentParser()
parser.add_argument("-v", "--verbose", action="store_true")

# parse_known_args() nevyvolá chybu při neznámých argumentech:
znama_args, zbytek = parser.parse_known_args()

print(f"Verbose: {znama_args.verbose}")
print(f"Neznámé argumenty k předání dál: {zbytek}")
```

```bash
$ python wrapper.py -v --extra-flag hodnota soubor.txt
Verbose: True
Neznámé argumenty k předání dál: ['--extra-flag', 'hodnota', 'soubor.txt']
```

---
<!-- slide: id37, „Argumenty argumentů“, Skip, basics -->
## Podpříkazy a architektura sub-příkazů: `add_subparsers()`

Nejvyšší úroveň tvorby CLI nástrojů (tzv. git-style CLI jako `git commit`, `docker build`, `kubectl get`):

```python
parser = ArgumentParser(prog="spravce")
subparsers = parser.add_subparsers(dest="prikaz", required=True)

# 1. Podpříkaz 'start':
parser_start = subparsers.add_parser("start", help="Spustí službu")
parser_start.add_argument("--port", type=int, default=8000)

# 2. Podpříkaz 'stop':
parser_stop = subparsers.add_parser("stop", help="Zastaví službu")
parser_stop.add_argument("--force", action="store_true")

args = parser.parse_args()

if args.prikaz == "start":
    print(f"Startuji na portu {args.port}...")
elif args.prikaz == "stop":
    print(f"Zastavuji službu (force={args.force})...")
```

Díky `argparse` získá každý dílčí podpříkaz svou vlastní nezávislou nápovědu (`spravce start --help`).
