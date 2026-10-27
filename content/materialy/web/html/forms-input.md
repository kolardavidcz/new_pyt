<!-- slide: id=id1 title="Element <input> a jeho obecné atributy" tags="Core" diff="basics" -->
## Element `<input>` a jeho obecné atributy

Element **`<input>`** je nejvšestrannějším ovládacím prvkem HTML formulářů. Chování elementu se odvíjí od atributu `type`.

Obecné atributy společné pro většinu typů:
- **`type`**: Typ vstupního prvku (výchozí hodnota je `"text"`).
- **`name`**: Klíč, pod kterým server obdrží hodnotu prvku při odeslání.
- **`value`**: Výchozí nebo uživatelem zadaná hodnota.
- **`disabled`**: Zneaktivní prvek a vyjme jej z odesílaných dat formuláře.
- **`autofocus`**: Po načtení stránky automaticky umístí kurzor do tohoto prvku (smí být pouze na jednom prvku na stránce).
- **`autocomplete`**: Povoluje či zakazuje našeptávání z historie prohlížeče (`"on"` / `"off"`).
- **`spellcheck`**: Řídí kontrolu pravopisu v prohlížeči (`"true"` / `"false"`).

---
<!-- slide: id=id2 title="Přehled textových typů inputu" tags="Core" diff="basics" -->
## Přehled textových prvků `<input>`

HTML5 přineslo specializované textové typy:
- **`text`**: Běžný jednořádkový textový vstup.
- **`email`**: Vstup e-mailové adresy s vestavěnou validací formátu.
- **`password`**: Skrytý vstup hesla (znaky jsou maskovány tečkami).
- **`search`**: Vyhledávací pole (často s křížkem pro rychlé vymazání textu).
- **`tel`**: Telefonní číslo (na mobilních zařízeních zobrazí numerickou klávesnici).
- **`url`**: Webová adresa s validací protokolu (`http://`, `https://`).

---
<!-- slide: id=id3 title="<input type='text'>" tags="Core" diff="basics" -->
## `<input type="text">`: Běžný textový vstup

Základní jednořádkové textové pole:

```html
<label for="uzivatel">Uživatelské jméno:</label>
<input type="text" id="uzivatel" name="username" placeholder="např. davidkolar">
```

---
<!-- slide: id=id4 title="<input type='email'>" tags="WOW" diff="basics" -->
## `<input type="email">`: E-mailová adresa

Pole automaticky ověřuje, zda zadaný řetězec odpovídá e-mailové adrese (obsahuje zavináč a platnou doménu):

```html
<label for="email">E-mail:</label>
<input type="email" id="email" name="email" required placeholder="jan@example.cz">
```

Na mobilních zařízeních automaticky aktivuje klávesnici se znakem `@`.

---
<!-- slide: id=id5 title="<input type='password'>" tags="Core" diff="basics" -->
## `<input type="password">`: Vstup hesla

Všechny zadané znaky jsou okamžitě maskovány puntíky pro ochranu před odezíráním přes rameno:

```html
<label for="heslo">Heslo:</label>
<input type="password" id="heslo" name="password" required minlength="8">
```

---
<!-- slide: id=id6 title="<input type='search'>" tags="Skip" diff="basics" -->
## `<input type="search">`: Vyhledávací pole

Sémanticky určené pro vyhledávací dotazy. V mnoha prohlížečích automaticky přidává tlačítko pro vymazání obsahu (křížek):

```html
<label for="hledat">Hledat v katalogu:</label>
<input type="search" id="hledat" name="q" placeholder="Hledaný výraz...">
```

---
<!-- slide: id=id7 title="<input type='tel'>" tags="Skip" diff="basics" -->
## `<input type="tel">`: Telefonní číslo

Slouží pro zadání telefonního čísla. Na smartphonech otevře číselník pro pohodlné vytáčení:

```html
<label for="telefon">Telefonní číslo:</label>
<input type="tel" id="telefon" name="phone" pattern="(\+420)?\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}">
```

> [!NOTE]
> Prohlížeče neprovádějí striktní formální validaci mezinárodních čísel automaticky, proto se doporučuje doplnit atribut `pattern` s regulárním výrazem.

