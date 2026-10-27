<!-- slide: id1, Úvod, Core, newconcept -->
## Mikrobenchmarky v Pythonu: Modul `timeit`

Měření doby běhu malých úseků kódu (mikrobenchmarky) je plné nástrah:
- Rozlišení hodin operačního systému a výkyvy systémového času.
- Režijní náklady samotného měření a spouštění časovače.
- Rušivé vlivy na pozadí (přepínání kontextu procesů, *Garbage Collector*, změny taktovací frekvence CPU).

Vestavěný modul **`timeit`** řeší tyto problémy systematicky:
1. Používá nejvýkonnější hardwarový monotónní čítač s vysokým rozlišením (**`time.perf_counter`**).
2. Spouští měřený kód v těsné smyčce mnohotisíckrát (např. $1\,000\,000\times$), aby eliminoval režií měřiče.
3. Během měření ve výchozím stavu vypíná Garbage Collector (*GC*), aby získal deterministické výsledky.

```python
import timeit
```

---
<!-- slide: id2, Zavedení, Core, pythonic -->
## Základní použití modulu `timeit`

Nejčistší způsob použití představuje třída **`timeit.Timer`**:

```python
import timeit

# 1. Příprava měřiče (měřený kód a inicializační setup):
timer = timeit.Timer(
    stmt="[x ** 2 for x in data]",
    setup="data = list(range(1000))"
)

# 2. Opakované měření v několika dávkách:
vysledky = timer.repeat(repeat=5, number=1000)

# 3. Zásada: Vždy bereme MINIMÁLNÍ čas!
nejlepsi_cas = min(vysledky) / 1000
print(f"Čas na jeden průchod: {nejlepsi_cas * 1e6:.2f} µs")
```

> [!NOTE]
> **Proč minimum a ne průměr?**
> V benchmarkingu nemůže být kód náhodně rychlejší, než kolik dovoluje hardware. Může však být kdykoliv zpomalen operačním systémem (přerušení, stránkování paměti, jiné procesy). Nejnižší naměřený čas proto nejlépe odpovídá skutečnému výkonu bez vnějšího rušení.

---
<!-- slide: id3, Třída „Timer“, Core, basics -->
## Třída `timeit.Timer` a předávání kontextu

Předpis konstruktoru:

```python
timeit.Timer(stmt="pass", setup="pass", timer=time.perf_counter, globals=None)
```

- **`stmt`**: Měřený kód (řetězec nebo volatelný objekt `callable`).
- **`setup`**: Kód pro přípravu proměnných a importů, který **není započítáván do měřeného času**.
- **`globals=globals()`** (od Pythonu 3.5+): Umožňuje předat globální jmenný prostor, takže v `setup` nemusíme znovu složitě importovat funkce ze stejného souboru!

```python
import timeit

def moje_funkce(n: int) -> int:
    return sum(range(n))

# Měření existující funkce bez nutnosti textového setupu:
t = timeit.Timer(lambda: moje_funkce(1000))
print(f"Čas: {min(t.repeat(3, 1000)) / 1000 * 1e6:.2f} µs")
```

---
<!-- slide: id4, Metody „timeit()“ a „repeat()“, Tricky, pythonic -->
## Měřící metody: `timeit()` vs. `repeat()`

- **`timer.timeit(number=1_000_000)`**:
  - Provede `setup` jednou a následně spustí `stmt` přesně `number`-krát.
  - Vrací **celkový kumulativní čas v sekundách** pro všech `number` opakování dohromady.
- **`timer.repeat(repeat=5, number=1_000_000)`**:
  - Zavolá metodu `timeit(number)` celkem `repeat`-krát.
  - Vrací seznam časů: `[cas1, cas2, cas3, cas4, cas5]`.

```python
import timeit

# Rychlé jednorázové změření (např. v REPL):
cas = timeit.timeit("'-'.join(str(n) for n in range(100))", number=10_000)
print(f"10 000 opakování trvalo: {cas:.4f} s")
```

---
<!-- slide: id5, Příklad, WOW, paradigm -->
## Praktický příklad: Spojování řetězců (Lepené `+` vs. `join`)

Klasická otázka výkonu: Proč je operátor `+` v cyklu pomalejší než `''.join()`?

```python
import timeit

setup = "polozky = [str(i) for i in range(1000)]"

# Varianta A: Postupné přičítání v cyklu (přealokace neměnného řetězce):
stmt_plus = """
s = ''
for x in polozky:
    s += x
"""

# Varianta B: Idiomatické spojení pomocí str.join():
stmt_join = "''.join(polozky)"

t_plus = min(timeit.Timer(stmt_plus, setup).repeat(5, 1000))
t_join = min(timeit.Timer(stmt_join, setup).repeat(5, 1000))

print(f"Cyklus s +=: {t_plus * 1000:.2f} ms")
print(f"Metoda join: {t_join * 1000:.2f} ms ({t_plus / t_join:.1f}× rychlejší)")
```

> [!NOTE]
> V CPythonu existuje optimalizace pro lokální proměnné, kdy `s += x` může modifikovat řetězec na místě, pokud je čítač referencí roven 1. Jakmile je však řetězec atributem třídy (`self.s += x`), čítač referencí je vyšší a CPython musí alokovat nový řetězec v každém kroku ($O(N^2)$ složitost).

---
<!-- slide: id6, Měření a GC, Tricky, newconcept -->
## Vliv Garbage Collectoru (GC) na měření

Při měření paměťově náročných operací (např. vytváření velkého množství dočasných objektů) může běh Garbage Collectoru způsobit zdánlivou nepředvídatelnost měření.

`timeit` ve výchozím stavu GC vypíná. Pokud chcete měřit reálný dopad včetně práce správce paměti, povolte GC v `setup`:

```python
import timeit

# Zapnutí Garbage Collectoru v rámci měření:
t = timeit.Timer(
    stmt="[list(range(100)) for _ in range(1000)]",
    setup="import gc; gc.enable()"
)
```

---
<!-- slide: id7, Výpis případné chyby, Skip, basics -->
## Diagnostika chyb v měřeném kódu: `print_exc()`

Pokud v měřeném kódu uvnitř `timeit` dojde k neošetřené výjimce, metoda **`print_exc()`** vypíše přesnou lokalizaci chyby v kontextu měřeného řetězce:

```python
import timeit

t = timeit.Timer("1 / x", "x = 0")

try:
    t.timeit(number=1)
except ZeroDivisionError:
    t.print_exc()
```

---
<!-- slide: id8, Ovládání z příkazové řádky, WOW, pythonic -->
## Měření z příkazové řádky a v Jupyteru

Modul `timeit` lze spustit přímo z terminálu jako CLI nástroj:

```bash
# 1. Porovnání generátoru seznamu vs. for cyklu s append:
python -m timeit "[x for x in range(100)]"
# 100000 loops, best of 5: 3.21 usec per loop

python -m timeit -s "xs = []" "for x in range(100): xs.append(x)"
# 50000 loops, best of 5: 6.84 usec per loop

# 2. Specifikace počtu opakování (-n) a počtu běhů (-r):
python -m timeit -n 10000 -r 5 "dict.fromkeys(range(50))"
```

> [!TIP]
> **V Jupyter Notebooku / IPython**:
> - Řádkový magický příkaz: `%timeit [x**2 for x in range(1000)]`
> - Buňkový magický příkaz: `%%timeit` na začátku celé buňky notebooku.
