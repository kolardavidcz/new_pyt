<!-- lecture: title="Základní použití" slug="materialy--jupyter--usage" week=0 -->

<!-- slide: id=id1 title="Úvod" tags="Tricky" diff="newconcept" -->
## Úvod

Základní filosofií Jupyter Notebooku je kombinace kódu, jeho vizuálních výstupů a formátovaného vysvětlujícího textu v jediném živém dokumentu.

Dokument se skládá ze sekvence **buněk** (*cells*).

> [!WARNING]
> **Pozor na pořadí spouštění buněk:**
> Buňky v notebooku lze spouštět v libovolném pořadí (i na přeskáčku nahoru a dolů). V hranatých závorkách `[1]`, `[2]` vedle buňky vidíte pořadové číslo jejího vyhodnocení.
> Pokud spustíte buňky na přeskáčku, stav proměnných v paměti nemusí odpovídat pořadí textu odshora dolů!

---

<!-- slide: id=id2 title="Otevření „notebooku“" tags="Core" diff="basics" -->
## Otevření „notebooku“

Způsoby otevření a vytvoření notebooku:

1. **Z příkazové řádky:**
   ```bash
   jupyter lab analyza.ipynb
   ```
2. **V JupyterLab rozhraní:** V uvítacím panelu (*Launcher*) klikněte na ikonu *Python 3 (ipykernel)* pod sekcí *Notebook*.
3. **Ve Visual Studio Code:** Jednoduše otevřete soubor `.ipynb` nebo stiskněte `Ctrl+Shift+P` $\rightarrow$ *Create: New Jupyter Notebook*.

---

<!-- slide: id=id3 title="Práce s „notebookem“" tags="Skip" diff="basics" -->
## Práce s „notebookem“ a ukládání

- **Uložení stavu (`Ctrl+S`):** Uloží aktuální dokument a vytvoří kontrolní bod (*Checkpoint*) ve složce `.ipynb_checkpoints/`.
- **Návrat k checkpointu (*File $\rightarrow$ Revert to Checkpoint*):** Umožňuje vrátit soubor do stavu posledního ručního uložení.
- **Export dokumentu:** Z nabídky *File $\rightarrow$ Save and Export Notebook As...* můžete dokument exportovat do PDF, HTML, čistého skriptu `.py` nebo LaTeXu.

---

<!-- slide: id=id4 title="Typy buněk" tags="Core" diff="basics" -->
## Typy buněk

Každá buňka má svůj specifický typ:

1. **Kód (`Code`, klávesa `Y`):** Spustitelný kód v jazyce aktivního kernelu (např. Python).
2. **Formátovaný text (`Markdown`, klávesa `M`):** Text ve formátu Markdown s podporou HTML a matematických vzorců.
3. **Surový text (`Raw`, klávesa `R`):** Neformátovaný text, který se při spuštění ignoruje a exportuje se beze změn.

---

<!-- slide: id=id5 title="Dva režimy: Příkazový vs Editační" tags="Core" diff="basics" -->
## Dva režimy: Příkazový vs Editační

Jupyter používá modální ovládání (podobně jako editor Vim):

- **Editační mód (Edit Mode, modrý/zelený rámeček uvnitř buňky):**
  - Kurzor bliká v textu buňky a můžete psát kód.
  - Vstup do editačního módu: stiskněte **`Enter`** nebo klikněte myší dovnitř.
- **Příkazový mód (Command Mode, modrý levý okraj):**
  - Klávesnice ovládá samotné buňky (přidávání, mazání, přesouvání).
  - Vstup do příkazového módu: stiskněte **`Esc`**.

---

<!-- slide: id=id6 title="Buňky s kódem a spouštění" tags="Core" diff="basics" -->
## Buňky s kódem a spouštění

Klávesové zkratky pro spuštění kódu v buňce:

- **`Shift + Enter`**: Vykoná kód buňky a posune kurzor na následující buňku (případně vytvoří novou na konci).
- **`Ctrl + Enter`**: Vykoná kód buňky a ponechá kurzor na téže buňce.
- **`Alt + Enter`**: Vykoná kód buňky a vloží novou prázdnou buňku bezprostředně pod ni.

Správa běžícího výpočtu:
- **`I, I`** (dvakrát klávesa I): Přeruší běžící výpočet (*Interrupt kernel*).
- **`0, 0`** (dvakrát nula): Restartuje celý kernel a vymaže veškerou paměť proměnných.

---

<!-- slide: id=id7 title="Indikátor běhu výpočtu `[*]`" tags="Core" diff="basics" -->
## Indikátor běhu výpočtu `[*]`

Vlevo vedle buňky se nachází stavový indikátor:

- **`[ ]`**: Buňka zatím nebyla spuštěna.
- **`[*]`**: Buňka právě počítá (probíhá běh kódu na pozadí).
- **`[12]`**: Buňka byla vyhodnocena jako dvanáctá v pořadí od spuštění kernelu.