---
<!-- slide: id=id8 title="<input type='url'>" tags="WOW" diff="basics" -->
## `<input type="url">`: Webová adresa

Vyžaduje zadání platného URL včetně schématu (protokolu `http://` nebo `https://`):

```html
<label for="web">Osobní webové stránky:</label>
<input type="url" id="web" name="homepage" placeholder="https://www.example.cz">
```

---
<!-- slide: id=id9 title="Atributy textových prvků" tags="Skip" diff="basics" -->
## Specifické atributy textových prvků

Pro textové vstupy (`text`, `email`, `password`, `search`, `tel`, `url`) jsou k dispozici atributy:
- **`required`**: Pole nesmí zůstat prázdné.
- **`placeholder`**: Šedý nápovědný text před začátkem psaní.
- **`pattern`**: Regulární výraz pro validaci vstupu.
- **`maxlength`** / **`minlength`**: Maximální a minimální povolený počet znaků.
- **`readonly`**: Uživatel text vidí a může jej zkopírovat, ale nemůže jej upravit.
- **`list`**: Propojení s našeptávačem `<datalist>`.

---
<!-- slide: id=id10 title="@list a element <datalist>" tags="WOW" diff="pythonic" -->
## Našeptávač hodnot: Atribut `@list` a `<datalist>`

Element **`<datalist>`** poskytuje předdefinovaný seznam doporučených možností, zatímco uživatel může stále zadat libovolnou vlastní hodnotu:

```html
<label for="prohlizec">Oblíbený prohlížeč:</label>
<input type="text" id="prohlizec" name="browser" list="prohlizece-seznam">

<datalist id="prohlizece-seznam">
    <option value="Google Chrome">
    <option value="Mozilla Firefox">
    <option value="Apple Safari">
    <option value="Microsoft Edge">
</datalist>
```

---
<!-- slide: id=id11 title="@maxlength a @minlength" tags="Core" diff="basics" -->
## Omezení délky: `@maxlength` a `@minlength`

- **`maxlength="N"`**: Prohlížeč fyzicky nedovolí napsat více než $N$ znaků.
- **`minlength="N"`**: Formulář nelze odeslat, pokud má text méně než $N$ znaků.

```html
<label for="psc">PSČ (přesně 5 číslic):</label>
<input type="text" id="psc" name="zip" minlength="5" maxlength="5" required>
```

---
<!-- slide: id=id12 title="Validace regulárním výrazem: @pattern" tags="WOW" diff="newconcept" -->
## Validace regulárním výrazem: `@pattern`

Atribut **`pattern`** umožňuje vynutit přesný formát pomocí JavaScript regulárního výrazu (implicitně ukotveného na začátek `^` a konec `$`):

```html
<label for="kod">Kód produktu (např. ABC-123):</label>
<input type="text" id="kod" name="product_code" pattern="[A-Z]{3}-[0-9]{3}" required
       title="Zadejte 3 velká písmena, pomlčku a 3 číslice (např. ABC-123)">
```

> [!TIP]
> Atribut **`title`** se zobrazí v bublinové nápovědě prohlížeče, pokud uživatel zadá hodnotu, která neodpovídá zadanému patternu!

---
<!-- slide: id=id13 title="@placeholder: Nápovědný text" tags="Core" diff="basics" -->
## Zástupný text: `@placeholder`

Zobrazuje vodítko uvnitř textového pole:

```html
<input type="text" name="mesto" placeholder="např. Praha">
```

> [!CAUTION]
> `placeholder` nikdy nesmí nahrazovat element `<label>`! Jakmile uživatel začne psát, placeholder zmizí, a uživatel tak ztratí kontext, co do pole vyplňuje.

---
<!-- slide: id=id14 title="@readonly versus @disabled" tags="Tricky" diff="basics" -->
## Zákaz editace: `@readonly` versus `@disabled`

- **`readonly`**:
  - Pole nelze editovat, ale uživatel jej může označit a zkopírovat.
  - **Hodnota se při odeslání formuláře na server odešle!**
- **`disabled`**:
  - Prvek je zcela zneaktivněn (obvykle zašedlý).
  - **Hodnota se na server NEODEŠLE!**

