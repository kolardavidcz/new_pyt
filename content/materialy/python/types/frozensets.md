<!-- slide: id1, Úvod do neměnných množin (frozenset), Core, newconcept -->
## Neměnné množiny (`frozenset`)

Třída **`frozenset`** představuje neměnnou (*immutable*) a hashovatelnou variantu běžné množiny `set`:

```python
fs = frozenset([1, 2, 3, 2, 1])
print(fs)  # frozenset({1, 2, 3})
```

### Klíčová analogie v typovém systému:
Stejně jako je `tuple` neměnnou obdobou `list`, je **`frozenset`** neměnnou obdobou **`set`**:

| Vlastnost | Měnitelný typ (*Mutable*) | Neměnný typ (*Immutable*) |
| :--- | :---: | :---: |
| **Sekvence (pořadí)** | `list` | `tuple` |
| **Kolekce unikátních prvků** | `set` | **`frozenset`** |
| **Lze použít jako klíč slovníku?** | ❌ Ne | ✅ **Ano** |
| **Lze vložit do jiné množiny?** | ❌ Ne | ✅ **Ano** |

> [!NOTE] C/C++ a Java analogie
> V Javě odpovídá `Set.of(...)` (neměnná množina od Javy 9).
> V C++ nemá přímý ekvivalent (řeší se `const std::unordered_set<T>`).

---
<!-- slide: id2, Vytvoření frozenset, Core, basics -->
## Vytvoření `frozenset`

Zmraženou množinu vytvoříme předáním libovolného iterovatelného objektu konstruktoru `frozenset()`:

```python
# 1. Ze seznamu (automatická deduplikace)
fs1 = frozenset(["admin", "editor", "admin", "reader"])
print(fs1)  # frozenset({'admin', 'editor', 'reader'})

# 2. Z textového řetězce
fs2 = frozenset("abrakadabra")
print(fs2)  # frozenset({'a', 'b', 'r', 'k', 'd'})

# 3. Z běžné množiny
bezna = {1, 2, 3}
fs3 = frozenset(bezna)
```

> [!IMPORTANT]
> Pro `frozenset` neexistuje v Pythonu žádný speciální závorkový literál (jako `{}` pro `set`/`dict`). Vždy se musí explicitně volat konstruktor `frozenset(...)`.

---
<!-- slide: id3, Prázdný frozenset a singleton v CPythonu, Skip, basics -->
## Prázdný `frozenset` a singleton v CPythonu

Prázdnou zmraženou množinu vytvoříme voláním konstruktoru bez argumentů:

```python
prazdny_fs = frozenset()
print(prazdny_fs)       # frozenset()
print(len(prazdny_fs))  # 0
```

> [!TIP] Optimalizace CPythonu: Singleton
> Protože je `frozenset` neměnný, CPython nevytváří pro prázdné instance nové objekty v paměti, ale vrací vždy stejný sdílený **singleton**:
> ```python
> a = frozenset()
> b = frozenset()
> print(a is b)  # True (identická adresa v paměti!)
> ```

---
<!-- slide: id4, Základní vlastnosti a složitost, Core, basics -->
## Základní vlastnosti a složitost

Objekt `frozenset` poskytuje stejnou rychlost vyhledávání jako běžná množina:

```python
opravneni = frozenset(["read", "write", "execute"])

# 1. Počet prvků O(1)
print(len(opravneni))  # 3

# 2. Bleskový test členství O(1)
print("write" in opravneni)   # True
print("delete" in opravneni)  # False

# 3. Iterace cyklem for
for op in opravneni:
    print(f"Role: {op}")
```

---
<!-- slide: id5, Hashovatelnost: frozenset jako klíč slovníku, Core, paradigm -->
## Proč potřebujeme `frozenset`: Hashovatelnost

Největší význam `frozenset` spočívá v tom, že implementuje metodu **`__hash__()`**. Díky tomu jej můžeme použít tam, kde běžný `set` selže:

### 1. Jako klíč ve slovníku:
```python
# Mapování neuspořádaných dvojic (neorientované hrany grafu) na vzdálenosti:
vzdalenosti = {
    frozenset({"Praha", "Brno"}): 205,
    frozenset({"Praha", "Plzen"}): 95,
    frozenset({"Brno", "Ostrava"}): 170,
}

# Pořadí měst v dotazu nehraje roli!
print(vzdalenosti[frozenset({"Brno", "Praha"})])  # 205
```

### 2. Množina množin (Set of Sets):
```python
# Běžná množina nemůže obsahovat jinou běžnou množinu:
# s = {{1, 2}, {3, 4}}  # TypeError: unhashable type: 'set'

# Pomocí frozenset to funguje přirozeně:
skupiny = {frozenset({1, 2}), frozenset({3, 4})}
print(skupiny)  # {frozenset({1, 2}), frozenset({3, 4})}
```

---
<!-- slide: id6, Množinové operace nad frozenset, Core, resyntax -->
## Množinové operace nad `frozenset`

`frozenset` podporuje všechny matematické operátory i dotazy, které **nemění** původní instanci:

```python
A = frozenset([1, 2, 3, 4])
B = frozenset([3, 4, 5, 6])

# Množinová algebra (vrací nový frozenset)
print(A & B)   # frozenset({3, 4})       (průnik)
print(A | B)   # frozenset({1, 2, 3, 4, 5, 6}) (sjednocení)
print(A - B)   # frozenset({1, 2})       (rozdíl)
print(A ^ B)   # frozenset({1, 2, 5, 6}) (symetrický rozdíl)

# Relační dotazy
print(A.isdisjoint(frozenset([10, 20])))  # True
print(frozenset([1, 2]) <= A)              # True (podmnožina)
```

> [!NOTE] Pravidlo typu výsledku
> Při kombinaci `frozenset` a `set` v binárních operátorech (`&`, `|`, `-`, `^`) určuje typ výsledku **levý operand**:
> ```python
> fs = frozenset([1, 2])
> s = {2, 3}
> print(type(fs | s))  # <class 'frozenset'>
> print(type(s | fs))  # <class 'set'>
> ```

---
<!-- slide: id7, Optimalizace copy() u frozenset, Core, basics -->
## Metoda `copy()` u `frozenset`

Metoda `copy()` u `frozenset` existuje pro zachování kompatibility s rozhraním `set`. 

Protože je však `frozenset` zcela neměnný, CPython provádí elegantní optimalizaci – **nevytváří žádnou novou instanci, ale vrátí přímo sám sebe (`self`)**:

```python
fs = frozenset([1, 2, 3])
kopie = fs.copy()

print(kopie == fs)  # True (hodnoty jsou shodné)
print(kopie is fs)  # True (odkazují na naprosto stejný objekt v paměti!)
```

Tato beznákladová operace šetří paměť i čas procesoru.
