<!-- slide: id=id1 title="Výhody a nevýhody DOMu" tags="Core" diff="paradigm" -->
## Zpracování XML: Výhody a limity stromového modelu (DOM)

Při práci s XML dokumenty se standardně setkáváme se dvěma protikladnými přístupy: **stromovým (DOM)** a **proudovým/událostním (SAX / StAX / iterparse)**.

### Model DOM (*Document Object Model*):
- **Princip**: Celý XML dokument je přečten z disku a v paměti RAM je vybudován kompletní strom uzlů (elementy, atributy, texty).
- **Výhody**:
  - Libovolný náhodný přístup ke kterémukoli elementu kdykoliv.
  - Možnost vyhledávání pomocí **XPath** dotazů a provádění **XSLT** transformací.
  - Jednoduchá modifikace stromu (přidávání, přesouvání a mazání uzlů) a následné uložení.
- **Nevýhody**:
  - **Obrovská paměťová náročnost**: Vnitřní stromové objekty zabírají v RAM typicky 5× až 10× více místa, než je velikost samotného souboru na disku. U souborů o velikosti stovek megabajtů či gigabajtů (databázové exporty, biologické databáze) vede k vyčerpání paměti (*Out of Memory*).

---
<!-- slide: id=id2 title="Enter SAX" tags="Skip" diff="basics" -->
## Proudový přístup: Enter SAX

Pokud nepotřebujeme navigovat napříč celým dokumentem sem a tam, ale stačí nám dokument lineárně projít (např. vyfiltrovat určité záznamy, spočítat statistiky nebo transformovat data do jiného formátu), je stromový model zbytečným plýtváním.

V takovém případě nastupuje **SAX** (*Simple API for XML*):
- **Lineární čtení**: Dokument se čte sekvenčně od prvního do posledního bajtu v malých blocích.
- **Minimální paměťová náročnost**: Paměťová složitost je $O(1)$ vůči celkové velikosti souboru – v paměti se nachází vždy pouze právě zpracovávaný kousek.
- **Maximální rychlost**: Odpadá režie na alokaci milionů drobných objektů pro každý uzel stromu.

---
<!-- slide: id=id3 title="Princip" tags="Core" diff="newconcept" -->
## Princip událostního zpracování (Push Parser)

SAX funguje jako tzv. **událostmi řízený parser** (*event-driven push parser*):

1. Parser čte proud bajtů z XML souboru.
2. Jakmile narazí na syntaktickou strukturu XML, vyvolá příslušnou událost (*callback*):
   - **Začátek elementu**: nalezena otevírací značka `<uzel attr="val">`.
   - **Konec elementu**: nalezena uzavírací značka `</uzel>`.
   - **Znaková data**: textový obsah uvnitř elementu.
   - **Komentáře a procesní instrukce**.
3. Programátor dodá obslužnou třídu (*Handler*), jejíž metody parser automaticky volá při vzniku jednotlivých událostí.

```text
[XML Soubor] ──> [SAX Parser] ──(události: startElement, characters, endElement)──> [Váš ContentHandler]
```

---
<!-- slide: id=id4 title="Načítání XML v Python'u" tags="Core" diff="pythonic" -->
## Rozhraní `xml.sax.ContentHandler` v Pythonu

V Pythonu je obsluha realizována děděním od bázové třídy **`xml.sax.ContentHandler`**:

```python
import xml.sax

class MyHandler(xml.sax.ContentHandler):
    def startElement(self, name: str, attrs):
        """Voláno při otevření elementu <name key="val">."""
        pass

    def endElement(self, name: str):
        """Voláno při uzavření elementu </name>."""
        pass

    def characters(self, content: str):
        """Voláno pro textový obsah uvnitř elementu."""
        pass
```

### Práce s atributy (`attrs`):
Objekt `attrs` implementuje rozhraní mapování (slovníku):
- `attrs.getValue('attr_name')` nebo `attrs.get('attr_name', default)`
- `attrs.items()` – iterace přes dvojice `(klíč, hodnota)`
- `len(attrs)` – počet atributů

```python
for key, value in attrs.items():
    print(f"Atribut {key} = {value}")
```

> [!NOTE]
> Není nutné implementovat všechny metody – stačí přepsat pouze ty, které pro daný úkol potřebujete. Pokud vás zajímají pouze atributy otevíracích značek, definujete jen `startElement()`.

---
<!-- slide: id=id5 title="Ukázka" tags="Core" diff="pythonic" -->
## Základní použití SAX parseru

