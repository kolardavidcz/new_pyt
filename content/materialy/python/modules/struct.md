<!-- slide: id1, Úvod, Core, newconcept -->
## Úvod do modulu `struct`: Nízkoúrovňová binární data

Standardní modul **`struct`** slouží k obousměrnému převodu mezi hodnotami v Pythonu (čísla, řetězce, booleany) a céčkovskými binárními strukturami uloženými v objektech `bytes` nebo `bytearray`.

Typické scénáře využití:
1. **Zpracování binárních souborových formátů**: Parsování hlaviček a bloků v PNG, JPEG, WAV, MP3, ZIP nebo ELF/PE souborech.
2. **Síťové protokoly**: Kódování a dekódování binárních paketů (TCP/IP sockety, DNS zprávy, Bluetooth, sériové linky).
3. **C-FFI komunikace**: Sestavování paměťových struktur pro předání céčkovským knihovnám (`ctypes`, Cython).

```python
import struct
```

> [!NOTE]
> Modul `struct` přesně replikuje paměťové rozložení zkompilovaných struktur v C (včetně zarovnání bajtů a endianity).

---
<!-- slide: id2, Motivační příklad, WOW, pythonic -->
## Motivační příklad: Parsování hlavičky PNG

Ukažme si praktickou ukázku: Každý blok (*chunk*) v souboru PNG začíná 4bajtovým celým číslem udávajícím délku dat.

Mějme čtveřici bajtů `b'\x00\x00\x01\x4d'`. Kolik bajtů tato data zabírají?
Podle specifikace PNG jsou všechna vícebajtová čísla uložena v pořadí **Big-Endian** (nejvýznamnější bajt je první) jako 32bitový unsigned integer:

```python
import struct

delka_bytes = b'\x00\x00\x01\x4d'

# Rozbalení 4 bajtů jako Big-Endian unsigned int (znak >I)
vysledek = struct.unpack('>I', delka_bytes)

print(vysledek)
# (333,)

delka = vysledek[0]
print(f"Délka datového chunku: {delka} B")
# Délka datového chunku: 333 B
```

> [!IMPORTANT]
> Funkce `struct.unpack()` **vždy vrací n-tici (`tuple`)**, i když rozbalujete pouze jediné číslo! Důvodem je konzistence, neboť formátovací řetězec může obsahovat libovolný počet polí.

---
<!-- slide: id3, Formátovací řetězec, Core, resyntax -->
## Formátovací řetězec (*Format String*)

**Formátovací řetězec** předepisuje, jak přesně interpretovat proud bajtů:

Skládá se ze dvou částí:
1. **Volitelný první znak (Předpona)**: Určuje **pořadí bajtů (endianitu)**, standardní vs. přirozenou velikost typů a paměťové zarovnání (*alignment*).
2. **Následující formátovací znaky**: Určují sekvenci datových typů (celá čísla, floaty, znaky, pole bajtů).

```python
# Příklad: Síťový paket (Big-Endian) obsahující:
# 1 bajt (typ zprávy) + 2 bajty (ID klienta) + 4 bajty float (naměřená teplota)
fmt = '!BHf'
```

Rozbalení lze provádět buď jednorázově (`unpack`), nebo iteračně přes opakující se záznamy (`iter_unpack`).

---
<!-- slide: id4, Pořadí bajtů, velikost a zarovnání, Core, resyntax -->
## Pořadí bajtů (*Endianness*) a paměťové zarovnání

Předponový znak určuje chování překladače vůči hardwaru:

| Znak | Pořadí bajtů (*Endianness*) | Velikost typů | Zarovnání (*Alignment*) |
|:---:|:---|:---|:---|
| `@` | Přirozené (*native*) systému | Nativní dle C překladače | Nativní se zarovnávacími výplněmi |
| `=` | Přirozené (*native*) systému | Standardní definované velikosti | Žádné (kompaktní, bez výplní) |
| `<` | **Little-Endian** (x86, ARM) | Standardní | Žádné (kompaktní) |
| `>` | **Big-Endian** (Motorola, Network) | Standardní | Žádné (kompaktní) |
| `!` | **Síťové pořadí** (= Big-Endian) | Standardní | Žádné (kompaktní) |

> [!WARNING]
> Pokud předponu vynecháte, použije se výchozí `@` (nativní C zarovnání). Pro binární soubory a síťovou komunikaci **vždy explicitně uveďte `<` (Little-Endian) nebo `>` / `!` (Big-Endian)**!

---
<!-- slide: id5, Poznámka, Skip, basics -->
## Zjištění vlastností aktuální platformy

Chcete-li ověřit hardwarové nastavení běžícího interpretu:

```python
import sys
import struct

# Nativní byteorder procesoru ('little' na x86_64 i ARM Apple Silicon)
print("Byteorder:", sys.byteorder)
# Byteorder: little

# Velikost C ukazatele void* v bajtech (4 na 32bit, 8 na 64bit):
ptr_size = struct.calcsize('P')
print(f"Architektura: {ptr_size * 8}-bit (velikost pointeru: {ptr_size} B)")
# Architektura: 64-bit (velikost pointeru: 8 B)
```

---
<!-- slide: id6, Příznaky překladu, Core, resyntax -->
## Přehled formátovacích znaků

| Znak | C typ | Python typ | Bytů |
|:---:|:---|:---|:---:|
| `x` | Pad byte (výplň) | *žádný* | 1 |
| `c` | `char` | `bytes` o délce 1 | 1 |
| `b` / `B` | `signed char` / `unsigned char` | `int` | 1 |
| `?` | `_Bool` | `bool` | 1 |
| `h` / `H` | `short` / `unsigned short` | `int` | 2 |
| `i` / `I` | `int` / `unsigned int` | `int` | 4 |
| `l` / `L` | `long` / `unsigned long` | `int` | 4 |
| `q` / `Q` | `long long` / `unsigned long long` | `int` | 8 |
| `f` | `float` (IEEE 754 single) | `float` | 4 |
| `d` | `double` (IEEE 754 double) | `float` | 8 |
| `s` | `char[]` | `bytes` | n |
| `p` | `char[]` (Pascal string, první byte je délka) | `bytes` | n |
| `P` | `void *` (ukazatel) | `int` | 4 nebo 8 |

---
<!-- slide: id7, Příznaky překladu – násobnost, Tricky, resyntax -->
## Násobnost formátovacích znaků: Číslování a řetězce

Opakování stejného typu lze zkrátit celým číslem před znakem:
- `'hhhh'` je ekvivalentní zápisu `'4h'` (čtyři 16bitová celá čísla).
- `'16B'` je 16 jednobajtových celých čísel (vrátí 16 samostatných intů v tuplu).

### Zvláštní chování pro textové bajty `s` a znaky `c`:
- `'4c'` reprezentuje **čtyři samostatné jednobajtové znaky**: rozbalí se do čtyř hodnot `(b'a', b'b', b'c', b'd')`.
- `'4s'` reprezentuje **jediný 4bajtový blok `bytes`**: rozbalí se do jedné hodnoty `(b'abcd',)`.

```python
import struct

raw = b'ABCD'
print(struct.unpack('4c', raw))
# (b'A', b'B', b'C', b'D')

print(struct.unpack('4s', raw))
# (b'ABCD',)
```

---
<!-- slide: id8, Třída „struct.Struct“, Core, pythonic -->
## Třída `struct.Struct`: Znovupoužitelné kompilované schéma

Pokud stejný formátovací řetězec používáte opakovaně (například v cyklu při čtení velkého souboru), opakované volání modulových funkcí `struct.pack()` a `struct.unpack()` zbytečně znovu parsuje formátovací řetězec.

Třída **`struct.Struct`** formát předkompiluje do efektivního interního objektu:

```python
import struct

# Zkompilování binárního schématu
point_struct = struct.Struct('<iid')  # x (int), y (int), dist (double), little-endian

print("Velikost struktury v paměti:", point_struct.size, "B")
# Velikost struktury v paměti: 16 B

# Zabalení do bajtů
data = point_struct.pack(10, 20, 22.36)

# Rozbalení
x, y, dist = point_struct.unpack(data)
print(f"Bod: [{x}, {y}], vzdálenost: {dist:.2f}")
# Bod: [10, 20], vzdálenost: 22.36
```

> [!TIP]
> Předkompilovaný objekt `Struct` je analogií k `re.compile()` u regulárních výrazů.

---
<!-- slide: id9, „pack()“ & „unpack()“, Core, basics -->
## Funkce `struct.pack()` a `struct.unpack()`

Základní dvojice funkcí pro serializaci a deserializaci:

```python
import struct

# 1. Zabalení: char + long v Big-Endian a Little-Endian
b_be = struct.pack('>cl', b'j', 1)
print(b_be)
# b'j\x00\x00\x00\x01'

b_le = struct.pack('<cl', b'j', 1)
print(b_le)
# b'j\x01\x00\x00\x00'

# 2. Rozbalení:
znak, cislo = struct.unpack('>cl', b_be)
print(f"Znak: {znak}, Číslo: {cislo}")
# Znak: b'j', Číslo: 1
```

Při pokusu o rozbalení dat jiné délky, než jakou vyžaduje formátovací řetězec, funkce vyvolá výjimku `struct.error`.

---
<!-- slide: id10, Poznámka k zarovnání, Tricky, newconcept -->
## Paměťové zarovnání (*Padding*) v nativním režimu

V nativním režimu (`@`) C kompilátor zarovnává datové typy na násobky jejich velikosti kvůli výkonu CPU sběrnice:

