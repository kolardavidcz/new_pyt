<!-- slide: id=id1 title="Úvod do Cythonu" tags="Core" diff="newconcept" -->
## Úvod do Cythonu

**Cython** je optimalizační statický kompilátor pro jazyk Python. Umožňuje vzít standardní pythonní kód (nebo kód rozšířený o C typové deklarace) a zkompilovat jej do vysoce efektivního céčkovského zdrojového kódu a následně do nativní sdílené knihovny (`.so` na Linuxu, `.pyd` na Windows).

Ukázkový modul pro převod:

```python
# Program: kod.pyx
print("Já jsem externí knihovna!")

def funkce() -> None:
    print("A obsahuji dokonce i nějakou funkci ^_^")
```

Na tomto minimalistickém příkladu si předvedeme kompletní pipeline překladu z Cythonu do strojového kódu.

---
<!-- slide: id=id2 title="Přehled projektu a build workflow" tags="Core" diff="newconcept" -->
## Workflow práce s Cythonem

Klasický a plně reprodukovatelný postup vývoje v Cythonu sestává ze 4 kroků:

1. **Vytvoření zdrojového kódu**: Napíšeme pythonní nebo cythonní kód do souboru s příponou **`*.pyx`**.
2. **Konfigurace sestavení**: Vytvoříme sestavovací skript **`setup.py`** (využívající `setuptools` a `Cython.Build.cythonize`).
3. **Kompilace**: Spustíme překlad příkazem `python setup.py build_ext --inplace`.
4. **Import**: Výslednou binární knihovnu `*.pyd` / `*.so` naimportujeme v běžném Python skriptu pomocí standardního příkazu `import`.

---
<!-- slide: id=id3 title="Příprava projektu" tags="Core" diff="pythonic" -->
## Příprava projektu: `kod.pyx` a `setup.py`

Ve zdrojovém souboru je dobrým zvykem explicitně definovat verzi jazyka:

```python
# Program: kod.pyx
# cython: language_level=3

print("Já jsem externí knihovna!")

def funkce():
    print("A obsahuji dokonce i nějakou funkci ^_^")
```

A odpovídající moderní `setup.py`:

```python
# Program: setup.py
from setuptools import setup
from Cython.Build import cythonize

setup(
    ext_modules=cythonize("kod.pyx", compiler_directives={"language_level": "3"})
)
```

> [!NOTE]
> V moderním Pythonu používáme výhradně `setuptools`, protože původní `distutils` byl v Pythonu 3.12 kompletně odstraněn. V Cythonu 3.0+ je `language_level=3` výchozí hodnotou.

---
<!-- slide: id=id4 title="Překlad projektu" tags="Core" diff="basics" -->
## Překlad projektu: `build_ext --inplace`

Kompilaci provedeme v terminálu:

```bash
python setup.py build_ext --inplace
```

Při tomto příkazu proběhnou dva kroky:
1. **Cython fáze**: Překladač Cythonu přečte `kod.pyx` a vygeneruje Céčkovský kód `kod.c`.
2. **C kompilátor fáze**: Systémový C kompilátor (GCC, Clang nebo MSVC) zkompiluje `kod.c` s hlavičkami Pythonu a vytvoří binární modul:
   - `kod.cpython-312-x86_64-linux-gnu.so` na Linuxu
   - `kod.cp312-win_amd64.pyd` na Windows

Přepínač `--inplace` zajistí, že zkompilovaná knihovna vznikne přímo v aktuální složce vedle zdrojového kódu.

---
<!-- slide: id=id5 title="Použití zkompilované knihovny" tags="Skip" diff="basics" -->
## Použití vyrobené knihovny v Pythonu

Zkompilovaný modul lze okamžitě importovat jako kterýkoliv jiný modul ze standardní knihovny:

```python
# Program: test.py
import kod

kod.funkce()
```

**Výstup:**
```text
Já jsem externí knihovna!
A obsahuji dokonce i nějakou funkci ^_^
```

Python interpret načte `.so` / `.pyd` knihovnu přímo přes dynamický linker OS. Pro volající kód je modul k nerozeznání od čistého Pythonu.