---
<!-- slide: id=id15 title="@required: Povinné pole" tags="Core" diff="basics" -->
## Povinné pole: `@required`

Zabraňuje odeslání formuláře s prázdnou hodnotou:

```html
<label for="prijmeni">Příjmení (povinné):</label>
<input type="text" id="prijmeni" name="surname" required>
```

V CSS lze tato pole stylovat pomocí pseudotříd `:required` a `:valid` / `:invalid`.

---
<!-- slide: id=id16 title="@size: Vizuální šířka pole" tags="Skip" diff="basics" -->
## Vizuální šířka: `@size`

Atribut `size="20"` udává přibližnou šířku pole v počtu znaků. V moderním webovém designu se doporučuje šířku řídit výhradně pomocí CSS (`width: 100%`, `ch` jednotky).

---
<!-- slide: id=id17 title="Přehled číselných a časových prvků" tags="Core" diff="basics" -->
## Přehled číselných a časových prvků

HTML5 nativní widgety pro čísla a kalendář:
- **Čísla**:
  - `number`: Číselný vstup s ovládacími šipkami (krokování).
  - `range`: Posuvník (*slider*) pro výběr hodnoty z intervalu.
- **Datum a čas**:
  - `date`: Výběr kalendářního data (rok-měsíc-den).
  - `time`: Výběr času (hodiny-minuty).
  - `datetime-local`: Lokální datum a čas bez časového pásma.
  - `month`: Měsíc a rok.
  - `week`: Kalendářní týden a rok.

---
<!-- slide: id=id18 title="<input type='number'>" tags="Core" diff="basics" -->
## `<input type="number">: Číselný vstup`

Pole pro celá nebo desetinná čísla:

```html
<label for="pocet">Počet kusů (1 až 10):</label>
<input type="number" id="pocet" name="quantity" min="1" max="10" step="1" value="1">
```

---
<!-- slide: id=id19 title="<input type='range'>" tags="WOW" diff="basics" -->
## `<input type="range">: Posuvník (slider)`

Vizuální posuvník pro volbu hodnoty, kde není nutné zadávat přesné číslo:

```html
<label for="hlasitost">Hlasitost (0 až 100 %):</label>
<input type="range" id="hlasitost" name="volume" min="0" max="100" step="5" value="50">
```

---
<!-- slide: id=id20 title="<input type='date'>" tags="WOW" diff="basics" -->
## `<input type="date">: Výběr kalendářního data`

Otevře v prohlížeči nativní interaktivní kalendář. Na server se hodnota odesílá vždy ve standardizovaném ISO formátu `YYYY-MM-DD`:

```html
<label for="narozeni">Datum narození:</label>
<input type="date" id="narozeni" name="birthdate" min="1900-01-01" max="2026-12-31">
```

---
<!-- slide: id=id21 title="<input type='datetime'>" tags="Skip" diff="basics" -->
## `<input type="datetime">: Historická poznámka`

Původní specifikace počítala s typem `datetime` pro datum a čas v UTC. Tento typ byl však ve specifikaci HTML5 označen za zastaralý a nahrazen typem **`datetime-local`**.

---
<!-- slide: id=id22 title="<input type='datetime-local'>" tags="Core" diff="basics" -->
## `<input type="datetime-local">: Lokální datum a čas`

Umožňuje vybrat datum i čas bez časového pásma:

```html
<label for="schuzka">Termín schůzky:</label>
<input type="datetime-local" id="schuzka" name="meeting_time" value="2026-10-30T14:30">
```

Hodnota se odesílá ve formátu `YYYY-MM-DDTHH:MM`.

---
<!-- slide: id=id23 title="<input type='month'>" tags="Skip" diff="basics" -->
## `<input type="month">: Měsíc a rok`

Vhodné např. pro platnost platební karty (formát `YYYY-MM`):

```html
<label for="karta">Platnost karty do:</label>
<input type="month" id="karta" name="card_exp">
```

---
<!-- slide: id=id24 title="<input type='time'>" tags="Core" diff="basics" -->
## `<input type="time">: Čas bez data`

Vstup času ve 24hodinovém formátu `HH:MM`:

```html
<label for="budik">Čas buzení:</label>
<input type="time" id="budik" name="alarm" value="07:00">
```

