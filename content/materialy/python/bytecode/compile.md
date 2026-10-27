<!-- slide: id=id1 title="Úvod do objektů bajtkódu" tags="Core" diff="newconcept" -->
## Úvod do objektů bajtkódu (`code object`)

Python je interpretovaný jazyk, který před vykonáním zdrojového kódu provádí automatickou kompilaci do mezipaměti bajtkódu pro virtuální stroj CPython. Výsledkem této kompilace je **objekt kódu (`code object`)**:

```python
co = compile('xs = [1]', '<string>', 'exec')

print(co)
# <code object <module> at 0x7f8a1c, file "<string>", line 1>

print([attr for attr in dir(co) if attr.startswith('co_')])
```

Mezi klíčové atributy `code` objektu patří:
- `co_code`: Surové binární instrukce virtuálního stroje.
- `co_consts`: Konstanty a literály použité v kódu.
- `co_names`: Globální jména a atributy.
- `co_varnames`: Lokální proměnné a poziční parametry.
- `co_argcount`: Počet očekávaných pozičních argumentů.

---
<!-- slide: id=id2 title="Vestavěná funkce compile()" tags="Core" diff="newconcept" -->
## Vestavěná funkce `compile()`

Na bajtkód příslušející libovolnému pythonnímu zdrojovému kódu se můžeme podívat přímo za běhu pomocí vestavěné funkce **`compile(source, filename, mode)`**:

```python
co = compile('xs = [1]', '<string>', 'exec')
print(co.co_code)
# b'\x97\x00d\x00g\x01Z\x00y\x01' (bajtové instrukce CPython VM)
```

Funkce přijímá 3 povinné parametry:
1. **`source`**: Zdrojový kód jako řetězec, bajtový buffer nebo AST strom (`ast.AST`).
2. **`filename`**: Jméno souboru, ze kterého kód pochází (pokud kód vznikl v paměti, používá se konvence `'<string>'`).
3. **`mode`**: Režim kompilace:
   - `'exec'`: Běžná posloupnost příkazů a modulů (může obsahovat cokoliv).
   - `'eval'`: Jeden samostatný výraz vracející hodnotu (např. `'x + 1'`).
   - `'single'`: Jeden interaktivní příkaz jako v REPL konzoli (pokud vyhodnotí ne-None hodnotu, vypíše ji).

---
<!-- slide: id=id3 title="Identifikace kódu" tags="Skip" diff="basics" -->
## Identifikace objektu kódu

Objekt kódu si uchovává metadata o svém původu:

```python
co = compile('def moje_funkce(): pass', '<string>', 'exec')

print(co.co_name)      # -> '<module>'
print(co.co_filename)  # -> '<string>'
```

Pokud získáme `code object` konkrétní funkce (např. `moje_funkce.__code__`), uvidíme:

```python
def scitej(a: int, b: int) -> int:
    return a + b

print(scitej.__code__.co_name)      # -> 'scitej'
print(scitej.__code__.co_filename)  # -> cesta k .py souboru
```

---
<!-- slide: id=id4 title="Jména proměnných v bajtkódu" tags="WOW" diff="paradigm" -->
## Jména proměnných a rozsah platnosti

CPython striktně odděluje proměnné podle jejich uložení a rychlosti přístupu:

- **`co_varnames`**: Lokální proměnné a argumenty funkce. V CPythonu jsou indexovány v poli v čase $O(1)$ instrukcemi `LOAD_FAST` a `STORE_FAST`:
  ```python
  def fn(x, y):
      z = x + y
  print(fn.__code__.co_varnames)  # -> ('x', 'y', 'z')
  ```
- **`co_names`**: Globální jména, importované moduly a atributy objektů (přístup přes hashovací tabulku `LOAD_GLOBAL` / `LOAD_ATTR`):
  ```python
  co = compile('xs = [1]', '<string>', 'exec')
  print(co.co_names)  # -> ('xs',)
  ```
- **`co_cellvars` & `co_freevars`**: Proměnné uzávěrů (*closures*). `co_cellvars` jsou lokální proměnné zachycené vnitřní funkcí, `co_freevars` jsou proměnné z nadřazeného scopu používané uvnitř.

