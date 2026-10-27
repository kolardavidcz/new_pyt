<!-- slide: id1, ASCII standard a řídicí znaky, Core, basics -->
## Historie kódování: Standard ASCII

Počátkem digitální éry vznikl standard **ASCII** (*American Standard Code for Information Interchange*), schválený v roce 1963.

ASCII definuje tabulku **128 znaků** (hodnoty $0$ až $127$, tj. hexadecimálně `0x00` až `0x7F`). K jejich uložení stačí **7 bitů**:

- **Kódy 0–31 a 127**: **Řídicí znaky** (*control characters*) pocházející z éry dálnopisů:
  - `0x07` (`\a`): Zvonek (*Bell* / alert)
  - `0x08` (`\b`): Krok zpět (*Backspace*)
  - `0x09` (`\t`): Horizontální tabulátor (*Tab*)
  - `0x0A` (`\n`): Odřádkování (*Line Feed*, LF)
  - `0x0D` (`\r`): Návrat vozíku (*Carriage Return*, CR)
- **Kódy 32–126**: **Tisknutelné znaky** (mezera, interpunkce, číslice `0-9`, velká `A-Z` a malá `a-z` písmena anglické abecedy).

---
<!-- slide: id2, Rozšířené ASCII (8bitová kódování), Skip, basics -->
## Rozšířené ASCII (8bitová éra)

Protože se počítačová paměť standardizovala na **8bitové bajty** ($2^8 = 256$ hodnot), zůstalo v bajtu volných dalších 128 pozic (kódy $128$ až $255$, `0x80` až `0xFF`).

Výrobci počítačů zaplnili tuto horní polovinu různými znaky:
- **IBM PC (OEM kódová stránka 437)**: Rámečky pro pseudografická menu v DOSu, matematické symboly a vybraná evropská písmena.
- Neexistoval však žádný jednotný mezinárodní konsenzus – různé země a výrobci vytvořili stovky vzájemně nekompatibilních tabulek.

---
<!-- slide: id3, Bajty vs. znaky, Skip, basics -->
## Bajty vs. znaky

Zásadní princip počítačového zpracování textu:

> [!IMPORTANT] Počítač nezná písmena, zná pouze čísla!
> - **Bajt** (*byte*) je 8bitové číslo od $0$ do $255$.
> - **Znak** (*character*) je abstraktní lidský symbol (písmeno 'A', číslice '5', české 'ř', emoji '🐍').
> - **Kódování** (*encoding*) je předpis (překladová tabulka), jak převést abstraktní znaky na konkrétní sekvenci bajtů a naopak.

V jednobajtových kódováních platí rovnice: **$1\text{ znak} = 1\text{ bajt}$**. To však omezuje celou abecedu na maximálně 256 různých znaků.

---
<!-- slide: id4, Kódové stránky a chaos 90. let, Skip, basics -->
## Kódové stránky a chaos 90. let

Pro podporu národních jazyků vznikly desítky tzv. **kódových stránek** (*Code Pages*).

Všechny zachovaly prvních 128 znaků ASCII (anglický text byl vždy čitelný), ale znaky s diakritikou (kódy 128–255) namapovaly odlišně.

### Srovnání kódování českého slova `svět`:
| Znak | ASCII kód | ISO 8859-2 (Latin 2) | Windows-1250 (CP1250) | CP852 (DOS) | MacCE (Apple) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| `s` | `0x73` | `73` | `73` | `73` | `73` |
| `v` | `0x76` | `76` | `76` | `76` | `76` |
| **`ě`** | — | **`EC`** | **`EC`** | **`D8`** | **`9E`** |
| `t` | `0x74` | `74` | `74` | `74` | `74` |

Pokud jste otevřeli text z DOSu (CP852) ve Windows (CP1250), písmeno `ě` (`0xD8`) se zobrazilo jako přeškrtnuté `Ř`. Tomuto jevu se říká **mojibake** (*rozsypaný čaj*).

---
<!-- slide: id5, Problém vícejazyčných dokumentů, Skip, basics -->
## Problém vícejazyčných dokumentů

Jednobajtové kódové stránky měly fatální limitaci:
- V jednom dokumentu nebylo možné současně kombinovat latinku, azbuku, řečtinu a arabštinu.
- Pro východoasijská písma (čínština, japonština, korejština s desetitisíci znaky) jednobajtový systém nestačil vůbec a musely vzniknout neohrabané systémy proměnné délky (DBCS, Shift-JIS, EUC-KR).

S příchodem celosvětové sítě Internet v 90. letech se situace stala neudržitelnou.

---
<!-- slide: id6, Vznik standardu Unicode, Core, basics -->
## Řešení: Standard Unicode

