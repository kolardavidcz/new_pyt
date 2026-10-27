<!-- slide: id1, Úvod, Core, newconcept -->
## Spouštění externích procesů: Modul `subprocess`

V systémovém programování a automatizačních skriptech často potřebujeme volat externí nástroje operačního systému (např. `git`, `ffmpeg`, `docker`, `grep`, kompilátory `gcc`/`clang` nebo externí bioinformatické pipeline).

V minulosti se v Pythonu používaly zastaralé funkce `os.system()` a `os.popen()`. Ty však trpěly zásadními bezpečnostními a architektonickými nedostatky:
- Spouštěly příkaz přes shell, což otevíralo vrata pro **Shell Injection** útoky.
- Neumožňovaly bezpečně oddělit `stdout` od `stderr`.
- Návratové kódy z `os.system()` byly závislé na platformě a často maskovaly selhání.

Standardní modul **`subprocess`** přinesl moderní, bezpečné a robustní rozhraní pro správu procesů:
- Od Pythonu 3.5 je primárním rozhraním synchronní funkce **`subprocess.run()`** ([detail](#id2)).
- Pro pokročilé asynchronní proudy, roury (*pipes*) a řízení na pozadí slouží nízkoúrovňová třída **`subprocess.Popen`** ([detail](#id11)).

---
<!-- slide: id2, I. „run()“, Core, newconcept -->
## Doporučený standard: Funkce `subprocess.run()`

Pro 95 % běžných případů je funkce **`subprocess.run()`** jediným nástrojem, který budete potřebovat.

```python
subprocess.run(
    args,                    # Příkaz a argumenty (seznam řetězců!)
    *,
    capture_output=False,    # Zachytit stdout i stderr (Python 3.7+)
    text=None,               # Dekódovat výstupy jako str místo bytes (Python 3.7+)
    check=False,             # Vyvolat CalledProcessError při nenulovém returncode
    timeout=None,            # Maximální doba běhu v sekundách
    shell=False,             # Nespouštět přes shell (kritické pro bezpečnost!)
    cwd=None,                # Pracovní adresář pro běžící proces
    env=None                 # Slovník proměnných prostředí
)
```

Funkce spustí proces, počká na jeho dokončení a vrátí objekt **`CompletedProcess`**.

---
<!-- slide: id3, Základní použití, Core, resyntax -->
## Základní spuštění procesu a bezpečnostní pravidlo

### Zlaté pravidlo: Vždy předávejte argumenty jako SEZNAM!

```python
import subprocess

# 1. Správný a bezpečný způsob (argumenty jako seznam řetězců):
vysledek = subprocess.run(["ls", "-l", "/tmp"])

# V CPythonu se na pozadí volá přímo POSIX execvp() nebo CreateProcess() na Windows.
# Žádný shell se nespouští, znaky jako ';', '|', '&', rm -rf' NEBUDOU vyhodnoceny!
```

> [!CAUTION]
> **Proč se vyhnout `shell=True`?**
> Pokud předáte uživatelský vstup do `shell=True` nebo `os.system()`, útočník může zadat např. `soubor.txt; rm -rf /` a shell příkaz svévolně vykoná! Při předání seznamu `["ls", "-l", uzivatelsky_vstup]` je vstup předán bezpečně jako jediný argument bez možnosti injektáže.

Pokud přesto potřebujete řetězec rozdělit na bezpečný seznam argumentů, použijte **`shlex.split()`**:
```python
import shlex
prikaz = shlex.split("git commit -m 'Oprava chyby'")  # ['git', 'commit', '-m', 'Oprava chyby']
subprocess.run(prikaz)
```

---
<!-- slide: id4, „stdout“ – přesměrování výstupu, Core, pythonic -->
## Přesměrování výstupu do souboru

Ve výchozím nastavení proces tiskne výstup na standardní terminálový výstup. Chceme-li výstup přesměrovat přímo do otevřeného souboru:

```python
import subprocess
from pathlib import Path

vystupni_soubor = Path("vypis_adresare.txt")

with vystupni_soubor.open("w", encoding="utf-8") as f:
    # stdout je přesměrován přímo do souborového deskriptoru:
    hotovo = subprocess.run(["git", "status"], stdout=f)

print(f"Příkaz skončil s kódem: {hotovo.returncode}")
```

Operační systém streamuje data přímo do souboru bez nutnosti načítat celý výstup do paměti RAM v Pythonu.

---
<!-- slide: id5, „input“ – vlastní vstup (1), Core, resyntax -->
## Předávání vstupních dat: Parametr `input` (Bajty)

Potřebujeme-li programu předat data na jeho standardní vstup `stdin` (např. nástrojům `sort`, `grep` nebo `python`):

```python
import subprocess

# Předání binárních dat na standardní vstup stdin:
data = b"banan\njablko\nananas\nmeloun\n"

proces = subprocess.run(
    ["sort"],
    input=data,
    stdout=subprocess.PIPE
)

print(proces.stdout)
# b'ananas\nbanan\njablko\nmeloun\n'
```

---
<!-- slide: id6, „input“ – vlastní vstup (2), WOW, pythonic -->
## Textový režim: `text=True` (nebo `encoding="utf-8"`)

Od Pythonu 3.7 můžeme nastavit **`text=True`** (případně specifikovat kódování `encoding="utf-8"`). Všechny proudy (`input`, `stdout`, `stderr`) pak automaticky pracují s běžnými Python řetězci (`str`) místo `bytes`:

```python
import subprocess

textovy_vstup = "Zdeněk\nAdam\nBožena\nCyril\n"

proces = subprocess.run(
    ["sort"],
    input=textovy_vstup,
    text=True,
    capture_output=True,
    encoding="utf-8"
)

print("Seřazený výstup:")
print(proces.stdout)
```

Žádné ruční volání `.encode()` ani `.decode()` již není nutné!

---
<!-- slide: id7, Objekt vráceného stavu „CompletedProcess“, Tricky, pythonic -->
## Návratový objekt `CompletedProcess`

Volání `subprocess.run()` vrací objekt **`CompletedProcess`** s následujícími atributy:

```python
import subprocess

hotovo = subprocess.run(
    ["git", "rev-parse", "--short", "HEAD"],
    capture_output=True,
    text=True
)

# 1. args: přesná podoba spuštěného příkazu
print("Spuštěno:", hotovo.args)

# 2. returncode: celočíselný návratový kód (0 = úspěch, >0 = chyba)
print("Kód návratu:", hotovo.returncode)

# 3. stdout: zachycený standardní výstup
print("Výstup:", hotovo.stdout.strip())

# 4. stderr: zachycený chybový výstup
print("Chyby:", hotovo.stderr)
```

> [!TIP]
> Přepínač **`capture_output=True`** je zkratkou pro současné nastavení `stdout=subprocess.PIPE, stderr=subprocess.PIPE`.

---
<!-- slide: id8, „check=True“ – zachycení chyby, Core, pythonic -->
## Automatická kontrola návratového kódu: `check=True`

V Unixu i Windows značí návratový kód `0` úspěch, zatímco jakékoliv nenulové číslo značí chybu. Ve výchozím stavu `subprocess.run()` chybu tiše ignoruje a pouze ji zaznamená do `returncode`.

Pokud nastavíme **`check=True`**, při nenulovém kódu vyvolá Python výjimku **`subprocess.CalledProcessError`**:

```python
import subprocess

try:
    # Pokus o zobrazení neexistujícího souboru:
    subprocess.run(["cat", "neexistujici_soubor.txt"], check=True, capture_output=True)
except subprocess.CalledProcessError as err:
    print(f"Příkaz selhal s kódem {err.returncode}!")
    print(f"Příkaz: {err.cmd}")
    print(f"Chybová hláška z procesu: {err.stderr}")
```

> [!IMPORTANT]
> **Doporučená praxe**: V automatizačních a produkčních skriptech vždy uvádějte `check=True`, aby se zabránilo pokračování programu v případě selhání externího nástroje.

---
<!-- slide: id9, „stderr“ – odchycení chybového výstupu, Core, basics -->
## Sloučení chybového a standardního výstupu: `STDOUT`

Někdy potřebujeme, aby chybové hlášky i běžné zprávy přicházely v přesném pořadí tak, jak byly vytištěny. K tomu slouží speciální konstanta **`subprocess.STDOUT`**:

```python
import subprocess

# Sloučí stderr do proudu stdout:
proces = subprocess.run(
    ["bash", "-c", "echo Běžná zpráva; echo 'Chyba!' >&2"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

print(proces.stdout)
# Běžná zpráva
# Chyba!
```

### Zahazování výstupu: `subprocess.DEVNULL`
Pokud chceme výstup zcela zahodit (analogicky k `/dev/null` na Unixu či `NUL` na Windows):
```python
subprocess.run(["ping", "-c", "1", "127.0.0.1"], stdout=subprocess.DEVNULL)
```

---
<!-- slide: id10, „timeout“, Core, newconcept -->
## Ochrana proti zamrznutí procesu: Parametr `timeout`

Pokud externí program čeká na síťový soket, vstoupí do nekonečné smyčky nebo zamrzne, váš Python skript by bez ošetření zůstal viset navždy.

Parametr **`timeout=SEKUNDY`** zajistí, že pokud proces neskončí v zadaném čase, Python jej automaticky ukončí a vyvolá výjimku **`subprocess.TimeoutExpired`**:

```python
import subprocess

try:
    # Spuštění procesu s limitem 5 sekund:
    subprocess.run(["sleep", "60"], timeout=5.0)
except subprocess.TimeoutExpired as err:
    print(f"Proces {err.cmd} překročil časový limit {err.timeout} s a byl ukončen!")
```

Při vyvolání výjimky se Python pokusí běžící podproces automaticky usmrtit (*kill*).

---
<!-- slide: id11, II. „Popen()“, Core, newconcept -->
## Třída `subprocess.Popen`: Nízkoúrovňové řízení procesů

Funkce `subprocess.run()` je synchronní wrapper nad základní třídou **`subprocess.Popen`** (*Process Open*).

`Popen` vytváří proces **asynchronně na pozadí**: po jeho zavolání Python kód okamžitě pokračuje dál, zatímco externí proces běží paralelně v operačním systému:

```python
import subprocess
import time

# Spuštění procesu na pozadí (nečekáme na dokončení):
proc = subprocess.Popen(["python", "dlouhy_vypocet.py"])

print(f"Proces spuštěn s PID: {proc.pid}")

# Python dělá jinou práci:
while proc.poll() is None:
    print("Proces stále běží na pozadí...")
    time.sleep(1)

print(f"Proces dokončen s kódem: {proc.returncode}")
```

- **`proc.poll()`**: Zkontroluje, zda proces již skončil (vrátí `None` pokud ještě běží, jinak návratový kód).
- **`proc.wait()`**: Počká na dokončení procesu.
- **`proc.terminate()`**: Pošle signál `SIGTERM` (požadavek na ukončení).
- **`proc.kill()`**: Tvrdé okamžité ukončení přes `SIGKILL` / `TerminateProcess`.

---
<!-- slide: id12, Parametry, Tricky, newconcept -->
## Parametry třídy `Popen` a metoda `communicate()`

```python
proc = subprocess.Popen(
    args,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    cwd="/cesta/k/adresari",
    env={"MOJE_PROMENNA": "hodnota", **os.environ}
)
```

### Proč NIKDY nečíst z `proc.stdout` napřímo v cyklu bez opatrnosti?
Operační systém má pro roury vyrovnávací paměť (*pipe buffer*, typicky 64 KB). Pokud externí proces zaplní výstupní buffer a Python zároveň čeká na vstup, dojde k nevratnému zablokování (**Deadlock**)!

### Bezpečné řešení: Metoda `proc.communicate()`
```python
# communicate() bezpečně odešle vstup, přečte veškerý výstup a počká na ukončení:
stdout_data, stderr_data = proc.communicate(input=b"data pro vstup")
```
Metoda `communicate()` čte výstupy z oddělených vláken a garantuje, že k deadlocku bufferů nedojde.

---
<!-- slide: id13, Vlastní vstup, Skip, basics -->
## Příklady: Streamování dat přes `stdin=subprocess.PIPE`

```python
import subprocess

# Spustíme externí proces 'grep' filtrující řádky obsahující slovo 'ERROR':
proc = subprocess.Popen(
    ["grep", "ERROR"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True
)

vstupni_logy = """INFO: Start aplikace
ERROR: Databáze nedostupná
DEBUG: Zpráva ladění
ERROR: Vypršel časový limit spojení
"""

stdout, _ = proc.communicate(input=vstupni_logy)
print("Nalezené chyby:")
print(stdout)
```

Výstup:
```text
Nalezené chyby:
ERROR: Databáze nedostupná
ERROR: Vypršel časový limit spojení
```

---
<!-- slide: id14, Přesměrování vstupu i výstupu, Skip, basics -->
## Propojení procesů rourou v Pythonu (Piping)

V shellu běžně píšeme: `cat soubor.txt | grep vzor | wc -l`. Jak tuto pipeline elegantně sestavit v Pythonu?

Výstup jednoho `Popen` objektu propojíme se vstupem druhého `Popen` objektu:

```python
import subprocess

# 1. První proces: dmesg (nebo generování dat)
p1 = subprocess.Popen(["cat", "/var/log/syslog"], stdout=subprocess.PIPE)

# 2. Druhý proces: grep filtrující výstup p1
p2 = subprocess.Popen(["grep", "usb"], stdin=p1.stdout, stdout=subprocess.PIPE)

# Uvolníme deskriptor v rodičovském procesu, aby p1 obdržel SIGPIPE při ukončení p2:
p1.stdout.close()

# 3. Získáme finální výstup z p2:
vystup, _ = p2.communicate()
print(vystup.decode("utf-8"))
```

Tímto způsobem streamujete gigabajty dat mezi procesy s minimální paměťovou režií.

---
<!-- slide: id15, Odchycení chyby I, Skip, basics -->
## Oddělené zachytávání `stdout` a `stderr` v `Popen`

Pokud volaný skript tiskne jak běžná data, tak chybová hlášení:

```python
import subprocess

prikaz = ["python", "-c", "import sys; sys.stdout.write('OK\\n'); sys.stderr.write('Varování!\\n')"]

proc = subprocess.Popen(prikaz, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
stdout, stderr = proc.communicate()

print(f"Stdout: {stdout.strip()}")
print(f"Stderr: {stderr.strip()}")
print(f"Skončilo kódem: {proc.returncode}")
```

Máte k dispozici oba datové proudy čistě oddělené v textové podobě.

---
<!-- slide: id16, Odchycení chyby II, Skip, basics -->
## Shrnutí a doporučené postupy

| Úloha | Doporučený nástroj |
|---|---|
| **Jednoduché spuštění a čekání na výsledek** | `subprocess.run(args, check=True)` |
| **Získání výstupu jako textu** | `subprocess.run(args, capture_output=True, text=True, check=True)` |
| **Časově omezený příkaz** | `subprocess.run(args, timeout=10.0)` |
| **Dlouhoběžící úloha na pozadí** | `subprocess.Popen(args)` |
| **Propojení dvou procesů rourou (`cmd1 \| cmd2`)** | `Popen` s propojením `p1.stdout -> p2.stdin` |
| **Spouštění přes shell** | **ZÁSADNĚ NEPOUŽÍVAT** bez nutnosti; jinak `shlex.quote()` |

Modul `subprocess` poskytuje kompletní, bezpečné a multiplatformní řízení procesů v souladu s moderními standardy Pythonu 3.12+.
