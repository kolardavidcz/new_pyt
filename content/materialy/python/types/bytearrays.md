<!-- slide: id1, Úvod, Core, resyntax -->
## Úvod do `bytearray`: Měnitelná binární pole

Typ **`bytearray`** je měnitelný (*mutable*) sekvenční datový typ, jehož prvky jsou celá čísla v rozsahu $0 \le x \le 255$ (reprezentující jednotlivé 8bitové bajty).

Vztah mezi binárními typy:
- **`bytes`**: Neměnný (*immutable*) bajtový řetězec — analogie k textovému řetězci `str`.
- **`bytearray`**: Měnitelná (*mutable*) sekvence bajtů — analogie k seznamu čísel `list[int]`, ale uložena kompaktně v souvislém bloku paměti ($1\text{ bajt na prvek}$ bez režie Python objektů).

Hlavní výhody:
- Možnost in-place modifikace binárních dat (např. přepisování hlaviček paketů nebo šifrování).
- Nulová alokace nových objektů při změně jednotlivých bajtů.
- Podpora Python Buffer Protocolu pro přímé předávání do C knihoven.

---
<!-- slide: id2, Zavedení – „bytearray()“, Core, pythonic -->
## Inicializace: Konstruktor `bytearray()`

Podobně jako `bytes()` lze `bytearray()` vytvořit několika způsoby:

```python
# 1. Prázdné bajtové pole (délka 0):
ba1 = bytearray()
print(ba1)
# bytearray(b'')

# 2. Z textového řetězce (vyžaduje povinné kódování):
ba2 = bytearray("Ahoj!", encoding="utf-8")
print(ba2)
# bytearray(b'Ahoj!')

# 3. Z celého čísla: Alokuje buffer dané velikosti naplněný nulami (0x00):
ba3 = bytearray(5)
print(ba3)
# bytearray(b'\x00\x00\x00\x00\x00')

# 4. Z iterovatelného objektu celých čísel (0 až 255):
ba4 = bytearray([65, 66, 67, 10])  # 'A', 'B', 'C', '\n'
print(ba4)
# bytearray(b'ABC\n')

# 5. Ze stávajícího objektu bytes:
ba5 = bytearray(b'STMP')
```

---
<!-- slide: id3, Bajtová pole jako sekvence, Core, basics -->
## `bytearray` jako sekvence: Indexace a řezy

Z pohledu čtení podporuje `bytearray` veškeré standardní sekvenční operace:

```python
ba = bytearray(b'ahoj')

# 1. Délka v bajtech:
print(len(ba))
# 4

# 2. Indexace jednotlivého prvku vrací int (0 až 255):
print(ba[0])
# 97 (ASCII kód pro 'a')

# 3. Řezy (slicing) vracejí nový objekt bytearray:
print(ba[1:3])
# bytearray(b'ho')

# 4. Test přítomnosti (lze testovat celé číslo i podřetězec bytes):
print(97 in ba)      # True
print(b'ho' in ba)   # True

# 5. Vyhledání pozice a četnost:
print(ba.index(b'o'))  # 2
print(ba.count(b'a'))  # 1
```

---
<!-- slide: id4, Bajtová pole jako sekvence – „for-in“, Skip, basics -->
## Procházení smyčkou `for-in`

Při iteraci přes `bytearray` získáváme jednotlivé bajty jako obyčejná celá čísla `int`:

```python
ba = bytearray(b'Ahoj')

# Přímá iterace
for b in ba:
    print(f"Byte: {b:3d} | Hex: 0x{b:02x} | Znak: {chr(b)}")
# Byte:  65 | Hex: 0x41 | Znak: A
# Byte: 104 | Hex: 0x68 | Znak: h
# Byte: 111 | Hex: 0x6f | Znak: o
# Byte: 106 | Hex: 0x6a | Znak: j

# Iterace pozpátku
for b in reversed(ba):
    pass

# Seřazení bajtů (vrací list[int])
sorted_bytes = sorted(ba)
```

---
<!-- slide: id5, Bajtová pole jako měnitelné sekvence, Core, resyntax -->
## Měnitelnost v praxi: In-place přepisování hodnot

Hlavní síla `bytearray` spočívá v přímé modifikaci jednotlivých bajtů nebo celých rozsahů:

```python
ba = bytearray(b'ahoj')

# 1. Změna jednoho bajtu (přiřazujeme int 0..255):
ba[0] = 65  # ASCII kód pro velké 'A'
print(ba)
# bytearray(b'Ahoj')

# 2. Změna celého řezu (přiřazujeme objekt typu bytes nebo bytearray):
ba[1:4] = b'HOJ!'
print(ba)
# bytearray(b'AHOJ!')
```

> [!WARNING]
> Při přiřazení do indexu musíte předat celé číslo `int` v intervalu $\langle 0, 255 \rangle$:
> ```python
> ba[0] = b'X'     # TypeError: an integer is required
> ba[0] = 300      # ValueError: byte must be in range(0, 256)
> ```

---
<!-- slide: id6, Bajtová pole – přidávání prvků, Skip, basics -->
## Dynamické rozšiřování: `append()`, `insert()` a `extend()`

Stejně jako u seznamu `list` můžeme velikost bajtového pole za běhu zvětšovat:

```python
ba = bytearray(b'Python')

# 1. append(int): Přidání jednoho bajtu na konec
ba.append(33)  # '!'
print(ba)
# bytearray(b'Python!')

# 2. insert(index, int): Vložení bajtu na danou pozici
ba.insert(0, 62)  # '>'
print(ba)
# bytearray(b'>Python!')

# 3. extend(bytes): Připojení celé sekvence bajtů
ba.extend(b' 3.12')
print(ba)
# bytearray(b'>Python! 3.12')

# 4. Operátor +=
ba += b' rocks'
```

---
<!-- slide: id7, Bajtová pole – odebírání prvků, Skip, basics -->
## Odebírání prvků: `del`, `pop()` a `remove()`

Zkracování a mazání bajtů z bafru:

```python
ba = bytearray(b'Hello World!')

# 1. del ba[index] nebo del ba[slice]
del ba[-1]     # Smaže vykřičník
print(ba)      # bytearray(b'Hello World')

del ba[5:]     # Ořízne na prvních 5 bajtů
print(ba)      # bytearray(b'Hello')

# 2. pop([index]): Odebere a vrátí hodnotu bajtu (int)
posledni = ba.pop()
print(f"Odebrán bajt: {posledni} ('{chr(posledni)}')")
# Odebrán bajt: 111 ('o')

# 3. remove(int): Odstraní první výskyt dané hodnoty
ba.remove(108) # Smaže první výskyt 'l'
print(ba)
# bytearray(b'Hel')
```