---
<!-- slide: id=id6 title="Cython HTML profil: cython -a" tags="WOW" diff="newconcept" -->
## Inspekce překladu a Python interakcí: `cython -a`

Naprosto klíčovým nástrojem pro ladění výkonu v Cythonu je generování **HTML anotačního reportu**:

```bash
cython -a kod.pyx
```

Cython vygeneruje interaktivní soubor `kod.html`. V něm jsou řádky kódu podbarveny různými odstíny **žluté barvy**:
- **Bílé řádky**: Převedeny do čistého, optimalizovaného C kódu bez interakce s CPython runtime.
- **Sytě žluté řádky**: Obsahují náročné volání Python C-API (boxing objektů, vyhledávání v dictionaries, reference counting `Py_INCREF`).
- Kliknutím na řádek se rozbalí vygenerovaný C kód!

---
<!-- slide: id=id7 title="Interpretace anotačního reportu" tags="Tricky" diff="newconcept" -->
## Jak číst odstíny žluté v reportu

Pravidla pro optimalizaci kódu podle `cython -a`:

1. **Slabě žluté řádky**:
   - Obvykle představují kontrolu mezí polí (*bounds checking*) nebo ošetření dělení nulou.
   - Způsobují mírnou režii (~10–30 %), kterou lze v kritických smyčkách vypnout direktivami `@cython.boundscheck(False)`.
2. **Sytě žluté řádky**:
   - Znamenají konverzi mezi C a Python typy nebo volání přes pythonní GIL.
   - V jednorázovém inicializačním kódu nevadí.
   - **Pokud je sytě žlutý řádek uvnitř vnitřního cyklu `for`**, drasticky degraduje výkon (stovky instrukcí na iteraci místo jedné instrukce v procesoru)! Cílem optimalizace je dosáhnout ve výpočetních smyčkách čistě bílé barvy.

---
<!-- slide: id=id8 title="Co Cython udělal za nás pod kapotou" tags="Core" diff="newconcept" -->
## Co Cython generuje pod kapotou

Pokud otevřete vygenerovaný `kod.c`, uvidíte tisíce řádků kódu pro triviální funkci. Proč?

Cython automaticky vygeneroval:
- Kompletní modulovou inicializační funkci `PyInit_kod()`.
- Metodové tabulky `PyMethodDef` vystavující funkce pythonnímu interpretu.
- Správu počítadla referencí (`Py_INCREF`, `Py_DECREF`) pro zabránění memory leakům.
- Bezpečný přenos výjimek mezi C a Pythonem.
- Obalení datových struktur dle C-API standardu dané verze CPythonu.

Díky tomu se zkompilovaná knihovna chová jako nativní CPython modul s plnou kompatibilitou.

---
<!-- slide: id=id9 title="Proč je Cython až 100x rychlejší?" tags="WOW" diff="paradigm" -->
## Proč je Cython až 100× rychlejší: Dynamika vs. Statika

Srovnejme inkrementaci čísla v Pythonu a Cythonu:

```python
# Čistý Python
count = 23
count += 10
```

```cython
# Cython s C typem
cdef int count = 23
count += 10
```

Při `count += 10` v čistém Pythonu musí interpret za běhu projít kaskádu kroků:
1. Hledat `count` v lokálním / globálním jmenném prostoru (hash table lookup).
2. Zjistit dynamický typ objektu `count` (ukazatel na `PyObject`).
3. Zjistit, zda typ podporuje operátor `+=` (inspekce slotu `nb_inplace_add`).
4. Ověřit typ pravé strany (`10` jako `PyLongObject`).
5. Vytvořit nový `PyLongObject` s výsledkem `33` a alokovat jej na haldě.
6. Dekrementovat referenci starého objektu (`Py_DECREF`).

V Cythonu s `cdef int count`:
- Kompilátor vygeneruje jedinou strojovou instrukci: **`add dword ptr [rbp-4], 10`**!
- Žádná alokace paměti, žádné hash tabulky, žádný runtime overhead.
