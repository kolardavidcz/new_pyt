<!-- slide: id1, Úvod do collections.defaultdict, Core, pythonic -->
## Úvod do `collections.defaultdict`

Při práci s běžným slovníkem `dict` je dotaz na neexistující klíč ošetřen vyhozením výjimky `KeyError`:

```python
pocty = {}
# pocty["jablko"] += 1  # KeyError: 'jablko'
```

K řešení této situace existuje v modulu `collections` specializovaná třída **`defaultdict`**:
- Je přímou podtřídou standardního `dict` (`issubclass(defaultdict, dict) == True`).
- Poskytuje identické rozhraní, metody i $O(1)$ rychlost jako běžný slovník.
- Při dotazu na neexistující klíč **nevyhodí výjimku**, ale automaticky zavolá tzv. **`default_factory`** (tovární funkci), vygeneruje výchozí hodnotu, uloží ji do slovníku a vrátí.

> [!NOTE] C++ a Java analogie
> V C++ se `std::map<K, V>` chová podobně (operátor `[]` automaticky vloží defaultně zkonstruovaný prvek).
> V Javě se pro tento účel od Javy 8 používá metoda `map.computeIfAbsent(key, k -> new ArrayList<>())`.

---
<!-- slide: id2, Příklad – klasický přístup (LBYL), Skip, basics -->
## Počítání výskytů: Klasický přístup (LBYL)

Mějme za úkol spočítat četnost znaků v textovém řetězci.

### Přístup LBYL (*Look Before You Leap*):
Před každým zápisem nejprve otestujeme, zda klíč ve slovníku již existuje:

```python
text = "abrakadabra"
pocty = {}

for pismeno in text:
    if pismeno in pocty:
        pocty[pismeno] += 1
    else:
        pocty[pismeno] = 1

print(pocty)
# {'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1}
```

Tento zápis funguje, ale vyžaduje redundantní větvení `if-else` a dvojí vyhledávání v hash tabulce při každém kroku.

---
<!-- slide: id3, Příklad – pomocí výjimek (EAFP), Skip, pythonic -->
## Počítání výskytů: Přístup EAFP

V Pythonu je často preferován přístup **EAFP** (*Easier to Ask for Forgiveness than Permission*) – předpokládáme úspěch a výjimku zachytíme:

```python
text = "abrakadabra"
pocty = {}

for pismeno in text:
    try:
        pocty[pismeno] += 1
    except KeyError:
        pocty[pismeno] = 1

print(pocty)
# {'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1}
```

Další alternativou na běžném slovníku je použití metody `get()`:
```python
for pismeno in text:
    pocty[pismeno] = pocty.get(pismeno, 0) + 1
```

---
<!-- slide: id4, Příklad – pomocí defaultdict, WOW, pythonic -->
## Elegantní řešení pomocí `defaultdict`

S použitím `defaultdict(int)` kód zkrátíme na minimum:

```python
from collections import defaultdict

text = "abrakadabra"
pocty = defaultdict(int)

for pismeno in text:
    pocty[pismeno] += 1

print(pocty)
# defaultdict(<class 'int'>, {'a': 5, 'b': 2, 'r': 2, 'k': 1, 'd': 1})
```

### Proč to funguje?
Při prvním výskytu písmena `'a'` výraz `pocty['a'] += 1`:
1. Zjistí, že klíč `'a'` zatím neexistuje.
2. Zavolá tovární funkci `int()`, která vrátí `0`.
3. Vloží `'a': 0` do slovníku.
4. Přičte jedničku: `0 + 1 = 1`.

> [!TIP] Modul collections.Counter
> Pro pouhé počítání frekvencí nabízí standardní knihovna ještě přímočařejší nástroj:
> ```python
> from collections import Counter
> pocty = Counter("abrakadabra")
> print(pocty.most_common(2))  # [('a', 5), ('b', 2)]
> ```

