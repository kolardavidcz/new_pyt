<!-- slide: id=id1 title="Úvod do os.system()" tags="Core" diff="basics" -->
## Spouštění externích procesů: `os.system()`

Metoda **`os.system()`** z modulu `os` představuje historicky nejstarší a nejprimitivnější způsob spouštění externích programů a systémových příkazů z Pythonu:

1. Python na pozadí spustí systémový shell (`/bin/sh` na Linuxu/macOS, `cmd.exe` na Windows).
2. Shellu předá zadaný příkazový řetězec, který shell vyhodnotí a vykoná.
3. Python interpret čeká, dokud externí proces neskončí, a poté převezme řízení zpět.
4. Návratovou hodnotou je návratový kód shellu (*exit status code*, v C reprezentovaný jako 16bitový stav z `wait()`).

---
<!-- slide: id=id2 title="Omezení a úskalí os.system()" tags="Tricky" diff="basics" -->
## Omezení a úskalí `os.system()`

Ačkoliv je zápis `os.system()` přímočarý, přináší zásadní nevýhody:

- **Nelze zachytit výstup v paměti**: Standardní výstup (`stdout`) i chybový výstup (`stderr`) směřují přímo do konzole operačního systému. Python nemá k textovému výstupu přístup.
- **Kryptická návratová hodnota**: Návratový kód na POSIX systémech obsahuje exit kód posunutý o 8 bitů doleva (`status >> 8`) plus kód signálu ukončení.
- **Riziko zablokování (Deadlock / Freeze)**: Pokud externí proces čeká na interaktivní vstup uživatele nebo uvízne v nekonečné smyčce, pythonní skript zcela zamrzne (nelze nastavit timeout).
- **Závislost na shellu**: Chování závisí na dostupném shellu a proměnných prostředí daného OS.

---
<!-- slide: id=id3 title="Základní použití" tags="Core" diff="basics" -->
## Základní použití `os.system()`

Použití je zdánlivě jednoduché – předáme příkazový řetězec:

```python
import os

# Spuštění výpisu adresáře (volá systémový příkaz ls nebo dir)
exit_code = os.system("ls -la")

print(f"Exit kód: {exit_code}")
```

Výstup příkazu `ls` se vypíše přímo do terminálu. Proměnná `exit_code` bude `0` při úspěchu nebo nenulová při chybě.

> [!NOTE]
> Pro dávkové spouštění skriptů za sebou může `os.system()` posloužit, ale v moderním kódu má Python mnohem bezpečnější alternativy.

---
<!-- slide: id=id4 title="Ošetření výstupů" tags="Tricky" diff="resyntax" -->
## Přesměrování výstupu do souboru

Protože `os.system()` neumí předat výstup do pythonní proměnné, jediným způsobem, jak data získat, je spolehnout se na přesměrování shellu (`>`):

```python
import os

# Přesměrování výstupu do dočasného souboru
os.system("ls -la > listing.txt")

# Následné přečtení souboru v Pythonu
with open("listing.txt", "r", encoding="utf-8") as f:
    obsah = f.read()

print(f"Přečteno {len(obsah)} znaků.")
```

Tento přístup je těžkopádný – vyžaduje zápis na disk a následný úklid dočasných souborů.

---
<!-- slide: id=id5 title="Ošetření chyb a chybového výstupu" tags="Skip" diff="basics" -->
## Přesměrování chybového výstupu (`stderr`)

Stejně tak pro zachycení chybových hlášení musíme využít operátory shellu `1>` (stdout) a `2>` (stderr):

```python
import os

# Přesměrování stdout i stderr do samostatných souborů
ret = os.system("ls /neexistujici_slozka 1> vystup.log 2> chyby.log")

if ret != 0:
    with open("chyby.log", "r", encoding="utf-8") as f:
        print("Chyba příkazu:", f.read())
```

---
<!-- slide: id=id6 title="Kritické bezpečnostní varování: Shell Injection" tags="Tricky" diff="newconcept" -->
## Kritické bezpečnostní varování: Shell Injection

`os.system()` představuje obrovskou bezpečnostní zranitelnost, pokud do příkazu dosadíte uživatelský vstup:

```python
import os

uživatelské_jméno = "jan; rm -rf / #"  # Útočný řetězec!
příkaz = f"echo Vítej uživateli: {uživatelské_jméno}"

# Shell spustí jak echo, tak destruktivní příkaz rm!
os.system(příkaz)
```

Shell interpretuje speciální znaky (`;`, `&&`, `|`, `` ` ``, `$()`), což útočníkovi umožňuje provést libovolný kód s právy spuštěného Python procesu (*Command Injection*).

---
<!-- slide: id=id7 title="Moderní náhrada: subprocess.run()" tags="Skip" diff="basics" -->
## Moderní náhrada: Modul `subprocess`

Od Pythonu 2.4 (a zejména v moderním Pythonu 3.5+) je standardem modul **`subprocess`**, konkrétně funkce **`subprocess.run()`**:

```python
import subprocess

# Bezpečné spuštění bez shellu: argumenty předány jako seznam!
result = subprocess.run(
    ["ls", "-la"],
    capture_output=True,  # Zachytí stdout i stderr přímo do paměti
    text=True,            # Automaticky dekóduje bytes na str
    timeout=10,           # Ochrana před zablokováním procesu
    check=True,           # Vyvolá CalledProcessError při nenulovém exit kódu
)

print("Výstup:")
print(result.stdout)
```

Proč je `subprocess.run()` lepší než `os.system()`?
- **Bezpečnost**: Spouští binárku přímo bez shellu (`shell=False` je výchozí), injection není možná.
- **Přímo v paměti**: `result.stdout` a `result.stderr` jsou okamžitě k dispozici v proměnné.
- **Timeouty**: Parametr `timeout=` chrání před zamrznutím.