Koncem 80. let zástupci firem Apple, Xerox a dalších založili **Unicode Consortium**.

Cíl: Vytvořit **jedinou univerzální znakovou sadu pro všechna písma světa** (živá, historická i umělá) a speciální symboly včetně emoji:

> *„Unicode provides a unique number for every character, no matter what the platform, no matter what the program, no matter what the language.“*

Dnes standard Unicode spravuje přes **150 000 znaků** pokrývajících moderní i klínová písma, hieroglyfy, matematické symboly a tisíce emoji.

---
<!-- slide: id7, Unicode Code Points, Core, newconcept -->
## Unicode Code Points

V Unicode má každý znak přiděleno jednoznačné nezáporné celé číslo zvané **Code Point** (kódový bod).

Zapisují se standardně v hexadecimální notaci s prefixem **`U+`**:
- `U+0041` $\implies$ latinské písmeno `'A'` (decimálně 65)
- `U+011B` $\implies$ české písmeno `'ě'` (decimálně 283)
- `U+03B1` $\implies$ řecké písmeno `'α'` (decimálně 945)
- `U+72FC` $\implies$ japonský kanji znak `'狼'` (vlk, decimálně 29436)
- `U+1F40D` $\implies$ emoji hada `'🐍'` (decimálně 128013)

Celkový rozsah Unicode je od `U+0000` do `U+10FFFF` (přes 1,1 milionu možných pozic).

---
<!-- slide: id8, Kódování Unicode v paměti a na disku, Core, newconcept -->
## Kódování: Jak uložit Code Points do bajtů?

Code Point je pouze abstraktní číslo. Jak jej ale zapsat do souboru či poslat po síti?

1. **UTF-32**: Každý znak uloží jako fixní 32bitové (4bajtové) číslo.
   - *Výhoda*: Snadné indexování $O(1)$.
   - *Nevýhoda*: Enormní plýtvání pamětí (anglický text zabere 4× více místa, plno nulových bajtů `\x00`).
2. **UTF-16**: Znaky základní roviny (BMP) ukládá do 2 bajtů, vyšší znaky přes páry náhradníků (*surrogate pairs*).
   - Používá se interně ve Windows API a v Java/JavaScript enginech.
   - *Problém Endianity*: Vyžaduje rozlišení pořadí bajtů (UTF-16 LE vs. BE) a značku **BOM** (*Byte Order Mark*, `0xFEFF`).

---
<!-- slide: id9, Kódování UTF-8 – Globální standard, Core, newconcept -->
## Kódování UTF-8: Globální standard

V roce 1992 navrhli Ken Thompson a Rob Pike (autoři Unixu a Go) kódování **UTF-8** (*8-bit Unicode Transformation Format*). Dnes dominuje celému webu (>98 % všech stránek).

### Geniální vlastnosti UTF-8:
1. **100% zpětná kompatibilita s ASCII**:
   - Každý platný ASCII soubor je bez jakékoliv změny zároveň platným UTF-8 souborem. Znaky 0–127 zabírají přesně **1 bajt**.
2. **Proměnná délka (1 až 4 bajty)**:
   - Anglický text nezabírá žádné místo navíc.
   - Evropská diakritika, řečtina, azbuka a arabština zabírají **2 bajty**.
   - Asijská písma (CJK) zabírají **3 bajty**.
   - Emoji a historická písma zabírají **4 bajty**.
3. **Nezávislost na endianitě**:
   - UTF-8 je proud jednotlivých bajtů – nepotřebuje BOM značku ani neřeší Little/Big Endian.

---
<!-- slide: id10, Algoritmus kódování UTF-8, WOW, newconcept -->
## Algoritmus kódování UTF-8

Podle nejvyšších bitů prvního bajtu engine okamžitě pozná, kolik bajtů daný znak zabírá:

| Rozsah Code Point | Počet bajtů | Bajt 1 | Bajt 2 | Bajt 3 | Bajt 4 |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `U+0000` – `U+007F` | 1 | `0xxxxxxx` | — | — | — |
| `U+0080` – `U+07FF` | 2 | `110xxxxx` | `10xxxxxx` | — | — |
| `U+0800` – `U+FFFF` | 3 | `1110xxxx` | `10xxxxxx` | `10xxxxxx` | — |
| `U+10000` – `U+10FFFF`| 4 | `11110xxx` | `10xxxxxx` | `10xxxxxx` | `10xxxxxx` |

- **Bajt začínající `0...`**: Samostatný ASCII znak.
- **Bajt začínající `110...` / `1110...` / `11110...`**: Úvodní bajt vícebajtového znaku (počet jedniček na začátku udává celkový počet bajtů).
- **Bajt začínající `10...`**: Pokračovací bajt (*continuation byte*). Pokud se čtení uprostřed souboru ztratí, okamžitě pozná hranici znaku!

