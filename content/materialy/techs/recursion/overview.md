<!-- lecture: title="Rekurze – princip a limity" slug="materialy--techs--recursion--overview" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod

**Rekurze** je programátorská technika, při které funkce volá samu sebe za účelem rozkladu složitého problému na jednodušší podproblémy stejného typu.

Klasickým matematickým příkladem je výpočet faktoriálu:
$$
n! = n \times (n-1)!
$$

Výpočet postupuje tak dlouho, dokud nenarazí na tzv. **bázi (kotvu) rekurze**, kde je výsledek znám přímo bez dalšího volání (pro $n \le 1$ platí $n! = 1$).

---

<!-- slide: id=id2 title="Rekurze s jednou větví – faktoriál" tags="Core" diff="resyntax" -->
## Rekurze s jednou větví – faktoriál

Přímočará implementace v Pythonu:

```python
def faktorial(n: int) -> int:
    # Kotva rekurze (ukončující podmínka):
    if n <= 1:
        return 1
    # Rekurzivní krok:
    return n * faktorial(n - 1)

print(faktorial(5))   # 120
print(faktorial(15))  # 1307674368000
```

> [!IMPORTANT]
> **Kotva rekurze je naprosto kritická!**
> Pokud zapomenete ukončující podmínku nebo se k ní parametry nepřibližují, funkce se zacyklí v nekonečné rekurzi.

---

<!-- slide: id=id3 title="Graf průběhu výpočtu" tags="Core" diff="basics" -->
## Graf průběhu výpočtu

Při lineární rekurzi (jako je faktoriál) tvoří volání lineární řetězec:

```text
faktorial(4)
  -> 4 * faktorial(3)
    -> 3 * faktorial(2)
      -> 2 * faktorial(1)
        -> vrací 1
      -> vrací 2 * 1 = 2
    -> vrací 3 * 2 = 6
  -> vrací 4 * 6 = 24
```

Každé vnořené volání se ukládá na **zásobník volání (*Call Stack*)** a čeká na návratovou hodnotu z hlubší úrovně.

---

<!-- slide: id=id4 title="Rekurze se dvěma větvemi – n-tý člen Fibonacciho posloupnosti" tags="Core" diff="basics" -->
## Rekurze se dvěma větvemi – Fibonacciho posloupnost

Výpočet $n$-tého členu Fibonacciho posloupnosti, kde každý člen je součtem dvou předchozích:
$$
F(0) = 0, \quad F(1) = 1, \quad F(n) = F(n-1) + F(n-2)
$$

```python
def fib(n: int) -> int:
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print([fib(n) for n in range(11)])
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

V tomto zápisu každé volání vyvolá **dvě nová rekurzivní volání**!

---

<!-- slide: id=id5 title="Graf průběhu výpočtu stromu volání" tags="Tricky" diff="newconcept" -->
## Graf průběhu výpočtu stromu volání

Strom volání pro pouhé `fib(5)` exponenciálně bobtná:

```text
                    fib(5)
            /                    \
        fib(4)                  fib(3)
       /      \                /      \
   fib(3)    fib(2)        fib(2)    fib(1)
   /    \    /    \        /    \
