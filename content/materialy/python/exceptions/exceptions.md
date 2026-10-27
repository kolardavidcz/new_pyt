<!-- slide: id1, Úvod do výjimek a EAFP, Core, basics -->
## Výjimky v Pythonu a filozofie EAFP

V Pythonu se veškeré chyby a nestandardní stavy za běhu programu řeší prostřednictvím **výjimek** (*exceptions*). Pokud nastane chyba, interpret vytvoří objekt výjimky a začne jej předávat nahoru po zásobníku volání:

```python
# Typické běhové chyby v interpretu:
10 * (1 / 0)     # ZeroDivisionError: division by zero
"text"[99]       # IndexError: string index out of range
int("necislo")   # ValueError: invalid literal for int()
{"a": 1}["b"]    # KeyError: 'b'
```

### Filozofie návrhu: EAFP vs. LBYL
- **LBYL** (*Look Before You Leap* – typické pro C): Neustále předem testujeme podmínky (`if (ptr != NULL)`).
- **EAFP** (*Easier to Ask for Forgiveness than Permission* – idiomatický Python): Zkusíme operaci provést a případnou chybu odchytíme. Tento přístup je v Pythonu rychlejší a zabraňuje souběhům (*race conditions*).

> [!NOTE] Diagnostika v Pythonu 3.11+ (PEP 657)
> Od verze Python 3.11 obsahuje chybový výpis (*traceback*) přesné zvýraznění konkrétního výrazu na řádku:
> ```text
> Traceback (most recent call last):
>   File "priklad.py", line 4, in <module>
>     vysledek = data["uzivatel"]["adresa"]["mesto"]
>                ~~~~~~~~~~~~~~~~^^^^^^^^^^
> KeyError: 'adresa'
> ```

---
<!-- slide: id2, Anatomie bloku try - except - else - finally, Core, resyntax -->
## Anatomie bloku `try - except - else - finally`

Robustní ošetření chyb v Pythonu sestává až ze čtyř klíčových větví:

```python
try:
    # 1. Kód, který může vyvolat výjimku
    soubor = open("data.txt", "r", encoding="utf-8")
    radek = soubor.readline()
    cislo = int(radek.strip())
except FileNotFoundError as err:
    # 2. Odchycení konkrétní výjimky se získáním reference na objekt chyby
    print(f"Soubor nebyl nalezen: {err}")
except ValueError:
    # 3. Odchycení jiného typu chyby
    print("První řádek neobsahuje platné celé číslo!")
else:
    # 4. Spustí se POUZE tehdy, pokud v bloku try NEDOŠLO k žádné výjimce
    print(f"Úspěšně načteno číslo: {cislo}")
finally:
    # 5. Spustí se VŽDY (při úspěchu, po výjimce i při předčasném returnu)
    print("Úklid dokončen.")
```

> [!TIP] Proč používat větev else?
> Kód ve větvi `else` zamezuje nechtěnému zachycení výjimky, která nevznikla v hlídané části `try`. V `try` bloku by mělo být pouze minimum kódu, který reálně může danou výjimku vyvolat.

---
<!-- slide: id3, Praktický příklad ošetření vstupu, Core, basics -->
## Praktický příklad: Zpracování uživatelského vstupu

Ukázka bezpečného načtení čísla z terminálu s ošetřením přerušení klávesnicí (`Ctrl+C`):

```python
def nacti_vek() -> int | None:
    try:
        raw = input("Zadejte svůj věk: ")
        vek = int(raw)
        if vek < 0:
            raise ValueError("Věk nemůže být záporné číslo.")
    except ValueError as err:
        print(f"Chybný vstup: {err}")
        return None
    except (KeyboardInterrupt, EOFError):
        print("\nOperace byla přerušena uživatelem.")
        return None
    else:
        print(f"Věk úspěšně zadán: {vek}")
        return vek
    finally:
        print("Kontrola vstupu dokončena.")
```

---
<!-- slide: id4, Více výjimek v jedné větvi except, Core, pythonic -->
## Seskupení více výjimek do jedné větve

Pokud různé chyby vyžadují stejnou reakci, můžeme jejich typy předat jako **n-tici**:

```python
try:
    hodnota = int(data[klic])
except (KeyError, IndexError, ValueError) as err:
    print(f"Neplatná hodnota pro klíč '{klic}': {err}")
    hodnota = 0
```