---
<!-- slide: id5, Tovární funkce (default_factory), Core, pythonic -->
## Tovární funkce (`default_factory`)

Prvním parametrem konstruktoru `defaultdict` je libovolný volatelný objekt (*callable*), který bez argumentů vyrobí novou instanci:

```python
from collections import defaultdict

# 1. Čísla (výchozí 0)
d_int = defaultdict(int)

# 2. Seznamy (výchozí []) - ideální pro 1:N seskupování
d_list = defaultdict(list)
d_list["ovoce"].append("jablko")
d_list["ovoce"].append("hruska")
# {'ovoce': ['jablko', 'hruska']}

# 3. Množiny (výchozí set()) - ideální pro deduplikaci hodnot
d_set = defaultdict(set)
d_set["tagy"].add("python")
d_set["tagy"].add("python")  # duplicita se zahodí

# 4. Vlastní lambda funkce
d_custom = defaultdict(lambda: "Neznámý uživatel")
print(d_custom["uid_99"])  # 'Neznámý uživatel'
```

> [!WARNING] Vedlejší efekt pouhého čtení
> Pouhý dotaz na neexistující klíč pomocí hranatých závorek `d[klic]` **tento klíč do slovníku skutečně vytvoří**!
> Pokud chcete pouze zkontrolovat přítomnost bez modifikace slovníku, použijte operátor `klic in d`.

---
<!-- slide: id6, Srovnání: defaultdict vs. setdefault(), Core, pythonic -->
## Srovnání: `defaultdict` vs. `dict.setdefault()`

Před zavedením `defaultdict` se pro seskupování do seznamů používala metoda `setdefault()`:

```python
studenti = [("1.A", "Jan"), ("1.B", "Petr"), ("1.A", "Eva")]

# a) Pomocí setdefault() na běžném slovníku:
skupiny_std = {}
for trida, jmeno in studenti:
    skupiny_std.setdefault(trida, []).append(jmeno)

# b) Pomocí defaultdict:
from collections import defaultdict
skupiny_dd = defaultdict(list)
for trida, jmeno in studenti:
    skupiny_dd[trida].append(jmeno)
```

### Proč je `defaultdict` výrazně lepší a rychlejší?
- **Výkonnostní past `setdefault(k, [])`**: V každé iteraci cyklu se **vytvoří nový prázdný seznam `[]` na haldě**, i když daný klíč už dávno existuje! Pokud má seznam milion prvků, zbytečně alokujete a okamžitě zahodíte milion prázdných seznamů.
- **`defaultdict`** zavolá tovární funkci `list` **pouze tehdy, když klíč skutečně chybí**. Je proto znatelně rychlejší a šetří paměť.

---
<!-- slide: id7, Magická metoda __missing__ a podtřídy dict, Tricky, pythonic -->
## Jak to funguje uvnitř: Magická metoda `__missing__`

Třída `defaultdict` funguje díky speciální dunder metodě **`__missing__(self, key)`**:
Pokud metoda `dict.__getitem__(key)` nenajde klíč, automaticky deleguje na `__missing__(key)`.

Můžeme si tak snadno vytvořit vlastní specializovaný slovník, který při vytváření hodnoty **zná samotný klíč**:

```python
class KeyAwareDict(dict):
    """Slovník, jehož výchozí hodnota závisí na hledaném klíči."""
    def __missing__(self, key: str) -> str:
        # Vygenerujeme hodnotu na základě klíče a uložíme ji
        val = f"Hodnota pro klíč [{key.upper()}]"
        self[key] = val
        return val

d = KeyAwareDict()
print(d["config"])  # 'Hodnota pro klíč [CONFIG]'
print(d)            # {'config': 'Hodnota pro klíč [CONFIG]'}
```

### Typové anotace (Python 3.9+)
```python
from collections import defaultdict

# Plně typovaný defaultdict: mapuje str -> list[int]
body_tymu: defaultdict[str, list[int]] = defaultdict(list)
body_tymu["Modri"].append(10)
```
