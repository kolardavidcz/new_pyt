<!-- slide: id=id1 title="Úvod" tags="Core" diff="basics" -->
## Úvod do knihovny Tkinter

Většina standardních instalací Pythonu obsahuje vestavěnou knihovnu pro tvorbu grafických uživatelských rozhraní (**GUI**): **`tkinter`** (Python wrapper nad knihovnou **Tcl/Tk**).

### Klíčové vlastnosti a postavení Tkinteru:
- **Nulové externí závislosti**: Tkinter je součástí standardní knihovny CPythonu. Umožňuje distribuovat desktopové aplikace bez nutnosti instalovat objemné externí frameworky.
- **Evoluce od Tk 8.5/8.6 (ttk)**: Historický zastaralý vzhled z 90. let byl nahrazen modulem **`tkinter.ttk`** (*Themed Tk*), který využívá nativní vykreslovací API daného operačního systému (Windows, macOS i Linux X11/Wayland).
- **Guido van Rossum**: Sám tvůrce Pythonu podotkl, že kdyby v 90. letech existoval *wxPython* ve zralém stavu, standardem by se stal on. Tkinter si však vydobyl pevné místo díky extrémní jednoduchosti a spolehlivosti.

> [!TIP]
> Pro moderní GUI aplikace v Pythonu vždy preferujte komponenty z podmodulu **`tkinter.ttk`**, které se vizuálně adaptují na téma operačního systému.

---
<!-- slide: id=id2 title="PS: Kontrola instalace" tags="Skip" diff="basics" -->
## Kontrola instalace Tkinteru

V systému Windows a macOS se podpora Tkinteru instaluje automaticky s oficiálním instalátorem Pythonu. V linuxových distribucích (Ubuntu/Debian) bývá často oddělena do samostatného balíčku.

Správnou funkčnost Tkinteru ve vašem prostředí ověříte spuštěním vestavěného testovacího modulu:

```bash
python -m tkinter
```

Pokud je instalace v pořádku, zobrazí se minimalistické okénko s verzí Tcl/Tk a dvěma tlačítky (*Click me!* a *Quit*).

Pokud příkaz selže s `ModuleNotFoundError: No module named '_tkinter'`, na Debianu/Ubuntu doinstalujete balíček příkazem:
```bash
sudo apt install python3-tk
```

---
<!-- slide: id=id3 title="Vytvoření okna aplikace" tags="Core" diff="basics" -->
## Vytvoření hlavního okna aplikace

Každá GUI aplikace v Tkinteru začíná inicializací kořenového okna (`Tk`) a spuštěním smyčky událostí (*event loop*):

```python
import tkinter as tk

# 1. Vytvoření instance kořenového okna (root window)
root = tk.Tk()
root.title("Moje první GUI aplikace")

# 2. Spuštění hlavní smyčky událostí (event loop)
root.mainloop()
```

### Co dělá `mainloop()`?
1. **Zpracování zpráv**: GUI aplikace jsou řízeny událostmi (*event-driven*). `mainloop()` je nekonečná smyčka, která naslouchá událostem od operačního systému (kliknutí myší, stisk klávesy, překreslení okna).
2. **Blokující volání**: Kód za voláním `root.mainloop()` se vykoná až v okamžiku, kdy uživatel okno aplikace zavře.

---
<!-- slide: id=id4 title="Vlastnosti okna aplikace" tags="Skip" diff="basics" -->
## Konfigurace vlastností hlavního okna

Kořenové okno nabízí řadu metod pro správu rozměrů, pozice a chování:

```python
import tkinter as tk

root = tk.Tk()

# Nastavení titulku okna
root.title("Správa konfigurace okna")

# Rozměry a pozice: ŠÍŘKAxVÝŠKA+POSUN_X+POSUN_Y
# 400x250 px, umístěno 100 px od levého a 80 px od horního okraje obrazovky
root.geometry("400x250+100+80")

# Omezení změny velikosti: (lze_měnit_šířku, lze_měnit_výšku)
root.resizable(width=True, height=False)

# Minimální a maximální povolené rozměry
root.minsize(300, 200)
root.maxsize(800, 600)

# Okenní atributy (průhlednost a setrvání v popředí)
root.attributes("-alpha", 0.95)     # Mírná průhlednost (0.0 až 1.0)
root.attributes("-topmost", True)   # Okno zůstává vždy navrchu

# Správa zobrazení
# root.iconify()    # Minimalizuje do lišty
# root.deiconify()  # Obnoví zobrazení okna
# root.withdraw()   # Skryje okno z obrazovky bez ukončení procesu

root.mainloop()
```

---
<!-- slide: id=id5 title="Manažery vzhledu" tags="Core" diff="newconcept" -->
## Manažery vzhledu (Layout Managers)

Aby se komponenty v okně správně poskládaly, nabízí Tkinter tři geometrické manažery (*geometry managers*):