> [!WARNING] Historický relikt z Pythonu 2
> V pradávném Pythonu 2 se syntaxe `except ValueError, err:` používala pro uložení výjimky do proměnné.
> V moderním Pythonu 3 se n-tice píše striktně do závorek `except (E1, E2):` a pojmenování se provádí klíčovým slovem `as err`.

---
<!-- slide: id5, Nebezpečí holého except a zachytávání Exception, Tricky, paradigm -->
## Antipattern „holého“ except

Nikdy v produkčním kódu nepoužívejte prázdné klíčové slovo `except:` bez uvedení typu výjimky:

```python
# ❌ KATASTROFÁLNÍ ANTIPATTERN:
try:
    provadeni_vypoctu()
except:
    pass  # Polkne i stisk Ctrl+C (KeyboardInterrupt) nebo sys.exit()!
```

### Proč je holé `except:` nebezpečné?
Holé `except:` odchytí i systémové výjimky `KeyboardInterrupt` (uživatel nemůže program ukončit stiskem Ctrl+C) a `SystemExit`.

### Správný přístup pro zachycení všech běžných chyb:
Pokud opravdu potřebujete zachytit jakoukoliv chybu aplikace, odchytávejte bázovou třídu **`Exception`**:

```python
# ✅ SPRÁVNĚ: Zachytí všechny aplikační chyby, ale propustí Ctrl+C a sys.exit()
try:
    provadeni_vypoctu()
except Exception as err:
    logger.error(f"Neočekávaná chyba aplikace: {err}", exc_info=True)
```

---
<!-- slide: id6, Vyvolání výjimky a Exception Chaining, Core, resyntax -->
## Vyvolání výjimky: `raise` a řetězení chyb

Výjimku vyvoláváme příkazem `raise` s instancí chybové třídy:

```python
if zustatek < castka:
    raise ValueError(f"Nedostatečný zůstatek na účtu: {zustatek} < {castka}")
```

### Znovuvyvolání výjimky (*Re-raise*)
Uvnitř bloku `except` můžeme původní chybu po částečném zalogování poslat dál prostým `raise`:

```python
try:
    odesli_platbu()
except ConnectionError:
    logger.warning("Platba selhala, posílám výjimku dál.")
    raise
```

### Řetězení výjimek (*Exception Chaining*, PEP 3134)
V moderním Pythonu můžeme zabalit nízkoúrovňovou výjimku do doménové pomocí klauzule **`from`**:

```python
try:
    db.connect()
except OSError as err:
    # Zachová původní traceback jako příčinu (__cause__)
    raise DatabaseConnectionError("Nelze se spojit s DB") from err
```

Pokud chceme původní traceback zcela potlačit: `raise MojeChyba() from None`.

---
<!-- slide: id7, Objekt výjimky a metoda add_note(), Core, newconcept -->
## Objekt výjimky a obohacování kontextu (`add_note()`)

Objekt výjimky nese bohaté diagnostické informace:
- `err.args`: N-tice předaných argumentů.
- `err.__cause__`: Původní příčina při řetězení (`from err`).
- `err.__traceback__`: Objekt zásobníku volání.

### Novinka v Pythonu 3.11: `err.add_note()` (PEP 678)
Od Pythonu 3.11 můžeme k běžící výjimce přidávat libovolné diagnostické poznámky bez nutnosti měnit její zprávu:

```python
try:
    zpracuj_fakturu(faktura_id=4501)
except Exception as err:
    err.add_note(f"Chyba nastala při zpracování klienta ID: {klient_id}")
    err.add_note("Timestamp: 2026-10-27T14:00:00Z")
    raise
```

Poznámky se automaticky přehledně zobrazí v patičce tracebacku.

---
<!-- slide: id8, Hierarchie standardních výjimek v Pythonu, WOW, paradigm -->
## Hierarchie standardních výjimek

Všechny výjimky v Pythonu tvoří striktní objektovou hierarchii dědičnosti:

