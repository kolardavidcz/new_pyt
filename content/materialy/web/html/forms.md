<!-- slide: id=id1 title="Úvod do HTML formulářů" tags="Core" diff="basics" -->
## Úvod do HTML formulářů

Formuláře (**`<form>`**) jsou základním stavebním kamenem interaktivního webu. Zajišťují sběr uživatelských dat a jejich odeslání na server ke zpracování backendovým skriptem (v Pythonu např. CherryPy, FastAPI či Django).

Základní prvky formuláře:
- **Kontejner `<form>`**: Vymezuje rozsah formuláře a definuje cíl (`action`) a HTTP metodu (`method`).
- **Vstupní pole**: Elementy `<input>`, `<textarea>`, `<select>`, `<button>`.
- **Strukturální elementy**: `<fieldset>`, `<legend>`, `<label>`.

---
<!-- slide: id=id2 title="Značení prvků a terminologie" tags="Skip" diff="basics" -->
## Terminologie formulářových prvků

V popisu formulářů rozlišujeme tři klíčové úrovně:
- **Element / Tag**: Značka v HTML (např. `<input>`, `<button>`, `<select>`).
- **Atribut**: Vlastnost zapsaná v otevíracím tagu (např. `type="email"`, `name="uzivatel"`, `required`).
- **Hodnota atributu**: Konkrétní nastavení (např. `"post"`, `"/login"`, `"true"`).

U ovládacích prvků mluvíme o formulářových *widgetech*.

---
<!-- slide: id=id3 title="Pravdivostní atributy (boolean attributes)" tags="Tricky" diff="basics" -->
## Pravdivostní atributy (*boolean attributes*)

Některé atributy v HTML5 reprezentují logickou hodnotu (*boolean*):
- **`false`**: Pokud atribut u elementu **vůbec není uveden**.
- **`true`**: Pokud je atribut v elementu **přítomen** (na jeho konkrétní hodnotě nezáleží!).

Standardní zápisy pro hodnotu `true`:
```html
<!-- Moderní a nejčistší HTML5 zápis: -->
<input type="text" name="jmeno" required>

<!-- Starší XHTML kompatibilní zápis: -->
<input type="text" name="jmeno" required="required">
```

Typické boolean atributy: `required`, `disabled`, `readonly`, `checked`, `autofocus`, `novalidate`.

---
<!-- slide: id=id4 title="Struktura formulářů: fieldset, legend a label" tags="Core" diff="basics" -->
## Logická struktura: `<fieldset>`, `<legend>` a `<label>`

Pro přístupnost (a11y) a přehlednost formuláře se používají tři klíčové elementy:

- **`<fieldset>`**: Rámeček logicky sdružující související sadu polí (např. Fakturační adresa).
  - Pokud nastavíte `<fieldset disabled>`, zneaktivní se všechny prvky uvnitř!
- **`<legend>`**: Titulek rámečku zobrazený přímo v horní lince `<fieldset>`.
- **`<label>`**: Textový popisek vstupního pole. Kliknutí na `<label>` automaticky přenese fokus do provázaného `<input>`.

---
<!-- slide: id=id5 title="Příklad struktury formuláře" tags="Tricky" diff="basics" -->
## Příklad: Skupiny prvků a popisky

```html
<form action="/kalkulacka" method="post">
    <fieldset>
        <legend>Osobní údaje</legend>
        
        <label for="jmeno_id">Celé jméno:</label>
        <input type="text" id="jmeno_id" name="jmeno" required>
        
        <!-- Alternativní zapouzdření inputu přímo do labelu: -->
        <label>
            Věk:
            <input type="number" name="vek" min="0" max="120">
        </label>
    </fieldset>

    <fieldset disabled>
        <legend>Uzamčená sekce</legend>
        <input type="text" name="pouze_pro_admina" value="Nelze editovat">
    </fieldset>

    <button type="submit">Odeslat data</button>
</form>
```

> [!NOTE]
> Ve specifikaci HTML je přísně zakázáno vnořovat jeden `<form>` do jiného `<form>`. Vnořování `<fieldset>` do jiného `<fieldset>` je naopak zcela v pořádku.

---
<!-- slide: id=id6 title="Propojování prvků: atributy id, form a for" tags="WOW" diff="pythonic" -->
## Logické propojování: `@id`, `@form` a `@for`

V HTML5 nemusí být formulářové prvky fyzicky umístěny uvnitř tagu `<form>`:

- **Atribut `for="id_prvku"` na `<label>`**:
  Propojí popisek s prvkem se stejným `id`. Při kliknutí na text labelu se prvek aktivuje nebo zaškrtne (klíčové pro checkboxy na mobilu!).
- **Atribut `form="form_id"` na `<input>` / `<button>`**:
  Umožňuje umístit tlačítko nebo input kdekoliv na stránce (např. v záhlaví tabulky) a přitom jej logicky přiřadit formuláři s daným `id`.

```html
<form id="moje-objednavka" action="/objednat" method="post">
    <input type="text" name="polozka" value="Kniha Python">
</form>

<!-- Tlačítko leží MIMO form, ale přesto formulář odešle! -->
<button type="submit" form="moje-objednavka">Dokončit nákup</button>
```

---
<!-- slide: id=id7 title="Zásadní rozdíl: atribut id versus name" tags="Tricky" diff="basics" -->
## Zásadní rozdíl: `@id` versus `@name`

