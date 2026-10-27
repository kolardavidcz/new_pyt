<!-- slide: id1, Úvod do základních řídicích konstrukcí, Core, basics -->
## Úvod do základních řídicích konstrukcí

V této přehledové přednášce si systematicky zmapujeme základní řídicí konstrukce Pythonu:

- [Větvení `if-elif-else`](#id2)
- [Podmíněný výraz (ternární operátor)](#id3)
- [Strukturální pattern matching `match-case`](#id4)
- [Cykly `for-in` a chování scope](#id6)
- [Cykly s větví `else`](#id8)
- [Cyklus `while` a walrus operátor `:=`](#id9)
- [Řízení běhu cyklu (`break`, `continue`)](#id12)
- [Ošetření výjimek `try-except-else-finally`](#id13)
- [Definice funkcí `def` a typové anotace](#id19)

> [!NOTE] Odsazování (Indentation)
> Python nepoužívá složené závorky `{}` pro bloky kódu jako C/C++ nebo Java. Bloky jsou vymezeny **dvojtečkou `:` a odsazením** (dle PEP 8 standardně **4 mezery** na úroveň zanoření).

---
<!-- slide: id2, Větvení „if-elif-else“, Core, resyntax -->
## Větvení „if-elif-else“

Podmíněný příkaz větví tok programu podle pravdivostní hodnoty výrazu:

```python
if podminka_1:
    proved_blok_1()
elif podminka_2:
    proved_blok_2()
else:
    proved_vychozi_blok()
```

### Pravidla a konvence:
- Větve `elif` a `else` jsou volitelné.
- Větví `elif` může být libovolné množství.
- Jako podmínku lze použít jakýkoliv objekt – Python provede implicitní převod na `bool` (tzv. *truthy* a *falsy* hodnoty):
  - **Falsy**: `None`, `False`, `0`, `0.0`, prázdné kontejnery `""`, `[]`, `{}`, `set()`.
  - **Truthy**: cokoliv ostatního (nenulová čísla, neprázdné řetězce a kontejnery).

---
<!-- slide: id3, Podmíněný výraz („ternární operátor“), Core, pythonic -->
## Podmíněný výraz („ternární operátor“)

Zatímco v C/C++, Javě nebo JS se používá syntaxe `podminka ? vyraz_true : vyraz_false`, Python používá přirozenější syntaxi čtenou zleva doprava:

$$\text{vysledek} = \text{vyraz\_true} \;\mathbf{if}\; \text{podminka} \;\mathbf{else}\; \text{vyraz\_false}$$

```python
status = "dospělý" if vek >= 18 else "nezletilý"

# Ekvivalent klasického bloku:
# if vek >= 18:
#     status = "dospělý"
# else:
#     status = "nezletilý"
```

> [!TIP] Výraz vs. Příkaz
> Podmíněný výraz je **výraz** (*expression*), nikoliv příkaz (*statement*). To znamená, že vrací hodnotu a lze jej použít uvnitř f-stringů, argumentů funkcí nebo list comprehensions:
> ```python
> print(f"Uživatel je {('aktivní' if user.is_active else 'neaktivní')}.")
> ```

---
<!-- slide: id4, Větvení „match-case“ (Strukturální pattern matching), WOW, pythonic -->
## Větvení „match-case“ (Python 3.10+)

Od verze **Python 3.10** (PEP 634/635/636) máme k dispozici **strukturální porovnávání vzorů** (*Structural Pattern Matching*).

Nejde o pouhý jednoduchý `switch` známý z C či Javy – `match-case` umí rozbalovat sekvence, slovníky i uživatelské objekty a validovat jejich typy:

```python
match prikaz:
    case "start":
        spust_server()
    case "stop":
        zastav_server()
    case "restart":
        restartuj()
    case _:
        # Zástupný symbol _ (wildcard) zachytí cokoliv jiného (obdoba default)
        print(f"Neznámý příkaz: {prikaz}")
```

> [!NOTE] Žádný `break` není potřeba!
> V Pythonu nedochází k propadávání větví (*fall-through*). Jakmile se shoduje první `case`, vykoná se jeho tělo a celý blok `match` končí.

---
<!-- slide: id5, Příklady na „match-case“ – dekonstrukce a stráže, WOW, pythonic -->
## Pokročilé vzory v „match-case“

Strukturální síla `match-case` se projeví při dekonstrukci datových struktur:

```python
# 1. Spojení vzorů operátorem | (nebo):
case 401 | 403 | 404:
    return "Chyba klienta"

# 2. Dekonstrukce n-tice s extrakcí proměnných:
match point:
    case (0, 0):
        print("Počátek souřadnic")
    case (x, 0):
        print(f"Bod na ose X s hodnotou x = {x}")
    case (0, y):
        print(f"Bod na ose Y s hodnotou y = {y}")
    case (x, y) if x == y:  # Podmíněná stráž (guard)
        print(f"Bod na diagonále: {x}")

# 3. Záchyt proměnného počtu prvků (*rest):
match command.split():
    case ["git", "checkout", branch]:
        print(f"Přepínám na větev {branch}")
    case ["git", "commit", "-m", *message_parts]:
        print("Commit zpráva:", " ".join(message_parts))
```

---
<!-- slide: id6, Cyklus „for-in“, Tricky, resyntax -->
## Cyklus „for-in“

V Pythonu neexistuje počítadlový cyklus typu `for (int i = 0; i < n; i++)` jako v C. Cyklus `for` v Pythonu je vždy **iterátorový průchod** přes iterovatelný objekt (*iterable*):

```python
for prvek in kolekce:
    zpracuj(prvek)
```

> [!WARNING] Scope proměnné cyklu (No Block-Scope)
> V Pythonu cykly **nevytvářejí vlastní lokální jmenný prostor** (*no block scope*).
> Proměnná cyklu zůstává po proběhnutí smyčky definovaná v okolním scope a zachovává si hodnotu z poslední iterace:
> ```python
> for x in [10, 20, 30]:
>     pass
>
> print(x)  # Vypíše 30!
> ```

---
<!-- slide: id7, Cyklus „for-in & range()“, Core, resyntax -->
## Cyklus „for-in & range()“

Potřebujeme-li v Pythonu klasický čítač nebo indexy, kombinujeme `for` s vestavěným generátorem `range()`:

```python
# range(stop) -> 0 až stop-1:
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# range(start, stop[, step]):
for i in range(10, 0, -2):
    print(i)  # 10, 8, 6, 4, 2
```

> [!TIP] Idiomatický Python: `enumerate()` a `zip()`
> Pokud potřebujete současně prvek i jeho index, nepoužívejte `range(len(xs))`, ale vestavěnou funkci **`enumerate()`**:
> ```python
> barvy = ["červená", "zelená", "modrá"]
> for idx, barva in enumerate(barvy, start=1):
>     print(f"{idx}. {barva}")
> ```
> Pro paralelní iteraci přes více kolekcí současně použijte **`zip()`**:
> ```python
> for jmeno, skore in zip(studenti, body):
>     print(f"{jmeno}: {skore}")
> ```

---
<!-- slide: id8, Cyklus „for-in-else“, Tricky, pythonic -->
## Cyklus „for-in-else“

Python nabízí unikátní syntaktickou konstrukci: větev **`else` za cyklem `for`**.

```python
for prvek in kolekce:
    if podminka(prvek):
        print("Prvek nalezen!")
        break
else:
    # Tento blok se vykoná POUZE tehdy, pokud cyklus proběhl celý
    # a NEBYL přerušen příkazem break!
    print("Prvek nebyl nalezen.")
```

### Proč je to užitečné?
Eliminuje potřebu pomocné logické proměnné (*flag variable*):
- Bez `else`: musíte před cyklem zavést `found = False`, v podmínce nastavit `found = True; break` a po cyklu testovat `if not found:`.
- S `else`: kód je kratší, přehlednější a odolnější vůči chybám.

---
<!-- slide: id9, Cyklus „while“ a Walrus operátor `:=`, WOW, pythonic -->
## Cyklus „while“ a Walrus operátor `:=`

Cyklus `while` opakuje blok kódu, dokud je vstupní podmínka pravdivá (*truthy*):

```python
pocitadlo = 5
while pocitadlo > 0:
    print(pocitadlo)
    pocitadlo -= 1
```

### Zkrácení kódu pomocí Walrus operátoru `:=` (Python 3.8+):
Umožňuje přiřadit hodnotu do proměnné přímo uvnitř podmínky:

```python
# Čtení ze vstupu nebo souboru bez duplikace čtecího příkazu:
while (radek := input("Zadej text (nebo 'exit'): ")) != "exit":
    print(f"Zadáno: {radek}")
```

Před Pythonem 3.8 bylo nutné načíst první hodnotu před cyklem a znovu na konci každé iterace (nebo použít nekonečný cyklus s `break`).

---
<!-- slide: id10, Cyklus „while-else“, Tricky, pythonic -->
## Cyklus „while-else“

Podobně jako u `for-else`, i cyklus `while` podporuje větev `else`:

```python
pokusy = 3
while pokusy > 0:
    heslo = input("Zadej heslo: ")
    if over_heslo(heslo):
        print("Přístup povolen!")
        break
    pokusy -= 1
else:
    # Vykoná se pouze tehdy, když podmínka (pokusy > 0) přestala platit
    # a cyklus NEBYL ukončen přes break!
    print("Vyčerpán maximální počet pokusů. Účet zablokován.")
```

Větev `else` se přeskočí v okamžiku, kdy je smyčka opuštěna příkazem `break`.

---
<!-- slide: id11, Konstrukce „do-while“ a „repeat-until“, Skip, resyntax -->
## Emulace „do-while“ a „repeat-until“

Python nemá dedikovaná klíčová slova `do ... while` ani `repeat ... until`. Tyto konstrukce se v Pythonu idiomaticky zapisují nekonečným cyklem `while True:` s podmíněným příkazem `break`:

```python
# Emulace do-while: tělo cyklu se provede alespoň jednou
while True:
    akce = ziskej_uzivatelsky_prikaz()
    zpracuj_akci(akce)
    
    # Podmínka pro ukončení na konci cyklu:
    if not chtit_pokracovat():
        break
```

Tento zápis je v Pythonu považován za zcela standardní a idiomatický, protože jednoznačně umisťuje test ukončení na konec těla smyčky.

---
<!-- slide: id12, Řízení smyčky – „continue“ a „break“, Skip, basics -->
## Řízení smyčky – „continue“ a „break“

Pro přímé řízení toku uvnitř cyklů slouží dva příkazy:

- **`continue`**: Okamžitě ukončí aktuální iteraci a přejde na vyhodnocení podmínky pro následující iteraci cyklu.
- **`break`**: Okamžitě ukončí celý cyklus a pokračuje prvním příkazem za tělem cyklu (přičemž přeskočí případnou větev `else`).

```python
for cislo in range(1, 10):
    if cislo % 2 == 0:
        continue  # Přeskoč sudá čísla
    if cislo > 7:
        break     # Ukonči cyklus, jakmile narazíš na číslo větší než 7
    print(cislo)  # Vypíše: 1, 3, 5, 7
```

---
<!-- slide: id13, Výjimky „try-except“ I, Core, basics -->
## Ošetření chyb: Blok „try-except“

Běhové chyby v Pythonu nevytvářejí chybové kódy (jako návratové hodnoty v C), nýbrž vyvolávají **výjimky** (*exceptions*):

```python
try:
    hodnota = int(vstup_od_uzivatele)
    vysledek = 100 / hodnota
except ValueError:
    print("Vstup není platné celé číslo!")
except ZeroDivisionError:
    print("Nelze dělit nulou!")
```

> [!CAUTION] Vyvarujte se holého `except:`
> Nikdy nepište samotný `except:` bez specifikace třídy výjimky!
> ```python
> # ŠPATNĚ: zachytí i KeyboardInterrupt (Ctrl+C) nebo SystemExit!
> try:
>     ...
> except:
>     pass
> 
> # SPRÁVNĚ: zachytávejte pouze konkrétní výjimku, nebo nanejvýš `except Exception:`
> ```

---
<!-- slide: id14, Výjimky „try-except“ II – objekt a skupiny, Core, basics -->
## Práce s objektem výjimky

Výjimku lze zachytit jako instanci a vypsat její detailní chybovou zprávu:

```python
try:
    with open("neexistujici_soubor.txt", encoding="utf-8") as f:
        obsah = f.read()
except FileNotFoundError as err:
    print(f"Chyba: Soubor nebyl nalezen ({err})")
    print(f"Chybový kód OS: {err.errno}")
```

### Odchycení více výjimek najednou:
Pokud na více různých chyb chceme reagovat stejným způsobem, zabalíme je do n-tice:

```python
try:
    provadeni_site()
except (ConnectionError, TimeoutError) as err:
    logger.warning("Síťové spojení selhalo: %s", err)
```

---
<!-- slide: id15, Vyvolání výjimek „raise & assert“, Core, resyntax -->
## Vyvolání výjimek „raise“ a „assert“

Pro explicitní signalizaci chyby slouží příkaz `raise`:

```python
def nastav_vek(vek: int) -> None:
    if vek < 0:
        raise ValueError(f"Věk nemůže být záporný: {vek}")
```

### Řetězení výjimek (*Exception Chaining* - PEP 3134):
Při přeposílání výjimky použijte `raise ... from ...`, aby se zachoval původní kontext chyby:
```python
try:
    konfigurace = parse_json(raw_data)
except json.JSONDecodeError as err:
    raise ConfigError("Chybný formát konfiguračního souboru") from err
```

> [!WARNING] Pozor na `assert` v produkci
> Příkaz `assert podminka, "zprava"` slouží pouze pro interní ladění a testy.
> Pokud spustíte Python s přepínačem optimalizace `python -O`, interpret všechny příkazy `assert` **z kódu zcela odstraní**. Nikdy jej nepoužívejte pro validaci uživatelských vstupů!

---
<!-- slide: id16, Výjimky „try-except-else“, Core, basics -->
## Větev „else“ v bloku „try“

Větev `else` se provede pouze v případě, že kód v bloku `try` **proběhl úspěšně bez vyvolání jakékoliv výjimky**:

```python
try:
    soubor = open("data.txt", "r", encoding="utf-8")
except OSError as err:
    print(f"Soubor se nepodařilo otevřít: {err}")
else:
    # Bezpečné místo pro zpracování dat – víme, že otevření proběhlo v pořádku:
    try:
        data = soubor.read()
        zpracuj(data)
    finally:
        soubor.close()
```

Pomáhá dodržet zásadu: *v bloku `try` mějte pouze ten kód, který skutečně může vyvolat očekávanou výjimku*.

---
<!-- slide: id17, Čištění zdrojů „finally“, Core, basics -->
## Garance úklidu: Blok „finally“

Kód v bloku `finally` se provede **vždy** – bez ohledu na to, zda kód v `try` skončil úspěšně, vyvolal odchycenou výjimku, neodchycenou výjimku, nebo zda blok opustil příkazem `return`!

```python
def odesli_pozadavek():
    spojeni = navaz_spojeni()
    try:
        spojeni.odesli_data()
        return "Úspěch"
    except NetworkError:
        return "Chyba sítě"
    finally:
        # Tento kód se provede VŽDY, i před návratem z funkce přes 'return'!
        spojeni.uzavri()
```

> [!TIP] Moderní alternativa: Context Managery
> Ve většině praktických případů je čistší nahradit `finally` příkazem `with` (správce kontextu), který uzavření souborů a síťových spojení zajistí automaticky.

---
<!-- slide: id18, Kompletní blok „try-except-else-finally“, Core, basics -->
## Kompletní blok „try-except-else-finally“

Všechny části lze logicky spojit do jednoho celku:

```python
#!/usr/bin/env python3
import sys

def precti_cislo() -> float | None:
    try:
        text = input("Zadejte kladné číslo: ")
        cislo = float(text)
        if cislo <= 0:
            raise ValueError("Číslo musí být kladné!")
    except (EOFError, KeyboardInterrupt):
        print("\nVstup byl přerušen uživatelem.")
        return None
    except ValueError as err:
        print(f"Neplatná hodnota: {err}")
        return None
    else:
        print(f"Úspěšně zadáno číslo: {cislo}")
        return cislo
    finally:
        print("Ukončeno čtení vstupu.")
```

Pořadí vyhodnocení:
1. Vykoná se `try`.
2. Pokud nastala výjimka, vykoná se odpovídající `except`.
3. Pokud nenastala výjimka, vykoná se `else`.
4. V každém myslitelném případě se na závěr vykoná `finally`.

---
<!-- slide: id19, Definice funkcí „def“ a typové anotace, Core, basics -->
## Definice funkcí pomocí „def“

Funkce v Pythonu jsou objekty první kategorie (*First-Class Objects*). Lze je přiřazovat do proměnných, předávat jako argumenty jiným funkcím a vracet z funkcí.

```python
def pozdrav(jmeno: str, pozdrav: str = "Ahoj") -> str:
    """Vrátí formátovaný pozdrav pro zadané jméno.
    
    :param jmeno: Jméno osoby k pozdravení
    :param pozdrav: Použitý pozdrav (výchozí: 'Ahoj')
    :return: Kompletní textová zpráva
    """
    return f"{pozdrav}, {jmeno}!"
```

### Moderní Python 3.12+ standardy:
- **Typové anotace** (`type hints`): specifikují očekávané typy argumentů a návratové hodnoty. Jsou kontrolovány statickými nástroji (Mypy, Pyright/VS Code).
- **Docstring**: dokumentační řetězec uzavřený do trojitých uvozovek `"""`, dostupný přes `pozdrav.__doc__` nebo `help(pozdrav)`.

---
<!-- slide: id20, Argumenty funkcí a návratové hodnoty, Core, pythonic -->
## Argumenty a návratové hodnoty funkcí

Python nabízí mimořádně flexibilní model předávání argumentů:

```python
def vypocet(zaklad: float, exponent: int = 2) -> tuple[float, int, float]:
    """Vrátí n-tici: (základ, exponent, výsledek mocnění)."""
    return zaklad, exponent, zaklad ** exponent

# Rozbalení návratové n-tice pomocí hvězdičky:
*vstupy, vysledek = vypocet(2.0, 3)
print(f"Vstupy: {vstupy}, Výsledek: {vysledek}")
# Výstupy: Vstupy: [2.0, 3], Výsledek: 8.0
```

### Typy parametrů:
- **`*args`**: shromáždí libovolný počet přebytečných pozičních argumentů do n-tice `tuple`.
- **`**kwargs`**: shromáždí libovolný počet pojmenovaných argumentů do slovníku `dict`.
- **`/` (pos-only)** a **`*` (kw-only)** (Python 3.8+):
  ```python
  def f(jen_pozicne, /, standardni, *, jen_jmenem):
      ...
  ```
