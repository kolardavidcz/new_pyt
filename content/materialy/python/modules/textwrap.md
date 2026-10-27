<!-- slide: id=id1 title="Úvod" tags="Skip" diff="basics" -->
## Práce s textem: Modul `textwrap`

Při generování výstupů pro terminál, konzolových utilit (CLI) nebo formátování víceřádkových textů v Pythonu často narážíme na potřebu zalamovat odstavce na danou šířku, sjednocovat odsazení nebo zkracovat dlouhé řetězce.

Standardní knihovna Pythonu pro tyto účely nabízí modul **`textwrap`**:
- **Zalamování textu na pevnou šířku**: `wrap()` a `fill()`.
- **Inteligentní zkracování textu po celých slovech**: `shorten()`.
- **Správa odsazení víceřádkových řetězců**: `dedent()` a `indent()`.
- **Objektové jádro**: Třída `TextWrapper` s bohatou konfigurací.

---
<!-- slide: id=id2 title="Konstruktor „TextWrapper“" tags="Core" diff="pythonic" -->
## Třída `TextWrapper` a její parametry

Všechny funkce modulu jsou pohodlnými obálkami nad vnitřní třídou **`textwrap.TextWrapper`**:

```python
import textwrap

wrapper = textwrap.TextWrapper(
    width=70,                     # Maximální šířka řádku v počtu znaků
    expand_tabs=True, tabsize=4,  # Převod tabulátorů na mezery
    replace_whitespace=True,      # Náhrada \t, \n, \r za jednoduché mezery
    drop_whitespace=True,         # Odstranění přebytečných mezer na koncích řádků
    initial_indent="",            # Odsazení pouze prvního řádku (např. "    ")
    subsequent_indent="",         # Odsazení všech následujících řádků
    fix_sentence_endings=False,   # Dvě mezery za tečkou (podle staré typografie)
    break_long_words=True,        # Dělení slov delších než width
    break_on_hyphens=True,        # Dělení složených slov ve spojovníku
    max_lines=None,               # Maximální počet vygenerovaných řádků
    placeholder=" [...]"          # Text zástupce při překročení max_lines
)
```

---
<!-- slide: id=id3 title="„wrap(text, width=70, **kwargs)“" tags="Core" diff="pythonic" -->
## Rozdělení na řádky: `textwrap.wrap()`

Funkce **`wrap()`** vezme souvislý odstavec textu a rozdělí jej na **seznam řetězců** (`list[str]`), z nichž žádný nepřesáhne zadanou šířku:

```python
import textwrap

text = "Příliš žluťoučký kůň úpěl ďábelské ódy na bílém měsíčním svitu."

lines = textwrap.wrap(text, width=20)
print(lines)
```

Výstup (seznam jednotlivých řádků):
```python
[
    'Příliš žluťoučký',
    'kůň úpěl ďábelské',
    'ódy na bílém',
    'měsíčním svitu.'
]
```

Metoda dělí text v mezerách mezi slovy, takže nedochází k trhání slov uprostřed (pokud slovo není delší než celá šířka `width`).

---
<!-- slide: id=id4 title="„fill(text, width=70, **kwargs)“" tags="Core" diff="pythonic" -->
## Zformátovaný odstavec: `textwrap.fill()`

Funkce **`fill()`** funguje stejně jako `wrap()`, ale výstupní řádky rovnou spojí znakem nového řádku `\n`:

```python
import textwrap

text = "Příliš žluťoučký kůň úpěl ďábelské ódy na bílém měsíčním svitu."

formatted = textwrap.fill(text, width=20)
print(formatted)
```

Výstup na terminál:
```plain
Příliš žluťoučký
kůň úpěl ďábelské
ódy na bílém
měsíčním svitu.
```

> [!NOTE]
> Volání `textwrap.fill(text, w)` je ekvivalentem kódu `"\n".join(textwrap.wrap(text, w))`. Funkce automaticky normalizuje původní zalomení řádků uvnitř odstavce.