```text
BaseException (Kořenový předek všech systémových stavů)
 ├── SystemExit (sys.exit())
 ├── KeyboardInterrupt (Ctrl+C)
 ├── GeneratorExit (uzavření generátoru)
 ├── BaseExceptionGroup (Python 3.11+)
 └── Exception (Bázová třída pro VŠECHNY běžné aplikační chyby)
      ├── ArithmeticError
      │    ├── ZeroDivisionError
      │    └── OverflowError
      ├── LookupError
      │    ├── IndexError (mimo meze sekvence)
      │    └── KeyError (klíč nenalezen ve slovníku)
      ├── OSError (Chyby operačního systému, I/O a sítě)
      │    ├── FileNotFoundError
      │    ├── PermissionError
      │    ├── TimeoutError
      │    └── ConnectionError
      ├── ValueError (Správný typ, neplatná hodnota)
      │    └── UnicodeDecodeError
      ├── TypeError (Operace aplikována na nekompatibilní typ)
      ├── AttributeError (Objekt nemá požadovaný atribut)
      └── ExceptionGroup (Python 3.11+, souběžné výjimky)
```

---
<!-- slide: id9, Pozor na pořadí bloků except!, Tricky, paradigm -->
## Pozor na pořadí bloků `except`!

Při odchytávání výjimek vyhodnocuje Python větve `except` **shora dolů** a aktivuje první větev, jejíž třídě zachycená výjimka odpovídá (`isinstance`):

```python
# ❌ CHYBA: Obecnější předek ArithmeticError spolkne potomka ZeroDivisionError!
try:
    vysledek = 10 / 0
except ArithmeticError:
    print("Obecná aritmetická chyba")
except ZeroDivisionError:
    print("Dělení nulou")  # SEM SE BĚH NIKDY NEDOSTANE!
```

### Správné pravidlo:
**Specifické potomky vždy uvádějte jako první**, obecné předky až na konci:

```python
# ✅ SPRÁVNĚ: Od nejužší po nejobecnější
try:
    vysledek = 10 / 0
except ZeroDivisionError:
    print("Zachyceno specifické dělení nulou.")
except ArithmeticError:
    print("Ostatní aritmetické chyby.")
```

---
<!-- slide: id10, Atributy specifických výjimek, Skip, newconcept -->
## Bohaté atributy specializovaných výjimek

Odvozené výjimky standardní knihovny často nesou specializované atributy usnadňující diagnostiku:

```python
try:
    with open("neexistujici.txt", "r") as f:
        f.read()
except FileNotFoundError as err:
    print(f"Chybový kód OS (errno): {err.errno}")
    print(f"Název chybějícího souboru: {err.filename}")
    print(f"Systémová zpráva: {err.strerror}")
```

Podobně například `UnicodeDecodeError` obsahuje atributy `encoding`, `object`, `start`, `end` a `reason`.

---
<!-- slide: id11, Knihovní a síťové výjimky, Skip, basics -->
## Výjimky v knihovnách standardní distribuce

Mnoho modulů definuje vlastní hierarchie chyb:

```python
import json
import urllib.error

# Chyba parsování JSONu
try:
    data = json.loads("{neplatny_json}")
except json.JSONDecodeError as err:
    print(f"Chyba JSON na řádku {err.lineno}, pozici {err.colno}: {err.msg}")

# Chyba HTTP komunikace
try:
    # urllib operace
    pass
except urllib.error.HTTPError as err:
    print(f"HTTP stavový kód: {err.code}")
except urllib.error.URLError as err:
    print(f"Chyba sítě/DNS: {err.reason}")
```

---
<!-- slide: id12, Tvorba vlastních doménových výjimek, Core, newconcept -->
## Tvorba vlastních doménových výjimek

Vlastní výjimky v aplikaci by měly vždy dědit ze třídy **`Exception`** (nikdy přímo z `BaseException`):

```python
class BankError(Exception):
    """Bázová výjimka pro všechny bankovní operace."""
    pass

class InsufficientFundsError(BankError):
    """Vyvolána při pokusu o výběr částky převyšující zůstatek."""
    def __init__(self, account_id: str, balance: float, amount: float) -> None:
        super().__init__(f"Účet {account_id}: zůstatek {balance} nestačí na výběr {amount}")
        self.account_id = account_id
        self.balance = balance
        self.amount = amount

# Použití:
try:
    raise InsufficientFundsError("CZ12345", 500.0, 1200.0)
except BankError as err:
    print(f"Bankovní transakce selhala: {err}")
```