---
<!-- slide: id=id25 title="<input type='week'>" tags="Skip" diff="basics" -->
## `<input type="week">: Kalendářní týden`

Vstup čísla týdne v roce (formát `YYYY-Www`):

```html
<label for="tyden">Týden dodání:</label>
<input type="week" id="tyden" name="delivery_week" value="2026-W44">
```

---
<!-- slide: id=id26 title="Atributy číselných a časových prvků" tags="Skip" diff="basics" -->
## Atributy číselných a časových prvků

Pro prvky `number`, `range`, `date`, `time`, `datetime-local`:
- **`min`**: Minimální povolená hodnota.
- **`max`**: Maximální povolená hodnota.
- **`step`**: Krok inkrementace / dekrementace.
- **`required`**: Povinné vyplnění.

---
<!-- slide: id=id27 title="Rozsah hodnot: @min a @max" tags="Core" diff="basics" -->
## Omezení rozsahu: `@min` a `@max`

```html
<!-- Pouze teploty od -20.0 do +50.0 °C -->
<input type="number" name="teplota" min="-20.0" max="50.0" step="0.5">

<!-- Rezervace pouze pro rok 2026 -->
<input type="date" name="rezervace" min="2026-01-01" max="2026-12-31">
```

Prohlížeč zkontroluje meze před odesláním.

---
<!-- slide: id=id28 title="@required u číselných polí" tags="Skip" diff="basics" -->
## `@required` u číselných a datových prvků

Podobně jako u textu vyžaduje, aby uživatel zadal platnou hodnotu před odesláním formuláře.

---
<!-- slide: id=id29 title="Krok změny: @step" tags="Tricky" diff="basics" -->
## Krok změny: `@step`

Určuje granularitu hodnoty:
- Výchozí hodnota u `number` je `1` (povoluje pouze celá čísla!).
- Pro povolení desetinných čísel je nutné nastavit např. `step="0.01"` nebo **`step="any"`**:

```html
<label for="cena">Cena v Kč:</label>
<input type="number" id="cena" name="price" min="0" step="0.01" placeholder="99.90">
```

---
<!-- slide: id=id30 title="Tlačítka: submit, reset a button" tags="Core" diff="basics" -->
## Tlačítka: `submit`, `reset` a `button`

Typy akčních tlačítek v `<input>`:
- **`submit`**: Odešle data formuláře na server.
- **`reset`**: Vrátí všechna pole formuláře na výchozí hodnoty.
- **`button`**: Obecné tlačítko bez výchozí akce (ovládané JavaScriptem).

---
<!-- slide: id=id31 title="<input type='button'>" tags="Skip" diff="basics" -->
## `<input type="button">: Generické tlačítko`

```html
<input type="button" value="Spočítat cenu" onclick="vypocet()">
```

V moderním vývoji se preferuje tag `<button type="button">`.

---
<!-- slide: id=id32 title="<input type='reset'>" tags="Skip" diff="basics" -->
## `<input type="reset">: Obnova výchozích hodnot`

```html
<input type="reset" value="Vyčistit formulář">
```

> [!TIP]
> Tlačítko `reset` používejte opatrně – uživatelé na něj mohou kliknout omylem a ztratit rozepsaná data!

---
<!-- slide: id=id33 title="<input type='submit'> a 'image'" tags="Core" diff="basics" -->
## `<input type="submit">` a obrázkové odeslání

Odeslání formuláře:

```html
<input type="submit" value="Uložit data">
```

Může přepsat chování formuláře atributy:
- `formaction="/jiny-cil"`
- `formmethod="post"`
- `formnovalidate`

Obrázkové tlačítko:
```html
<input type="image" src="/img/pay-button.png" alt="Zaplatit objednávku">
```

---
<!-- slide: id=id34 title="Zaškrtávací prvky: checkbox a radio" tags="Core" diff="basics" -->
## Zaškrtávací prvky: `checkbox` a `radio`

- **`checkbox`**: Umožňuje zaškrtnout nezávisle libovolný počet možností (0 až $N$).
- **`radio`**: Umožňuje vybrat **právě jednu** možnost ze skupiny vzájemně se vylučujících voleb.