Ačkoliv oba atributy prvky pojmenovávají, slouží ke zcela jiným účelům:

- **`id` (Klientská identifikace)**:
  - Musí být **naprosto unikátní** v rámci celého HTML dokumentu.
  - Slouží pro CSS selektory (`#id`), JavaScript (`document.getElementById`) a vazbu `<label for="...">`.
  - **Na server se vůbec neposílá!**

- **`name` (Klíč odesílaný na server)**:
  - Představuje název proměnné, pod kterou server hodnotu obdrží.
  - **Nemusí být unikátní!** Více checkboxů nebo radio buttonů se stejným `name` tvoří výběrovou skupinu:
    ```html
    <input type="radio" name="doprava" value="posta"> Česká pošta
    <input type="radio" name="doprava" value="kuryr"> Kurýr
    ```

---
<!-- slide: id=id8 title="Příklad vazeb formulářových prvků" tags="Core" diff="basics" -->
## Příklad komplexní vazby popisků a reset tlačítek

```html
<form id="registrace" action="/register" method="post">
    <fieldset>
        <legend>Uživatelský účet</legend>
        
        <label for="email_inp">E-mailová adresa:</label>
        <input type="email" id="email_inp" name="email" required>
        
        <input type="reset" id="reset_btn" value="Vymazat formulář">
        <label for="reset_btn">← Kliknutím sem smažete formulář</label>
    </fieldset>
</form>

<!-- Tlačítko mimo form přiřazené přes atribut form="registrace" -->
<input type="reset" form="registrace" value="Globální reset mimo formulář">
```

---
<!-- slide: id=id9 title="Využití atributu form pro více formulářů" tags="WOW" diff="pythonic" -->
## Praktické využití atributu `@form`

Díky atributu `form` můžeme v jedné tabulce či stránce obsluhovat více nezávislých formulářů:

```html
<!-- Dva samostatné formuláře s různými cíli -->
<form id="form-vyhledat" action="/search" method="get"></form>
<form id="form-smazat" action="/bulk-delete" method="post"></form>

<div class="toolbar">
    <!-- Prvky vyhledávání -->
    <input type="search" name="q" form="form-vyhledat" placeholder="Hledat...">
    <button type="submit" form="form-vyhledat">Hledat</button>

    <!-- Tlačítko hromadného smazání -->
    <button type="submit" form="form-smazat" class="danger">Smazat vybrané</button>
</div>
```

Data z jednotlivých polí jsou odeslána výhradně do toho formuláře, na jehož `id` odkazují.

---
<!-- slide: id=id10 title="Atributy elementu form" tags="Core" diff="resyntax" -->
## Klíčové atributy elementu `<form>`

- **`action`**: Cílová URL adresa pro zpracování dat (`/api/login`).
- **`method`**: HTTP metoda – `get` (výchozí) nebo `post`.
- **`enctype`**: Způsob kódování těla požadavku:
  - `application/x-www-form-urlencoded`: Výchozí formát (URL kódování parametrů).
  - `multipart/form-data`: **Povinné pro upload souborů** (`<input type="file">`).
  - `text/plain`: Odeslání neformátovaného textu.
- **`autocomplete`**: `on` (výchozí) nebo `off` pro zakázání našeptávání historie prohlížeče.
- **`novalidate`**: Vypne vestavěnou klientskou HTML5 validaci v prohlížeči.
- **`target`**: Kde otevřít odpověď serveru (`_self`, `_blank`).

---
<!-- slide: id=id11 title="Přehled formulářových prvků" tags="Skip" diff="basics" -->
## Přehled ovládacích prvků (widgetů)

HTML formuláře nabízejí širokou paletu prvků:

- **`<input>`**: Univerzální element s desítkami variant atributu `type` (`text`, `number`, `email`, `password`, `checkbox`, `radio`, `file`, `date`, `color`...).
- **`<button>`**: Tlačítko s podporou vnořeného HTML obsahu.
- **`<textarea>`**: Víceřádkové textové pole s možností změny velikosti.
- **`<select>` & `<option>`**: Rozbalovací nabídka (dropdown menu).
- **`<datalist>`**: Seznam předdefinovaných našeptávaných hodnot pro `<input>`.
- **`<progress>` & `<meter>`**: Indikátory průběhu a měřidla hodnoty.
- **`<output>`**: Místo pro zobrazení výsledků výpočtů v reálném čase.

---
<!-- slide: id=id12 title="Srovnání: button vs input, textarea vs input" tags="Core" diff="basics" -->
## Srovnání: `<button>` vs `<input>`, `<textarea>` vs `<input>`

1. **`<button>` versus `<input type="button|submit">`**:
   - `<button>` je párový element – můžete dovnitř vložit ikonu, obrázek či formátovaný text:
     ```html
     <button type="submit"><img src="/icons/save.svg" alt=""> Uložit změny</button>
     ```
   - `<input type="submit">` je nepárový tag a jeho text je omezen na čistý řetězec v atributu `value`.

2. **`<textarea>` versus `<input type="text">`**:
   - `<input type="text">` je striktně jednořádkový.
   - `<textarea rows="4" cols="50">` umožňuje zadat víceřádkový text se zalamováním řádků a uživatel může měnit jeho velikost tažením za roh.