---
<!-- slide: id11, Praktický rozpad: České slovo „svět“, Core, pythonic -->
## Praktický rozpad: České slovo „svět“ v UTF-8

Podívejme se na binární reprezentaci v Pythonu:

```python
>>> text = "svět"
>>> data = text.encode("utf-8")
>>> data
b'sv\xc4\x9bt'
>>> len(text)
4  # 4 znaky
>>> len(data)
5  # 5 bajtů!
```

### Rozpad po bajtech:
- `'s'` $\implies$ `0x73` (ASCII kód 115, `01110011` $\implies$ 1 bajt)
- `'v'` $\implies$ `0x76` (ASCII kód 118, `01110110` $\implies$ 1 bajt)
- `'ě'` $\implies$ `U+011B` (Code Point 283 $\implies$ spadá do 2bajtového rozsahu):
  - Binárně $283 = 00000001 \; 00011011_2$
  - Podle šablony `110xxxxx 10xxxxxx`:
    - Bajt 1: `110` + `00100` $\implies$ `11000100` (`0xC4`)
    - Bajt 2: `10` + `011011` $\implies$ `10011011` (`0x9B`)
- `'t'` $\implies$ `0x74` (ASCII kód 116, `01110100` $\implies$ 1 bajt)

---
<!-- slide: id12, Praktický rozpad: Japonský znak „狼“, Skip, pythonic -->
## Praktický rozpad: Japonský znak „狼“

Prohlédněme si 3bajtový znak kanji `狼` (*ookami* = vlk):

```python
>>> znak = "狼"
>>> bajty = znak.encode("utf-8")
>>> bajty
b'\xe7\x8b\xbc'
>>> len(bajty)
3
```

Hexadecimální bajty `0xE7 0x8B 0xBC` binárně:
- Bajt 1: `11100111` (předpona `1110` značí 3bajtový znak, data: `0111`)
- Bajt 2: `10001011` (předpona `10`, data: `001011`)
- Bajt 3: `10111100` (předpona `10`, data: `111100`)

Spojením datových bitů:
$$0111 \; 001011 \; 111100_2 = 29436_{10} = \text{U+72FC}$$
Což přesně odpovídá oficiálnímu Unicode Code Pointu pro znak `狼`.

---
<!-- slide: id13, Unicode v operačních systémech a BOM, Skip, basics -->
## BOM (Byte Order Mark) a UTF-8

Sekvence bajtů `EF BB BF` je kód znaku `U+FEFF` (nezlomitelná mezera s nulovou šířkou) v kódování UTF-8.

Některé editory ve Windows (např. starý Notepad) vkládaly tuto sekvenci na začátek každého UTF-8 souboru jako tzv. **UTF-8 BOM**:

```python
# Běžné UTF-8:
# 'ahoj' -> b'ahoj'

# UTF-8 s BOM značkou:
# 'ahoj' -> b'\xef\xbb\xbfahoj'
```

> [!CAUTION] Problém s BOM v Pythonu a Linuxu
> V Linuxu způsobí BOM na začátku skriptu pád shebangu (`#!/usr/bin/env python3` se nepřečte správně).
> V Pythonu při čtení souboru s BOM pomocí `encoding='utf-8'` zůstane znak `\ufeff` na začátku prvního řádku.
> Pro automatické odstranění BOM použijte kódování **`encoding='utf-8-sig'`**.

---
<!-- slide: id14, Moderní Python 3 a Unicode, Tricky, newconcept -->
## Moderní Python 3 a Unicode (PEP 597 & PEP 686)

Python 3 od základů striktně odděluje text a data:

| Typ | Datový obsah | Příklad literálu |
| :--- | :--- | :--- |
| **`str`** | Sekvence abstraktních Unicode znaků | `"svět"`, `'🐍'` |
| **`bytes`** | Sekvence surových 8bitových bajtů ($0 \dots 255$) | `b'sv\xc4\x9bt'` |

```python
# Kódování textu na bajty:
bajtova_data = text.encode("utf-8")

# Dekódování bajtů na text:
puvodni_text = bajtova_data.decode("utf-8")
```

> [!TIP] Budoucnost: PEP 686 a Python 3.15
> V Pythonu 3.15+ bude UTF-8 výchozím kódováním pro všechny I/O operace na všech platformách (včetně Windows).
> Již dnes můžete tento režim zapnout proměnnou prostředí `PYTHONUTF8=1` nebo přepínačem `python -X utf8`.