> [!NOTE]
> Pokud vedle buňky svítí `[*]`, další spuštěné buňky se zařadí do fronty a vyčkají na dokončení předchozího výpočtu.

---

<!-- slide: id=id8 title="Magické příkazy „%“ a „%%“" tags="Core" diff="newconcept" -->
## Magické příkazy (*Magic Commands*)

Kernel IPythonu nabízí speciální příkazy usnadňující ladění a měření výkonu:

- **Řádkové magiky (začínají `%`):** Působí na zbytek daného řádku.
- **Buňkové magiky (začínají `%%`):** Působí na celý obsah dané buňky (musí být na prvním řádku buňky).

---

<!-- slide: id=id9 title="„%“ – řádkové magické příkazy" tags="WOW" diff="pythonic" -->
## „%“ – řádkové magické příkazy

Nejužitečnější řádkové magiky:

```python
# Měření času vykonání jednoho výrazu:
%time sum(range(1_000_000))

# Přesné benchmarkování s více iteracemi:
%timeit [x**2 for x in range(1000)]

# Přehled všech aktivních proměnných v paměti:
%whos

# Zjištění a změna pracovní složky:
%pwd
%cd /cesta/k/projektu

# Instalace balíčku přímo do kernelu aktuálního notebooku:
%pip install pandas matplotlib
```

---

<!-- slide: id=id10 title="„%%“ – celobuňkové magické příkazy" tags="WOW" diff="pythonic" -->
## „%%“ – celobuňkové magické příkazy

```python
%%time
# Změří celkový čas běhu všech příkazů v této buňce:
import time
time.sleep(1)
vysledek = 42
```

```python
%%writefile konfigurace.json
{
  "api_url": "https://api.example.com",
  "timeout": 30
}
# Obsah buňky se automaticky zapíše do souboru konfigurace.json!
```

---

<!-- slide: id=id11 title="Základní klávesové zkratky v Command Mode (`Esc`)" tags="Skip" diff="basics" -->
## Základní klávesové zkratky v Command Mode (`Esc`)

Když jste v příkazovém módu (stisknete `Esc`):
- **`A`** (*Above*): Vloží novou buňku nad aktuální.
- **`B`** (*Below*): Vloží novou buňku pod aktuální.
- **`D, D`** (dvakrát klávesa D): Smaže aktuální buňku.
- **`Z`**: Krok zpět (*Undo* smazání buňky).
- **`C` / `V`**: Zkopírování a vložení buňky.
- **`M`**: Změní typ buňky na Markdown.
- **`Y`**: Změní typ buňky na kód.
- **`H`**: Zobrazí kompletní přehled všech klávesových zkratek.

---

<!-- slide: id=id12 title="Buňky s textem (Markdown)" tags="Core" diff="basics" -->
## Buňky s textem (Markdown)

V buňkách typu Markdown můžete psát přehledné vysvětlující texty:

```markdown
# Hlavní nadpis (H1)
## Podnadpis (H2)

Odstavce textu oddělujeme prázdným řádkem. Text lze formátovat **tučně** nebo *kurzívou*.

Odrážkové seznamy:
- První bod
- Druhý bod s kódem `x = 42`

Tabulky:
| Vstup | Výstup |
|---|---|
| A | 10 |
| B | 20 |
```

Po stisku `Shift + Enter` se Markdown okamžitě zformátuje do čistého HTML vzhledu.

---

<!-- slide: id=id13 title="Matematické vzorce (KaTeX / LaTeX)" tags="WOW" diff="pythonic" -->
## Matematické vzorce (KaTeX / LaTeX)

V buňkách typu Markdown můžete přímo zapisovat matematické rovnice:

### 1. Řádková rovnice uvnitř textu (`$...$`):
```markdown
Pravděpodobnost vyjádříme jako $P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}$.
```

### 2. Samostatný vycentrovaný vzorec (`$$...$$`):
```latex
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

---

<!-- slide: id=id14 title="Poznámka k bezpečnosti a reprodukovatelnosti" tags="Skip" diff="basics" -->
## Bezpečnost a reprodukovatelnosti

1. **Otevírání cizích notebooků:**
   Při spuštění buněk v notebooku staženém z internetu má kód plný přístup k vašemu souborovému systému a síti. Nikdy nespouštějte neznámé buňky bez předchozí kontroly kódu.
2. **Restart & Run All (Zlatý standard):**
   Před odevzdáním práce nebo sdílením notebooku s kolegy vždy proveďte:
   *Kernel $\rightarrow$ Restart Kernel and Run All Cells*.
   Tím ověříte, že kód běží správně od začátku do konce a nespoléhá na zapomenuté proměnné v paměti z dřívějších pokusů.