### 1. `pack()` – Krabičkový model
- Skládá komponenty postupně za sebou (nahoře, dole, vlevo, vpravo).
- Parametry: `side=tk.TOP/BOTTOM/LEFT/RIGHT`, `fill=tk.X/Y/BOTH`, `expand=True`, `padx`, `pady`.
- Nejrychlejší a nejjednodušší pro vertikální i horizontální nástrojové lišty a panely.

### 2. `grid()` – Tabulková mřížka
- Pozicuje komponenty do řádků a sloupců tabulky.
- Parametry: `row`, `column`, `rowspan`, `columnspan`, `sticky="nsew"` (zarovnání ke stranám).
- Ideální pro formuláře, dialogová okna a kalkulačky.

### 3. `place()` – Absolutní souřadnice
- Pozicuje prvky na přesné souřadnice v pixelech (`x`, `y`, `width`, `height`).
- **Nedoporučuje se**: Nereaguje na změnu velikosti okna ani různé DPI monitoru.

> [!CAUTION]
> **Nikdy nekombinujte `pack()` a `grid()` uvnitř téhož rodičovského kontejneru!** Způsobí to nekonečný výpočetní cyklus a zamrznutí celé aplikace.

---
<!-- slide: id=id6 title="Příklad – obrázek v okně" tags="Core" diff="pythonic" -->
## Příklad: Vykreslení grafiky na Canvas

Pro kreslení geometrických tvarů nebo zobrazení rastrových obrázků slouží komponenta **`Canvas`**:

```python
import tkinter as tk

root = tk.Tk()
root.title("Plátno a obrázek")

# 1. Vytvoření plátna o rozměrech 300x300 pixelů
canvas = tk.Canvas(root, width=300, height=300, bg="#f0f4f8")
canvas.pack(fill=tk.BOTH, expand=True)

# 2. Načtení obrázku (nativně GIF/PNG v moderním Tkinteru)
photo = tk.PhotoImage(file="duha.gif")

# 3. Vložení obrázku do plátna se zarovnáním
canvas.create_image(150, 150, image=photo, anchor=tk.CENTER)

# 4. Kreslení vektorových tvarů na plátno
canvas.create_rectangle(20, 20, 80, 80, fill="skyblue", outline="navy")
canvas.create_text(150, 260, text="Kresleno na Tkinter Canvas", font=("Arial", 12))

# Kritické pravidlo pro Tkinter PhotoImage:
# Reference na instanci PhotoImage musí zůstat uložena,
# jinak ji Python Garbage Collector smaže a obrázek zmizí!
canvas.image_ref = photo

root.mainloop()
```

---
<!-- slide: id=id7 title="Poznámka – vlastnosti objektů" tags="Skip" diff="basics" -->
## Objektová architektura a mixin třídy

Všechny vizuální komponenty v Tkinteru dědí z bohaté hierarchie sdílených tříd (*mixins*):
- `Misc`: Globální utility pro události, časovače (`after()`), schránku (`clipboard_get()`).
- `Wm`: Metody správce oken (`title()`, `geometry()`, `iconify()`).
- `Pack`, `Grid`, `Place`: Metody geometrických manažerů přítomné přímo na každém widgetu.

### Introspekce parametrů komponenty:
Každý widget nabízí metody pro zjištění a úpravu svých konfiguračních voleb za běhu:

```python
btn = tk.Button(root, text="Klikni")

# Získání všech platných klíčů konfigurace:
print(btn.keys()[:5])  # ['command', 'text', 'font', 'fg', 'bg']

# Zjištění aktuální hodnoty a výchozího nastavení:
print(btn.configure("text"))  # ('text', 'text', 'Text', '', 'Klikni')

# Změna konfigurace za běhu:
btn.configure(text="Změněný text", bg="lightgreen")
# nebo slovníkovým přístupem:
btn["text"] = "Nový text"
```

---
<!-- slide: id=id8 title="Příklad – složitější aplikace (vzhled)" tags="Skip" diff="basics" -->
## Ukázka strukturované aplikace

Při návrhu desktopového rozhraní je vhodné rozdělit plochu do hierarchických kontejnerů (**`Frame`** a **`LabelFrame`**):

- **Horní panel (`LabelFrame`)**: Ohraničená oblast s popiskem pro zobrazení obsahu nebo stavu.
- **Spodní ovládací panel (`Frame`)**: Horizontální lišta s akčními tlačítky.
- **Rámečky s reliéfem**: Volba `relief` (`RAISED`, `SUNKEN`, `GROOVE`, `RIDGE`, `FLAT`) a `borderwidth` definuje 3D vzhled rámečku.

Strukturováním prvků do sub-rámců lze dosáhnout čistého layoutu, který se korektně přizpůsobuje změnám velikosti okna.

---
<!-- slide: id=id9 title="Příklad – složitější aplikace (kód)" tags="Tricky" diff="paradigm" -->
## Třídní architektura pro Tkinter aplikace

Ve větších aplikacích je standardem zapouzdřit stav a komponenty do samostatné třídy:

```python
import tkinter as tk
from tkinter import ttk, messagebox

class SimpleApp:
    def __init__(self, master: tk.Tk) -> None:
        self.master = master
        self.master.title("Třídní Tkinter aplikace")
        self.master.geometry("320x240")

        # 1. Hlavní kontejner
        self.main_frame = ttk.Frame(self.master, padding=10)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # 2. Vstupní pole
        self.entry_label = ttk.Label(self.main_frame, text="Zadejte své jméno:")
        self.entry_label.pack(anchor=tk.W, pady=2)

        self.name_var = tk.StringVar(value="Svět")
        self.name_entry = ttk.Entry(self.main_frame, textvariable=self.name_var)
        self.name_entry.pack(fill=tk.X, pady=5)

        # 3. Tlačítka
        self.btn_greet = ttk.Button(self.main_frame, text="Pozdravit", command=self.on_greet)
        self.btn_greet.pack(side=tk.LEFT, padx=5, pady=10)

        self.btn_quit = ttk.Button(self.main_frame, text="Ukončit", command=self.master.destroy)
        self.btn_quit.pack(side=tk.RIGHT, padx=5, pady=10)

    def on_greet(self) -> None:
        name = self.name_var.get().strip()
        messagebox.showinfo("Pozdrav", f"Ahoj, {name}!")

def main() -> None:
    root = tk.Tk()
    app = SimpleApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
```

---
<!-- slide: id=id10 title="Vlastnosti GUI-komponent" tags="Skip" diff="basics" -->
## Společné metody a řízení událostí widgetů

Kromě geometrických manažerů nabízí většina komponent užitečné metody pro řízení interakce:

- **`widget.focus_set()`**: Přesune klávesnicový fokus na daný widget (např. do textového pole po otevření dialogu).
- **`widget.bell()`**: Vyvolá systémové zvukové upozornění (pípnutí).
- **`widget.lift()` / `widget.lower()`**: Změní pořadí vykreslování v ose Z (přesune widget před nebo za ostatní).
- **`widget.after(ms, callback, *args)`**: Naplánuje asynchronní spuštění funkce po uplynutí zadaného počtu milisekund (základ pro animace a periodické aktualizace bez blokování `mainloop`).
- **`widget.bind(sequence, func)`**: Naváže vlastní obsluhu události (např. stisk klávesy `<Return>` nebo kliknutí `<Button-1>`).

```python
# Příklad: Spuštění akce při stisku klávesy Enter v Entry poli:
name_entry.bind("<Return>", lambda event: app.on_greet())
```

---
<!-- slide: id=id11 title="Další „widžety“ a jejich styly" tags="Skip" diff="basics" -->
## Přehled standardních a ttk komponent

Tkinter v kombinaci s `tkinter.ttk` pokrývá kompletní sadu běžných prvků grafického rozhraní:

| Kategorie | Komponenty v `tkinter.ttk` | Účel použití |
| :--- | :--- | :--- |
| **Kontejnery** | `Frame`, `LabelFrame`, `PanedWindow`, `Notebook` | Seskupování prvků, taby/záložky |
| **Základní vstup** | `Button`, `Checkbutton`, `Radiobutton` | Akční tlačítka, zaškrtávátka, přepínače |
| **Text a hodnoty** | `Entry`, `Spinbox`, `Combobox` | Jednořádkový text, číselník, rozbalovací seznam |
| **Indikátory** | `Progressbar`, `Scale`, `Separator` | Ukazatel průběhu, posuvník, dělící čára |
| **Komplexní** | `Treeview`, `Text`, `Canvas` | Tabulky/stromy, víceřádkový text, 2D grafika |

Výhoda **`ttk`** komponent spočívá v oddělení logiky prvku od jeho vizuálního stylu (`ttk.Style`), což umožňuje měnit celkový grafický motiv aplikace (*clam*, *alt*, *default*, *vista*).

---
<!-- slide: id=id12 title="Na závěr" tags="Skip" diff="basics" -->
## Závěrečné shrnutí a doporučení

Tkinter je ideální volbou pro:
- Interní firemní nástroje, testovací utilitky a vědecké vizualizace.
- Školní a výukové projekty, kde je klíčová okamžitá funkčnost bez nutnosti `pip install`.
- Nenáročné desktopové utility s nativním spouštěním.

### Kde hledat inspiraci a dokumentaci:
- **[TkDocs.com](https://tkdocs.com/)**: Moderní, vysoce kvalitní vícejazyčný tutoriál pokrývající Python a moderní `ttk` komponenty.
- **Oficiální dokumentace Pythonu**: Moduly `tkinter` a `tkinter.ttk`.
- **Pro rozsáhlejší projekty**: Zvažte moderní frameworky jako **PyQt / PySide** (rozsáhlý Qt ekosystém), **CustomTkinter** (moderní tmavý flat design nad Tkinterem) nebo webová desktopová řešení (Tauri, Electron).
