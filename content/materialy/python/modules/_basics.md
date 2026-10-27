<!-- slide: id=id1 title="Úvod do modulů" tags="Core" diff="paradigm" -->
## Úvod do modulů v Pythonu

Pythonovské **moduly** patří mezi nejelegantnější a nejpraktičtější vlastnosti jazyka. Práce s nimi je od základu tak přirozená a přímočará, že je programátor začne používat automaticky bez jakékoliv mentální bariéry.

Mezi jejich hlavní přednosti patří:
- **Čisté zapouzdření bez nuceného OOP**: Dokáží s přehledem nahradit devadesát procent běžného používání tříd pro pouhé uschování funkcí a stavu (žádné umělé statické třídy jako v Javě či C#).
- **Přirozený jmenný prostor**: Zabraňují kolizím proměnných a zpřehledňují rozsáhlé aplikace.
- **Znovupoužitelnost**: Kód jednou napsaný v modulu lze okamžitě importovat do desítek různých skriptů.

---
<!-- slide: id=id2 title="Nejjednodušší modul" tags="Core" diff="basics" -->
## Nejjednodušší modul: Jakýkoliv soubor `.py`

Nejjednodušším modulem je jakýkoliv soubor s pythonním kódem. Dokonce i zcela prázdný soubor je validní modul!

Jakmile máte soubor `program.py`:

```python
# Program: program.py
"""Můj skvělý pomocný modul!"""

xs = [1, 2, 3]

def pozdrav(jmeno: str) -> str:
    return f"Ahoj, {jmeno}!"
```

Můžete jej v jiném souboru ve stejné složce okamžitě naimportovat:

```python
# Program: main.py
import program

print(program.__doc__)
print(f"Délka seznamu: {len(program.xs)}")
print(program.pozdrav("Davide"))
```

Ke všem proměnným, funkcím a třídám z modulu přistupujeme čitelně přes tečkovou notaci: `jmeno_modulu.atribut`.

---
<!-- slide: id=id3 title="Možnosti importu a aliasing" tags="Core" diff="basics" -->
## Formy importu a přejmenování (`as`)

Python nabízí několik způsobů importu:

1. **Import celého modulu (doporučeno pro přehlednost)**:
   ```python
   import math
   vysledek = math.sqrt(16)
   ```

2. **Import konkrétních jmen do lokálního scopu**:
   ```python
   from program import xs, pozdrav
   print(xs)
   ```

3. **Přejmenování aliasem pomocí `as` (ochrana před kolizí)**:
   ```python
   import numpy as np
   from program import xs as ciselny_seznam
   ```

> [!NOTE]
> Zástupný import `from modul import *` se v produkčním kódu nedoporučuje (kromě interaktivní konzole), protože znečišťuje lokální jmenný prostor a znesnadňuje čtenáři i statickým analyzátorům odhalit, odkud která proměnná pochází.

---
<!-- slide: id=id4 title="Základní pravidla pro názvy modulů" tags="Tricky" diff="basics" -->
## Pravidla pro názvy modulů a hledání

Aby import fungoval bez problémů, musí být splněny tři podmínky:

1. **Název souboru musí být platný identifikátor**:
   Jméno souboru musí vyhovět pravidlům pro pythonní proměnné (`str.isidentifier()`). Soubor `1.py` nebo `muj-skript.py` nelze naimportovat standardním příkazem `import`, protože pomlčka je operátor minus a číslice na začátku je neplatná!
   ```python
   >>> 'program'.isidentifier()
   True
   >>> '1_test'.isidentifier()
   False
   >>> 'muj-modul'.isidentifier()
   False
   ```

2. **Soubor musí ležet na cestě vyhledávání (`sys.path`)**:
   Interpret prohledává složky v pořadí:
   - Adresář aktuálně spuštěného skriptu.
   - Proměnná prostředí `PYTHONPATH`.
   - Standardní knihovna a nainstalované balíčky v `site-packages`.

3. **Předcházení kolizím s vestavěnými moduly**:
   Nikdy nepojmenovávejte svůj soubor `math.py`, `random.py`, `test.py` nebo `email.py` – zastínili byste tím standardní knihovnu Pythonu!

---
<!-- slide: id=id5 title="Architektura skript versus modul" tags="Skip" diff="basics" -->
## Architektura: Skript versus znovupoužitelný modul

Zlatým pravidlem modularity v Pythonu je idiomatická konstrukce **`if __name__ == "__main__":`**:

```python
# Program: kalkulacka.py
def secti(a: float, b: float) -> float:
    return a + b

# Tento blok se vykoná POUZE tehdy, když soubor spustíte přímo z terminálu.
# Pokud je kalkulacka.py naimportována jako modul, tento blok se přeskočí!
if __name__ == "__main__":
    import sys
    print("Spuštěno jako samostatný program.")
    print("Test součtu 2 + 3 =", secti(2, 3))
```

Díky této konstrukci může jakýkoliv váš soubor fungovat zároveň jako samostatně spustitelný skript i jako čistý importovatelný modul pro ostatní části systému.