---
<!-- slide: id13, Příkaz assert a ladění, Core, resyntax -->
## Příkaz `assert` v Pythonu

Příkaz `assert` slouží k interní kontrole neporušenosti stavu programu během vývoje a ladění:

```python
assert podminka, "Zpráva při selhání"
```

Ekvivalentní kód:
```python
if __debug__:
    if not podminka:
        raise AssertionError("Zpráva při selhání")
```

> [!CAUTION] Vypnutí assertů v produkci (-O)
> Pokud Python spustíte s přepínačem optimalizace `python -O skript.py`, vestavěná proměnná `__debug__` se nastaví na `False` a **všechny příkazy `assert` jsou interpretrem zcela vynechány**!
> Proto **nikdy nepoužívejte `assert` k validaci uživatelských dat, oprávnění nebo bezpečnostních kontrol**!

---
<!-- slide: id14, Časté syntaktické pasti u příkazu assert, Skip, basics -->
## Záludná past se závorkami u `assert`

Nejčastější chybou začátečníků je zápis podmínky a zprávy do kulatých závorek jako u funkce:

```python
# ❌ KRITICKÁ CHYBA: Závorky vytvoří neprázdnou n-tici (tuple)!
x = -5
assert (x > 0, "Číslo musí být kladné!")
# Výraz (False, "Zpráva") je neprázdná n-tice, a ta je VŽDY pravdivá (Truthy)!
# Tento assert NIKDY neselže!

# ✅ SPRÁVNÝ ZÁPIS: Bez vnějších závorek (odděleno čárkou)
assert x > 0, "Číslo musí být kladné!"
# AssertionError: Číslo musí být kladné!
```

---
<!-- slide: id15, Kdy assert používat, Skip, basics -->
## Kdy je `assert` vhodný?

1. **Vnitřní invarianty kódu**: Kontrola stavů, které za běhu správně napsaného programu nikdy nemohou nastat.
2. **Post-condition kontroly**: Ověření návratové hodnoty složitého algoritmu.
3. **Při psaní unit testů** v knihovně `pytest`.

```python
def vypocet_pravdepodobnosti(udalost: str) -> float:
    p = model.predict(udalost)
    # Interní kontrola matematického invariantu
    assert 0.0 <= p <= 1.0, f"Interní chyba: pravděpodobnost mimo meze: {p}"
    return p
```

---
<!-- slide: id16, Validace typů: assert vs. Type Hints a Pydantic, Tricky, paradigm -->
## Kontrola typů: Od `assert` k Type Hints a Pydantic

V historickém Pythonu se typy kontrolovaly manuálně přes `assert isinstance(...)`:

```python
# 📜 Zastaralý přístup:
def secti(a, b):
    assert isinstance(a, int) and isinstance(b, int), "Pouze celá čísla!"
    return a + b
```

### Moderní standard v Pythonu 3.12+:
1. **Statické typové anotace** (kontrolovány nástroji Mypy / Pyright / IDE):
   ```python
   def secti(a: int, b: int) -> int:
       return a + b
   ```
2. **Běhová validace dat** (pomocí populární knihovny `pydantic` pro vstupy z API/webu):
   ```python
   from pydantic import BaseModel, PositiveInt

   class Uzivatel(BaseModel):
       id: PositiveInt
       jmeno: str
   ```

---
<!-- slide: id17, Varování (warnings) a Exception Groups (Python 3.11+), Skip, newconcept -->
## Varování (`warnings`) a `ExceptionGroup`

Kromě výjimek disponuje Python modulem **`warnings`** pro nefatální upozornění na zastaralá rozhraní:

```python
import warnings

def stara_funkce():
    warnings.warn(
        "Funkce stara_funkce() je zastaralá, použijte nova_funkce()",
        DeprecationWarning,
        stacklevel=2,
    )
```

### Moderní novinka: `ExceptionGroup` a `except*` (Python 3.11+)
Při paralelním běhu úloh (např. v `asyncio.TaskGroup`) může selhat více operací současně. Python 3.11 zavedl skupinové výjimky:

```python
try:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(stahuj_a())
        tg.create_task(stahuj_b())
except* ConnectionError as eg:
    print(f"Síťové chyby: {eg.exceptions}")
except* ValueError as eg:
    print(f"Chyby hodnot: {eg.exceptions}")
```
