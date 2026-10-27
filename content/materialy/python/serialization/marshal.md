<!-- slide: id1, Úvod, Core, basics -->
## Úvod do modulu `marshal`: Interní serializace Pythonu

Modul **`marshal`** je interní součástí CPython runtime. Jeho primárním a téměř výhradním účelem je čtení a zápis kompilovaného bajtkódu do souborů **`.pyc`** ve složce `__pycache__`.

```python
import marshal
```

> [!WARNING]
> Formát modulu `marshal` je **záměrně nedokumentovaný a není zpětně kompatibilní** mezi různými verzemi Pythonu (dokonce ani mezi minor verzemi jako 3.11 a 3.12).
> **Nikdy nepoužívejte `marshal` pro obecnou serializaci aplikačních dat!** Pro perzistenci dat vždy volte `pickle`, `shelve` nebo `json`.

---
<!-- slide: id2, Metody modulu „marshal“, Core, resyntax -->
## Rozhraní modulu `marshal`

Rozhraní `marshal` kopíruje tradiční čtveřici metod známou z modulu `pickle`:

```python
import marshal

# 1. Serializace a deserializace v paměti RAM:
raw_bytes = marshal.dumps("Ahoj")
obnoveno = marshal.loads(raw_bytes)

# 2. Serializace a deserializace do/z binárního souboru:
with open('code.pyc', mode='wb') as f:
    marshal.dump(obj, f)

with open('code.pyc', mode='rb') as f:
    obj = marshal.load(f)
```

Na rozdíl od `pickle` modul `marshal` nekontroluje cyklické reference objektů (pokus o zamaršalování rekurzivního slovníku způsobí přetečení zásobníku CPythonu).

---
<!-- slide: id3, Co lze zamaršalovat, Core, newconcept -->
## Podporované datové typy modulu `marshal`

`marshal` podporuje pouze striktní podmnožinu vestavěných typů, které se mohou vyskytovat v kompilovaném bajtkódu:

- **Objekty kódu (`code object`)**: Zkompilovaný kód funkcí a modulů vytvořený funkcí `compile()`.
- **Primitivní typy**: `bool`, `int`, `float`, `complex`, `str`, `bytes`, `bytearray`.
- **Základní kontejnery**: `tuple`, `list`, `set`, `frozenset`, `dict` (pouze pokud obsahují podporované typy).
- **Singletony**: `None`, `Ellipsis`, `StopIteration`.

> [!NOTE]
> `marshal` **neumí** serializovat instance uživatelských tříd, třídy jako takové, ani funkce s jejich uzávěrem (*closure*). Umí uložit pouze holý `code` objekt.

---
<!-- slide: id4, Příklad – bajtkódobjekt, WOW, newconcept -->
## Příklad: Serializace zkompilovaného `code` objektu

Ukažme si, jak Python interně ukládá zkompilovaný zdrojový kód do souboru `.pyc`:

```python
import marshal
import dis

# 1. Kompilace zdrojového textu do objektu bajtkódu:
kod = compile("vysledek = [x * 2 for x in range(5)]", filename="<dynamicky>", mode="exec")
print(type(kod))
# <class 'code'>

# 2. Zamaršalování do surových bajtů:
pyc_data = marshal.dumps(kod)
print("Velikost serializovaného bajtkódu:", len(pyc_data), "B")

# 3. Odmaršalování a disasemblace:
restored_code = marshal.loads(pyc_data)
dis.dis(restored_code)
```

Tento mechanismus využívá interpret CPythonu při každém importu modulu k urychlení startu aplikace.

---
<!-- slide: id5, Příklad – data, Core, basics -->
## Serializace základních datových typů

Ačkoli je primárně určen pro bajtkód, zvládá `marshal` i základní n-tice:

```python
import marshal

data = (1, 2, "Python")

# Zamaršalování do bajtů:
bin_data = marshal.dumps(data)
print(bin_data)
# b'(\x03\x00\x00\x00i\x01\x00\x00\x00i\x02\x00\x00\x00u\x06\x00\x00\x00Python'

# Obnovení:
print(marshal.loads(bin_data))
# (1, 2, 'Python')
```

Formát je extrémně úsporný (písmeno typu následované délkou a daty), postrádá však tabulku referencí a logiku tříd.

---
<!-- slide: id6, Verze protokolu, Skip, basics -->
## Vývoj formátu a verze modulu `marshal`

Verze maršalovacího protokolu je pevně svázána s verzí CPythonu:

```python
import marshal

print("Aktuální verze marshal protokolu:", marshal.version)
# 4 (v moderním Pythonu 3.4+)
```

Historický vývoj:
- **Verze 0**: Původní formát v Pythonu 1.x.
- **Verze 1**: Internování a sdílení shodných řetězců.
- **Verze 2**: IEEE 754 binární reprezentace reálných čísel `float`.
- **Verze 3**: Podpora pro anotace objektů a novější instrukce bajtkódu.
- **Verze 4**: Optimalizace tabulky sdílených konstant a kódových objektů.

---
<!-- slide: id7, Poznámky, Tricky, paradigm -->
## Bezpečnostní shrnutí modulu `marshal`

> [!CAUTION]
> Stejně jako u `pickle`, ani formát modulu `marshal` nekontroluje integritu ani bezpečnost dat.
> Chybné nebo úmyslně poškozené maršalované soubory mohou způsobit pád celého procesu Pythonu (Segmentation Fault) v interním C kódu interpretu.

Shrnutí pro praxi:
- **`marshal`** je privátní nástroj jádra CPythonu pro `.pyc` cache.
- Pro aplikační perzistenci Python objektů použijte **`pickle`** nebo **`shelve`**.
- Pro otevřené přenositelné formáty použijte **`json`**, **`tomllib`** nebo **`sqlite3`**.