---
<!-- slide: id=id5 title="Čítače argumentů a stacksize" tags="Core" diff="newconcept" -->
## Čítače parametrů a velikost zásobníku

Kompilátor před spuštěním staticky analyzuje kód a určí jeho paměťové nároky:

```python
def fn(a, b, *args, rezim="rychly", **kwargs):
    x = 10
    return a + b + x

code = fn.__code__
print("co_argcount:", code.co_argcount)              # -> 2 (poziční argumenty a, b)
print("co_kwonlyargcount:", code.co_kwonlyargcount)  # -> 1 (keyword-only rezim)
print("co_nlocals:", code.co_nlocals)                # -> 6 (a, b, args, rezim, kwargs, x)
print("co_stacksize:", code.co_stacksize)            # -> hloubka zásobníku rámce
print("co_firstlineno:", code.co_firstlineno)        # -> číslo řádku definice
```

> [!NOTE]
> `co_stacksize` udává maximální hloubku vyhodnocovacího zásobníku (*evaluation stack*), kterou rámec funkce v kterémkoliv okamžiku spotřebuje. Díky tomu CPython přesně ví, kolik paměti alokovat pro zásobník rámce bez reallokací za běhu!

---
<!-- slide: id=id6 title="Operační instrukce a konstanty" tags="WOW" diff="newconcept" -->
## Instrukce bajtkódu a tabulka konstant

Každý `code` objekt obsahuje dvě zásadní tabulky:

```python
co = compile('xs = [1]', '<string>', 'exec')

print("Konstanty (co_consts):", co.co_consts)
# -> (1, None)

print("Surový bajtkód (co_code):", co.co_code)
```

- **`co_consts`**: N-tice všech neměnných literálů použitých v kódu (čísla, řetězce, `None`). Čísla v instrukcích bajtkódu jsou pak pouhými indexy do této n-tice!
- **`co_flags`**: Bitová maska vlastností kódu (např. zda funkce používá generátor `CO_GENERATOR`, korutinu `CO_COROUTINE`, či variabilní argumenty `*args` / `**kwargs`).

> [!NOTE]
> V Pythonu 3.11+ byla stará tabulka mapování řádků `co_lnotab` nahrazena novým kompaktním formátem **`co_linetable`**, který umožňuje přesné lokalizování sloupců a rozsahů chyb v tracebacku (PEP 657).

---
<!-- slide: id=id7 title="Interní C struktura PyCodeObject" tags="Skip" diff="newconcept" -->
## Interní architektura: C struktura `PyCodeObject`

V céčkovském jádru CPythonu (`Include/cpython/code.h`) je každý objekt kódu reprezentován strukturou `PyCodeObject`:

- Obsahuje ukazatele na pole instrukcí a tabulku konstant.
- Od Pythonu 3.11 obsahuje navíc **Specialized Adaptive Execution cache** (PEP 659):
  - Adaptivní interpret sleduje typy za běhu a za běhu nahrazuje obecné instrukce (např. `BINARY_OP`) specializovanými super-instrukcemi (`BINARY_OP_ADD_INT`).
- Optimalizuje recyklaci paměťových rámců zásobníku (*frame allocation cache*).

---
<!-- slide: id=id8 title="Disassemblování kódu: modul dis" tags="WOW" diff="pythonic" -->
## Disassemblování bajtkódu: `dis.show_code()` a `dis.dis()`

Místo ručního luštění hexadecimálních bajtů v `co_code` nabízí standardní knihovna modul **`dis`**:

```python
import dis

dis.show_code('xs = [1]')
```

**Výstup:**
```text
Name:              <module>
Filename:          <code_info>
Argument count:    0
Positional-only arguments: 0
Kw-only arguments: 0
Number of locals:  0
Stack size:        2
Flags:             0x0
Constants:
   0: 1
   1: None
Names:
   0: xs
```

A kompletní výpis instrukcí virtuálního stroje pomocí **`dis.dis('xs = [1]')`**:

```text
  1           0 BUILD_LIST               0
              2 LOAD_CONST               0 (1)
              4 LIST_APPEND              1
              6 STORE_NAME               0 (xs)
              8 RETURN_CONST             1 (None)
```

Zde jasně vidíme stack-based povahu virtuálního stroje CPythonu: vytvoření seznamu, vložení konstanty a uložení do globálního jména `xs`.