---
<!-- slide: id=id5 title="„shorten(text, width, **kwargs)“" tags="WOW" diff="pythonic" -->
## Inteligentní zkracování textu: `textwrap.shorten()`

Pokud potřebujeme zkrátit dlouhý titulek nebo popisek pro tabulku či UI, prosté uříznutí `text[:20]` může přeříznout slovo v půlce.

Metoda **`shorten()`** zkracuje text **na hranici celých slov** a přidá zástupný symbol:

```python
import textwrap

text = "Příliš   žluťoučký kůň úpěl     ďábelské ódy."

# 1. Zkrácení na max 25 znaků s výchozím placeholderem ' [...]':
print(textwrap.shorten(text, width=25))
# Výstup: 'Příliš žluťoučký [...]'

# 2. Vlastní elegantní zástupce (např. trojtečka '…'):
print(textwrap.shorten(text, width=25, placeholder="…"))
# Výstup: 'Příliš žluťoučký kůň…'
```

Metoda navíc před zkrácením automaticky zredukuje vícenásobné mezery na jednu mezeru.

---
<!-- slide: id=id6 title="„dedent(text)“" tags="WOW" diff="pythonic" -->
## Odstranění společného odsazení: `textwrap.dedent()`

Při psaní víceřádkových textů uvnitř funkcí nebo tříd způsobuje odsazení zdrojového kódu nežádoucí bílé znaky na začátku každého řádku:

```python
import textwrap

def get_query():
    sql = """
        SELECT id, jmeno, email
        FROM uzivatele
        WHERE aktivni = 1
    """
    # dedent() detekuje společné odsazení všech řádků a odstraní jej:
    return textwrap.dedent(sql).strip()

print(get_query())
```

Výstup bez nechtěných 8 mezer na začátku:
```sql
SELECT id, jmeno, email
FROM uzivatele
WHERE aktivni = 1
```

> [!TIP]
> `dedent()` je nepostradatelný pro čitelný zápis šablon, SQL dotazů, nápovědy CLI utilit a testovacích fixtur.

---
<!-- slide: id=id7 title="„indent(text, prefix, predicate=None)“" tags="Core" diff="pythonic" -->
## Přidání odsazení: `textwrap.indent()`

Inverzní operací k `dedent()` je funkce **`indent()`**, která přidá prefix na začátek každého řádku:

```python
import textwrap

log = "Chyba 404: Stránka nenalezena.\nZkontrolujte URL adresu."

# 1. Standardní odsazení o 4 mezery:
print(textwrap.indent(log, "    "))

# 2. Vytvoření citace (např. v Markdownu nebo e-mailu):
print(textwrap.indent(log, "> "))
```

### Podmíněné odsazení pomocí predikátu (`predicate`):
Ve výchozím stavu se prefix nepřidává k prázdným řádkům. Pomocí predikátu `predicate` můžeme chování detailně řídit:

```python
kod = "a = 1\n\nb = 2"

# Vynucení odsazení i pro zcela prázdné řádky:
vysledek = textwrap.indent(kod, "    ", predicate=lambda line: True)
```

---
<!-- slide: id=id8 title="Poznámka a doporučení pro výkon" tags="Tricky" diff="pythonic" -->
## Optimalizace výkonu při hromadném zpracování

Modulové funkce `wrap()`, `fill()` a `shorten()` při každém zavolání interně vytvářejí novou instanci `TextWrapper`.

Pokud zpracováváte tisíce dokumentů ve smyčce, vytváření nových instancí přináší zbytečnou režii.

### Doporučený postup pro vysoký výkon:
```python
import textwrap

# Vytvoření jedné instance pro celý proces:
formatter = textwrap.TextWrapper(width=80, expand_tabs=False)

# Opakované použití na velkém datasetu:
zpracovane_odstavce = [formatter.fill(odstavec) for odstavec in dataset]
```

Znovupoužitím existující instance `TextWrapper` eliminujete alokační režii a zrychlíte formátování textu.