fib(2) f(1) f(1)  f(0)   f(1)  f(0)
```

Všimněte si: `fib(3)` se počítá dvakrát, `fib(2)` třikrát a `fib(1)` dokonce pětkrát! Pro větší $n$ dochází k astronomickému plýtvání výpočetním výkonem.

---

<!-- slide: id=id6 title="Lineární a iterativní alternativa" tags="WOW" diff="pythonic" -->
## Lineární a iterativní alternativa

Místo naivní stromové rekurze můžeme Fibonacciho posloupnost spočítat v lineárním čase $O(n)$ a s konstantní pamětí $O(1)$:

### 1. Iterativní řešení cyklem (nejrychlejší):
```python
def fib_iter(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

### 2. Lineární koncová rekurze s akumulátorem:
```python
def fib_tail(n: int, a: int = 0, b: int = 1) -> int:
    if n == 0:
        return a
    return fib_tail(n - 1, b, a + b)
```

---

<!-- slide: id=id7 title="Paměťová náročnost a `RecursionError`" tags="Tricky" diff="newconcept" python="3.12+" -->
## Paměťová náročnost a `RecursionError`

Při každém volání funkce v Pythonu musí interpret alokovat nový **rámec zásobníku (*stack frame*)** obsahující lokální proměnné, parametry a návratovou adresu.

Aby nedošlo k přetečení systémové paměti C-stacku (*stack overflow*), má CPython striktní bezpečnostní limit:

```python
import sys
print(sys.getrecursionlimit())  # Standardně 1000
```

Při překročení limitu Python vyvolá výjimku:
```python
# RecursionError: maximum recursion depth exceeded
```

Limit lze sice navýšit přes `sys.setrecursionlimit(5000)`, ale rekurzivní hloubky nad několik tisíc volání je bezpečnější přepsat na iterativní cyklus nebo explicitní zásobník (`collections.deque`).

---

<!-- slide: id=id8 title="Časová náročnost rekurzivních algoritmů I" tags="Core" diff="basics" -->
## Časová náročnost rekurzivních algoritmů I

Při návrhu rekurze musíme rozlišovat asymptotickou složitost:

- **Lineární rekurze ($O(n)$):** Faktoriál, binární vyhledávání ($O(\log n)$), průchod spojovým seznamem. Počet kroků roste úměrně velikosti vstupu.
- **Větvená rekurze ($O(2^n)$):** Naivní Fibonacci, generování všech podmnožin, věž v Hanoji.
- **Faktoriální rekurze ($O(n!)$):** Generování všech permutací hrubou silou.

---

<!-- slide: id=id9 title="Časová náročnost rekurzivních algoritmů II" tags="Core" diff="basics" -->
## Srovnání složitostí: Proč $O(2^n)$ exploduje

Předpokládejme procesor schopný vykonat $10^9$ operací za sekundu:

| Složitost | $n = 10$ | $n = 30$ | $n = 50$ |
|---|---|---|---|
| **$O(n)$** | $10\text{ ns}$ | $30\text{ ns}$ | $50\text{ ns}$ |
| **$O(n^2)$** | $100\text{ ns}$ | $900\text{ ns}$ | $2.5\ \mu\text{s}$ |
| **$O(2^n)$** | $1\ \mu\text{s}$ | $1.07\text{ s}$ | **13 dní!** |
| **$O(n!)$** | $3.6\text{ ms}$ | $8.4 \times 10^{15}\text{ let}$ | nepředstavitelné |

Zatímco lineární algoritmus pro $n=50$ proběhne za 50 nanosekund, naivní rekurzivní Fibonacci pro $n=50$ poběží nepřetržitě téměř dva týdny!

---

<!-- slide: id=id10 title="Praktické použití: Memoizace (`@cache`)" tags="Core" diff="basics" python="3.12+" -->
## Záchrana rekurze: Memoizace (`@functools.cache`)

Jak zachovat eleganci matematického rekurzivního zápisu a přitom se vyhnout exponenciálnímu zpomalení? **Memoizace!**

Uložíme mezivýsledky do mezipaměti (slovníku). V moderním Pythonu (3.9+) na to stačí jediný řádek:

```python
from functools import cache

@cache
def fib(n: int) -> int:
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# Bleskový výpočet i pro n = 200 za zlomek milisekundy!
print(fib(200))
```
Dekorátor `@cache` zredukuje exponenciální složitost $O(2^n)$ na bleskovou **lineární složitost $O(n)$**.

---

<!-- slide: id=id11 title="Koncová rekurze v Pythonu" tags="Tricky" diff="paradigm" -->
## Koncová rekurze (*Tail Call Optimization*)

Některé funkcionální jazyky (Haskell, Scheme, Lisp) provádějí automatickou optimalizaci koncové rekurze (*TCO – Tail Call Optimization*), která přepisuje rekurzivní volání na skok ve smyčce a šetří zásobník.

> [!NOTE]
> **Proč CPython TCO záměrně nepodporuje?**
> Tvůrce Pythonu Guido van Rossum TCO v CPythonu záměrně odmítl, aby zachoval **úplné a přesné trasování chyb (*Traceback*)** při ladění výjimek.
> Pokud algoritmus vyžaduje hlubokou rekurzi, v Pythonu ji vždy přepište na explicitní cyklus `while` nebo zásobník.
