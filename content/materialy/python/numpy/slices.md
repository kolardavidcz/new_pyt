<!-- slide: id1, Úvod, Core, paradigm -->
## Vícerozměrné výřezy: Jak Python podporuje syntaxi NumPy

Ačkoli vestavěné typy Pythonu (jako `list` nebo `tuple`) jsou výhradně jednorozměrné, knihovna **NumPy** umožňuje intuitivní vícerozměrné indexování matic a tenzorů:

```python
matrix[1:5, :, 0]
```

Jak je možné, že Python interpret takový zápis vůbec syntakticky dovoluje, když sám vícerozměrná pole nemá?

> [!NOTE]
> Python disponuje plnou **syntaktickou podporou pro vícerozměrné výřezy a maticovou notaci** přímo v gramatice jazyka. Tato syntaxe byla do jazyka začleněna historicky právě proto, aby umožnila vznik vědeckých knihoven jako NumPy!

---
<!-- slide: id2, Výřezy a „__getitem__()“, WOW, paradigm -->
## Co předává operátor `[]` metodě `__getitem__()`?

Indexovací závorky `obj[arg]` jsou syntaktickým cukrem pro volání dunder metody **`__getitem__(self, key)`**:

```python
class Inspector:
    def __getitem__(self, arg):
        print(f"Typ: {type(arg).__name__:8s} | Hodnota: {arg}")

inspect = Inspector()

# 1. Běžný celočíselný index:
inspect[42]
# Typ: int      | Hodnota: 42

# 2. Jednorozměrný řez s dvojtečkou:
inspect[1:10:2]
# Typ: slice    | Hodnota: slice(1, 10, 2)
```

Jakmile indexovací výraz obsahuje dvojtečku `:`, Python automaticky zkonstruuje instanci vestavěného typu **`slice(start, stop, step)`** a předá ji jako argument.

---
<!-- slide: id3, Objekt „slice“, Core, pythonic -->
## Vestavěný objekt `slice`

Objekt **`slice(start, stop, step)`** je plnohodnotný datový typ. Můžete jej vytvořit i explicitně a uložit do proměnné:

```python
data = [0, 10, 20, 30, 40, 50, 60]

# Syntaktický cukr:
sub1 = data[2:5]

# Ekvivalentní explicitní vytvoření řezu:
my_slice = slice(2, 5)
sub2 = data[my_slice]

print(sub1 == sub2)
# True

# Atributy objektu slice:
print(my_slice.start, my_slice.stop, my_slice.step)
# 2 5 None
```

> [!TIP]
> Pojmenované řezy (`HEADER = slice(0, 3)`, `BODY = slice(3, -1)`) zpřehledňují parsování fixních datových formátů a odstraňují z kódu magická čísla.

---
<!-- slide: id4, Osy výřezu, WOW, paradigm -->
## Víceosové výřezy: Čárka v hranatých závorkách

Největší kouzlo nastává při použití **čárky uvnitř hranatých závorek**:

```python
class Inspector:
    def __getitem__(self, arg):
        print(f"Typ: {type(arg).__name__} | Obsah: {arg}")

inspect = Inspector()

inspect[1, 2]
# Typ: tuple | Obsah: (1, 2)

inspect[1:5, 3:8]
# Typ: tuple | Obsah: (slice(1, 5, None), slice(3, 8, None))

inspect[0, :, ::2]
# Typ: tuple | Obsah: (0, slice(None, None, None), slice(None, None, 2))
```

> [!IMPORTANT]
> **Čárka uvnitř `[]` vytvoří n-tici (`tuple`)!**
> Každý prvek této n-tice představuje **jednu osu (*axis*)** vícerozměrného pole. NumPy z této n-tice vyčte rozsah indexů pro nultou, první i další dimenze matice.

---
<!-- slide: id5, Vynechání části výřezu, WOW, pythonic -->
## Zkratka pro všechny zbývající dimenze: Výpustka `...`

Při práci s vícerozměrnými poli o 4, 5 nebo více dimenzích (např. dávka RGB snímků: `[batch, channels, height, width]`) by bylo zdlouhavé psát `:` pro každou nezměněnou osu.

Python pro tento účel podporuje speciální syntaxi tří teček: **`...`** (*Ellipsis*):

```python
class Inspector:
    def __getitem__(self, arg):
        print(arg)

inspect = Inspector()

inspect[0, ...]
# (0, Ellipsis)

inspect[..., 5]
# (Ellipsis, 5)

inspect[1:3, ..., ::-1]
# (slice(1, 3, None), Ellipsis, slice(None, None, -1))
```

NumPy interpretuje `...` tak, že automaticky doplní tolik plných řezů `slice(None)`, kolik dimenzí mezi specifikovanými osami chybí.

---
<!-- slide: id6, Objekt „Ellipsis“, Core, basics -->
## Objekt a konstanta `Ellipsis`

Tři tečky `...` jsou v Pythonu doslovným syntaktickým zápisem pro vestavěnou singleton konstantu **`Ellipsis`** (stejně jako `None` je instancí `NoneType`):

```python
print(...)
# Ellipsis

print(type(...))
# <class 'ellipsis'>

print(... is Ellipsis)
# True
```

Kromě výřezů v NumPy se `...` dnes běžně používá v moderním Pythonu:
1. **Typové anotace**: `tuple[int, ...]` označuje n-tici celých čísel libovolné délky; `Callable[..., int]` označuje funkci s libovolnými parametry.
2. **Stuby a protokoly**: Místo `pass` v těle abstraktních metod nebo `.pyi` rozhraních.

---
<!-- slide: id7, Dodatek, Skip, basics -->
## Shrnutí: Objekty `slice` a `Ellipsis` jako prvořadí občané

V Pythonu jsou `slice` i `Ellipsis` plnohodnotné objekty první kategorie (*first-class citizens*):
- Mohou být uloženy do proměnných.
- Mohou být předávány jako argumenty funkcí.
- Mohou být vráceny z funkcí.

```python
# Definice znovupoužitelného maskovacího okna pro 3D tenzor:
ROI = (slice(10, 50), slice(10, 50), Ellipsis)

# Aplikace na různé NumPy tenzory:
# patch = image_cube[ROI]
```

Metoda `slice.indices(length)` navíc dokáže přepočítat `(start, stop, step)` na konkrétní celočíselné hranice pro sekvenci dané délky.

---
<!-- slide: id8, Poznámka, Skip, basics -->
## Flexibilita dunder metody `__getitem__()`

Metoda `__getitem__(self, key)` může přijmout jakýkoliv libovolný objekt:
- V `list` a `tuple`: přijímá `int` nebo `slice`.
- V `dict`: přijímá libovolný hešovatelný objekt (`str`, `int`, `tuple`).
- V `numpy.ndarray`: přijímá `int`, `slice`, `tuple` řezů, booleovskou masku nebo pole indexů (*fancy indexing*).
- Ve vlastních třídách: můžete implementovat vlastní vícedimenzionální indexaci nebo doménově specifický dotazovací jazyk (DSL).