Konkrétní použití handleru s funkcí `xml.sax.parse()`:

```python
import xml.sax
from io import StringIO

xml_data = """<?xml version="1.0" encoding="utf-8"?>
<knihovna>
    <kniha isbn="978-80-251-1234-5">
        <titul>Ponořme se do Pythonu 3</titul>
        <autor>Mark Pilgrim</autor>
    </kniha>
</knihovna>
"""

class SimplePrinterHandler(xml.sax.ContentHandler):
    def startElement(self, name: str, attrs):
        print(f"START: <{name}> Atributy: {dict(attrs)}")

    def endElement(self, name: str):
        print(f"END:   </{name}>")

    def characters(self, content: str):
        text = content.strip()
        if text:
            print(f"TEXT:  {text}")

# Spuštění parseru nad souborem nebo streamem:
handler = SimplePrinterHandler()
xml.sax.parse(StringIO(xml_data), handler)
```

Výstup na konzoli:
```plain
START: <knihovna> Atributy: {}
START: <kniha> Atributy: {'isbn': '978-80-251-1234-5'}
START: <titul> Atributy: {}
TEXT:  Ponořme se do Pythonu 3
END:   </titul>
START: <autor> Atributy: {}
TEXT:  Mark Pilgrim
END:   </autor>
END:   </kniha>
END:   </knihovna>
```

---
<!-- slide: id=id6 title="Poznámky a srovnání s moderním `iterparse`" tags="Tricky" diff="newconcept" -->
## Úskalí SAX a moderní alternativa `iterparse`

### Omezení klasického SAXu:
1. **Jednosměrnost**: Nelze se vrátit zpět. Pokud v půlce dokumentu zjistíte, že potřebujete hodnotu z předchozího uzlu, musíte si ji buď předem uložit do vlastního stavu, nebo dokument parsovat znovu.
2. **Bezstavovost**: Parser neuchovává informaci o hierarchii ani o rodičích aktuálního uzlu. Pokud chcete vědět, zda je element `<cena>` uvnitř `<kniha>` nebo `<faktura>`, musíte si sami spravovat zásobník předků (*stack*).
3. **Fragmentace textu**: Metoda `characters()` může být pro jeden dlouhý textový uzel zavolána vícekrát po sobě v malých kouscích (chuncích), takže text je nutné akumulovat.

### Moderní Pythonic alternativa: `xml.etree.ElementTree.iterparse()`

Moderní Python nabízí elegantní kombinaci paměťové nenáročnosti a pohodlí DOMu pomocí generátoru **`iterparse`**:

```python
import xml.etree.ElementTree as ET

# Čtení obřích souborů s O(1) pamětí:
for event, elem in ET.iterparse("velka_databaze.xml", events=("end",)):
    if elem.tag == "kniha":
        titul = elem.findtext("titul")
        print("Kniha:", titul)
        # Klíčový krok: uvolnění elementu z paměti!
        elem.clear()
```

---
<!-- slide: id=id7 title="Příklad – reprodukce stromečkové struktury" tags="Already Studied" diff="pythonic" -->
## Příklad: Rekonstrukce stromečkové struktury s odsazením

Pro sledování zanoření si v handleru udržujeme čítač úrovně `self._level`:

```python
import xml.sax

class TreeIndentHandler(xml.sax.ContentHandler):
    def __init__(self):
        super().__init__()
        self._level = 0

    def startElement(self, name: str, attrs):
        self._level += 1
        attrs_str = ""
        if len(attrs) > 0:
            attrs_str = " { " + ", ".join(f'{k}="{v}"' for k, v in attrs.items()) + " }"
        indent = "  " * self._level
        print(f"{indent}<{name}{attrs_str}>")

    def endElement(self, name: str):
        indent = "  " * self._level
        print(f"{indent}</{name}>")
        self._level -= 1

xml_source = """<koren>
    <hlavicka jazyk="cze">Nadpis dokumentu v češtině</hlavicka>
    <hlavicka jazyk="eng">English title</hlavicka>
    <para>Tady je první odstavec s textem.</para>
    <obrazek zdroj="obrazky/obr1.jpg" nazev="Obrázek mezi odstavci."/>
</koren>"""

from io import StringIO
handler = TreeIndentHandler()
xml.sax.parse(StringIO(xml_source), handler)
```

Výstup zachovává vizuální hierarchii stromu s odpovídajícím odsazením značek a atributů.