---
<!-- slide: id=id35 title="<input type='checkbox'>" tags="Core" diff="basics" -->
## `<input type="checkbox">: Zaškrtávací políčko`

```html
<label>
    <input type="checkbox" name="newsletter" value="ano">
    Přeji si odebírat novinky e-mailem
</label>
```

Pokud není zaškrtnut, na server se neodešle vůbec nic. Pokud je zaškrtnut, odešle se `newsletter=ano`.

---
<!-- slide: id=id36 title="<input type='radio'>" tags="Tricky" diff="basics" -->
## `<input type="radio">: Skupina přepínačů`

Pro vytvoření přepínací skupiny musí mít všechny radio buttony **stejný atribut `name`**:

```html
<fieldset>
    <legend>Způsob platby:</legend>
    <label>
        <input type="radio" name="platba" value="karta" checked> Kartou online
    </label>
    <label>
        <input type="radio" name="platba" value="prevod"> Bankovním převodem
    </label>
    <label>
        <input type="radio" name="platba" value="dobirka"> Dobírka
    </label>
</fieldset>
```

Server obdrží pouze jednu vybranou hodnotu, např. `platba=karta`.

---
<!-- slide: id=id37 title="Atributy pro checkbox a radio" tags="Skip" diff="basics" -->
## Atributy přepínačů: `@checked` a `@required`

- **`checked`**: Prvek je po načtení stránky předvybrán.
- **`required`**: Vynucuje volbu.

---
<!-- slide: id=id38 title="@checked: Předvybraná volba" tags="Core" diff="basics" -->
## Předvybrání volby: `@checked`

```html
<input type="checkbox" name="podminky" value="1" checked>
```

U `radio` buttonů smí mít v jedné skupině atribut `checked` maximálně jeden prvek.

---
<!-- slide: id=id39 title="@required u checkboxu a radio buttonu" tags="Tricky" diff="basics" -->
## `@required` u voleb

- **U `checkbox`**: Uživatel **musí** zaškrtnout dané políčko (např. souhlas s obchodními podmínkami):
  ```html
  <label>
      <input type="checkbox" name="souhlas" required>
      Souhlasím se zpracováním osobních údajů (povinné)
  </label>
  ```
- **U `radio`**: Stačí uvést `required` u kteréhokoliv radio buttonu v dané skupině – formulář vyžaduje, aby uživatel vybral alespoň jednu možnost ze skupiny.

---
<!-- slide: id=id40 title="<input type='color'>" tags="WOW" diff="basics" -->
## `<input type="color">: Výběr barvy`

Zobrazí systémový dialog pro výběr barvy. Vrací hexadecimální kód barvy (např. `#ff0000`):

```html
<label for="barva">Vyberte barvu motivu:</label>
<input type="color" id="barva" name="theme_color" value="#3498db">
```

---
<!-- slide: id=id41 title="<input type='file'>" tags="Core" diff="basics" -->
## `<input type="file">: Nahrávání souborů`

Umožňuje uživateli vybrat soubor z disku pro upload na server:

```html
<form action="/upload" method="post" enctype="multipart/form-data">
    <label for="soubor">Vyberte dokument (PDF nebo obrázek):</label>
    <input type="file" id="soubor" name="priloha" accept=".pdf,image/*" multiple required>
    <button type="submit">Nahrát soubory</button>
</form>
```

Důležité atributy:
- **`accept`**: Omezení na povolené MIME typy (`image/*`, `application/pdf`) nebo přípony (`.csv`, `.xlsx`).
- **`multiple`**: Umožní vybrat více souborů najednou.
- **Kritické**: Formulář musí mít `enctype="multipart/form-data"` a `method="post"`!

---
<!-- slide: id=id42 title="<input type='hidden'>" tags="Core" diff="basics" -->
## `<input type="hidden">: Skrytá data formuláře`

Neviditelný prvek pro předávání interních stavových dat:

```html
<input type="hidden" name="user_id" value="48291">
<input type="hidden" name="csrf_token" value="d9f8e7a6b5c4...">
```

Slouží k perzistenci identifikátorů, tokenů relace a bezpečnostních CSRF ochran bez ovlivnění vizuálního vzhledu stránky.