```python
import struct

# Nativní formát char + long na 64-bitové architektuře:
# 'c' (1 byte) + 7 výplňových bajtů paddingu + 'l' (8 bajtů) = 16 bajtů!
native_data = struct.pack('@cl', b'j', 1)
print("Délka nativního '@cl':", len(native_data), "B")
print(native_data)
# Délka nativního '@cl': 16 B
# b'j\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00\x00'

# Standardní kompaktní režim '<cl' bez paddingu:
compact_data = struct.pack('<cl', b'j', 1)
print("Délka kompaktního '<cl':", len(compact_data), "B")
print(compact_data)
# Délka kompaktního '<cl': 9 B
# b'j\x01\x00\x00\x00'
```

> [!NOTE]
> Vynutit zarovnání na konkrétní hranici lze v nativním formátu pomocí `0Příznak` na konci, např. `'lc0l'`.

---
<!-- slide: id11, „calcsize()“ & „format“ a „size“, Skip, basics -->
## Zjištění velikosti struktury: `calcsize()`

Funkce `struct.calcsize(fmt)` spočítá, kolik bajtů zabere libovolný formátovací řetězec:

```python
import struct

# Kompaktní Little-Endian: 4 + 4 + 8 = 16 B
print(struct.calcsize('<iid'))
# 16

# Nativní zarovnání může být odlišné:
print(struct.calcsize('@cl'))   # 16 (kvůli zarovnání)
print(struct.calcsize('<cl'))   # 9 (bez zarovnání)

# U objektu Struct je velikost dostupná jako atribut size:
s = struct.Struct('>HHI')
print("Atribut format:", s.format)  # '>HHI'
print("Atribut size:", s.size)      # 8
```

---
<!-- slide: id12, „iter_unpack()“, WOW, pythonic -->
## Iterační rozbalování: `struct.iter_unpack()`

Pokud máte v paměti velký souvislý blok bajtů obsahující tisíce po sobě jdoucích identických struktur (např. body 3D mračna, časová měření z osciloskopu), nemusíte soubor krájet na kousky pomocí slice:

Metoda **`struct.iter_unpack()`** generuje iterátor rozbalených n-tic bez alokace mezilehlých objektů:

```python
import struct

# Vygenerujeme binární proud 3 po sobě jdoucích záznamů: (int16, int32)
data = struct.pack('>hIhIhI', 1, 100, 2, 200, 3, 300)
print(f"Celková délka dat: {len(data)} B")

# Elegantní průchod záznam po záznamu:
for record_id, value in struct.iter_unpack('>hI', data):
    print(f"Záznam ID: {record_id}, Hodnota: {value}")

# Záznam ID: 1, Hodnota: 100
# Záznam ID: 2, Hodnota: 200
# Záznam ID: 3, Hodnota: 300
```

---
<!-- slide: id13, „pack_into()“ & „unpack_from()“, WOW, newconcept -->
## Práce s paměťovým bafrem: `pack_into()` a `unpack_from()`

Pro maximální výkon a zamezení zbytečného vytváření nových objektů `bytes` (které jsou v Pythonu neměnné – *immutable*) podporuje modul `struct` zápis přímo do měnitelného binárního bafru (`bytearray`, `memoryview` nebo `ctypes` buffer):

```python
import struct

# 1. Alokujeme měnitelný buffer o délce 20 bajtů
buf = bytearray(20)

# 2. Zápis do bafru na konkrétní offset (např. od indexu 4):
# pack_into(fmt, buffer, offset, *values)
struct.pack_into('>4s h f', buf, 4, b'TEMP', 42, 36.6)

print("Obsah bafru:", bytes(buf))
# b'\x00\x00\x00\x00TEMP\x00*\x42\x12\x66\x66\x00\x00\x00\x00\x00\x00'

# 3. Čtení z bafru od daného offsetu bez kopírování:
# unpack_from(fmt, buffer, offset=0)
tag, cislo, teplota = struct.unpack_from('>4s h f', buf, 4)
print(f"Rozbaleno z offsetu 4: {tag.decode()}, {cislo}, {teplota:.1f}")
# Rozbaleno z offsetu 4: TEMP, 42, 36.6
```

---
<!-- slide: id14, „struct.error“, Skip, basics -->
## Ošetření chyb: `struct.error`

Veškeré chyby vzniklé při balení a rozbalování vyvolávají výjimku **`struct.error`**:

```python
import struct

try:
    # 1. Pokus o rozbalení příliš krátkého proudu bajtů (potřebujeme 4 B pro 'i')
    struct.unpack('>i', b'\x00\x01')
except struct.error as e:
    print(f"Chyba: {e}")
    # Chyba: unpack requires a buffer of 4 bytes

try:
    # 2. Číslo přetékající rozsah daného typu (short má max 32767)
    struct.pack('>h', 100_000)
except struct.error as e:
    print(f"Chyba: {e}")
    # Chyba: 'h' format requires -32768 <= number <= 32767
```
