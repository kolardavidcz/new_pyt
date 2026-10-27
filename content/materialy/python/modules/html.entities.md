<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Úvod do modulu `html.entities`

Modul standardní knihovny **`html.entities`** poskytuje tabulky pro vzájemný převod mezi HTML entitami (např. `&copy;`, `&Aring;`), jejich odpovídajícími unicodovými znaky a číselnými body (*code-points*):

Základní datové struktury modulu:
- **`name2codepoint`**: Převod z textového názvu entity na ordinální hodnotu (*code-point*, např. `'Aring'` -> `197`).
- **`codepoint2name`**: Inverzní převod z celočíselného *code-pointu* na název entity (`197` -> `'Aring'`).
- **`entitydefs`**: Převod ze jména entity přímo na znakový řetězec (`'Aring'` -> `'Å'`).
- **`html5`** *(přidáno v moderním Pythonu)*: Kompletní slovník mapující všechny pojmenované entity standardu HTML5 (včetně víceslovných i zakončených bez středníku) přímo na Unicode znaky.

> [!NOTE]
> V moderních webových aplikacích obvykle nepoužíváme nízkoúrovňové slovníky přímo, ale voláme funkce vyšší úrovně **`html.escape()`** a **`html.unescape()`** z nadřazeného modulu `html`.

---
<!-- slide: id=id2 title="„name2codepoint“" tags="Skip" diff="basics" -->
## Slovník `name2codepoint`

Jádrem historického modulu je slovník `name2codepoint`, který obsahuje statickou tabulku XHTML 1.0 entit:

```python
import html.entities

# Definice v modulu (zkráceno):
# name2codepoint = {
#     'AElig':    0x00c6, # latin capital letter AE, U+00C6
#     'Aacute':   0x00c1, # latin capital letter A with acute, U+00C1
#     'Alpha':    0x0391, # greek capital letter alpha, U+0391
#     'Aring':    0x00c5, # latin capital letter A with ring above, U+00C5
#     ...
# }

codepoint = html.entities.name2codepoint['Aring']
print(codepoint)        # 197 (desítkově)
print(hex(codepoint))   # 0xc5 (šestnáctkově)
print(chr(codepoint))   # 'Å'
```

V interaktivním interpretu Pythonu lze předchozí hodnotu načíst proměnnou `_`:
```pycon
>>> import html.entities
>>> html.entities.name2codepoint['Aring']
197
>>> chr(_)
'Å'
```

---
<!-- slide: id=id3 title="„codepoint2name“" tags="Skip" diff="basics" -->
## Slovník `codepoint2name`

Slovník `codepoint2name` provádí inverzní operaci: z celočíselného kódu znaku (desítkového či hexadecimálního) vrátí název příslušné entity:

```python
import html.entities

# Vstupem je libovolná celočíselná reprezentace codepointu:
print(html.entities.codepoint2name[0x00c5])  # 'Aring'
print(html.entities.codepoint2name[0xc5])    # 'Aring'
print(html.entities.codepoint2name[197])     # 'Aring'

# Znak eura (€ je U+20AC, dec 8364)
print(html.entities.codepoint2name[ord('€')]) # 'euro'
```

Pokud pro daný Unicode znak entita neexistuje, vyvolá přístup pomocí `[]` výjimku `KeyError`:

```python
try:
    print(html.entities.codepoint2name[ord('č')])
except KeyError:
    print("Znak 'č' nemá pojmenovanou entitu v XHTML 1.0 (musí se zapsat číselně &#269;)")
```

---
<!-- slide: id=id4 title="„entitydefs“ a moderní `html5`" tags="Skip" diff="basics" -->
## Slovník `entitydefs` a moderní tabulka `html5`

Slovník `entitydefs` mapuje název entity přímo na jednoznakový řetězec:

```python
import html.entities

print(html.entities.entitydefs['Aring'])   # 'Å'
print(html.entities.entitydefs['copy'])    # '©'
print(html.entities.entitydefs['hearts'])  # '♥'
```

### Moderní alternativa: `html.unescape()` a `html.entities.html5`

V moderním Pythonu standardní knihovna pokrývá celou specifikaci HTML5:

```python
import html
import html.entities

# 1. Dekódování libovolného řetězce obsahujícího entity:
text = html.unescape("&copy; 2026 &bull; Antigravity &amp; Co.")
print(text)  # © 2026 • Antigravity & Co.

# 2. Kompletní HTML5 slovník (přes 2 000 pojmenovaných entit):
print(html.entities.html5['star;'])    # '⭐'
print(html.entities.html5['smile;'])   # '😄'
```

---
<!-- slide: id=id5 title="Implementace" tags="Core" diff="pythonic" -->
## Implementace modulu a čistota jmenného prostoru

Implementace modulu `html.entities` v CPythonu je vynikající ukázkou dynamické inicializace a správy globálního jmenného prostoru modulu (*namespace hygiene*):

```python
# Úryvek přímo ze standardní knihovny CPythonu:
codepoint2name = {}
entitydefs = {}

for (name, codepoint) in name2codepoint.items():
    codepoint2name[codepoint] = name
    entitydefs[name] = chr(codepoint)

# Důležitý krok: vyčištění pomocných proměnných!
del name, codepoint
```

### Proč je na konci `del name, codepoint`?
1. **Prevence znečištění namespace**: V Pythonu smyčka `for` nemaže svou řídicí proměnnou. Bez `del` by `html.entities.name` a `html.entities.codepoint` zůstaly v modulu jako veřejné globální proměnné ukazující na poslední zpracovaný prvek.
2. **Přehlednost pro IDE a `dir()`**: Uživatel modulu nebo automatický nástroj (type checker, auto-complete) vidí v nabídce pouze určené atributy.
3. **Alternativa v moderním Pythonu**: Dnes se v modulech často používá `__all__ = ['name2codepoint', 'codepoint2name', 'entitydefs', 'html5']`, které explicitně definuje veřejné rozhraní exportované při `from module import *`.
