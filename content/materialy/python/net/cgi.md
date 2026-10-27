<!-- slide: id=id1 title="Úvod" tags="Tricky" diff="newconcept" -->
## Úvod do zpracování parametrů a zánik modulu `cgi`

Dlouhá léta sloužila pro zpracování HTTP parametrů metod **GET** a **POST** třída `cgi.FieldStorage()` ze standardní knihovny.

V Pythonu 3.11 byl však celý modul `cgi` označen za zastaralý (*deprecated*) a v **Pythonu 3.13 byl v rámci PEP 594 („Removing Dead Batteries“) ze standardní knihovny definitivně odstraněn**.

### Jak nahradit modul `cgi` v moderním Pythonu (3.12+ / 3.13+):
1. **Parametry GET a URL kódovaný POST** (`application/x-www-form-urlencoded`):
   - Přímá a doporučená náhrada ve standardní knihovně: **`urllib.parse.parse_qs()`** a **`urllib.parse.parse_qsl()`**.
2. **POST s nahráváním souborů** (`multipart/form-data`):
   - Ve standardní knihovně lze složitě použít `email.message` / `email.parser`, což je však pro webové formuláře neintuitivní.
   - V moderní praxi se používají specializované knihovny jako **`python-multipart`** nebo webové frameworky (Flask, FastAPI, Starlette, Django), které mají robustní parsing vestavěný.

> [!NOTE]
> Modul `cgi` byl původně navržen pro staré rozhraní CGI z 90. let. V éře WSGI a ASGI byl již dávno překonán modernějšími abstrakcemi, přesto se v historických kurzech stále vyskytuje kvůli pochopení základních principů HTTP vstupu.

---
<!-- slide: id=id2 title="GET – „cgi.FieldStorage()“" tags="Skip" diff="basics" -->
## Zpracování GET parametrů (Historie vs. Moderní standard)

Při požadavku typu GET jsou parametry předávány přímo v URL adrese za otazníkem (`QUERY_STRING`).

### Historický způsob pomocí `cgi.FieldStorage` (do Pythonu 3.12):

```python
import cgi
from wsgiref.simple_server import make_server

def application(environ: dict, start_response):
    # cgi.FieldStorage automaticky přečetl environ['QUERY_STRING']
    form = cgi.FieldStorage(environ=environ)

    # a) getvalue(): typ záleží na počtu výskytů (str nebo list[str])!
    body = "getvalue():\n"
    for key in sorted(form):
        body += f"{key}: {form.getvalue(key)}\n"

    # b) getlist(): typ je VŽDY seznam (list[str])
    body += "\ngetlist():\n"
    for key in sorted(form):
        body += f"{key}: {form.getlist(key)}\n"

    body_bytes = body.encode("utf-8")
    start_response("200 OK", [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body_bytes))),
    ])
    return [body_bytes]
```

### Moderní standardní náhrada (`urllib.parse.parse_qs`):

```python
from urllib.parse import parse_qs

def application(environ: dict, start_response):
    query_string = environ.get("QUERY_STRING", "")
    params = parse_qs(query_string, keep_blank_values=True)
    # params je dict[str, list[str]], např. {'par1': ['ahoj', '456'], 'par2': ['123']}

    body = f"Moderní parse_qs: {params}\n"
    body_bytes = body.encode("utf-8")
    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
    return [body_bytes]
```

> [!WARNING]
> Hodnoty získané z URL nebo těla požadavku jsou **neošetřený uživatelský vstup**. Před použitím v databázových dotazech nebo renderováním do HTML musí být validovány a escapovány!

---
<!-- slide: id=id3 title="POST I" tags="Skip" diff="basics" -->
## Zpracování těla formuláře POST

Data odeslaná metodou **POST** se nepředávají v URL, nýbrž v těle HTTP požadavku. Ve WSGI prostředí jsou přístupná přes proud **`environ['wsgi.input']`**:

```python
from wsgiref.simple_server import make_server
from urllib.parse import parse_qs

HTML_FORM = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>POST Demo</title></head>
<body>
    <form method="post" action="/">
        <fieldset>
            <legend><input type="submit" value="Odeslat"></legend>
            <p>Jméno (jedinečná hodnota): <input type="text" name="jmeno"></p>
            <p>Jazyky (více hodnot):
                <label><input name="jazyky" type="checkbox" value="eng"> Angličtina</label>,
                <label><input name="jazyky" type="checkbox" value="rus"> Ruština</label>,
                <label><input name="jazyky" type="checkbox" value="jap"> Japonština</label>
            </p>
        </fieldset>
    </form>
    <div>{vysledek}</div>
</body>
</html>"""

def application(environ: dict, start_response):
    result = ""
    if environ.get("REQUEST_METHOD") == "POST":
        try:
            content_length = int(environ.get("CONTENT_LENGTH", 0))
        except ValueError:
            content_length = 0

        post_body = environ["wsgi.input"].read(content_length).decode("utf-8")
        data = parse_qs(post_body, keep_blank_values=True)
        result = f"<p><strong>Přijatá data:</strong> {data}</p>"

    response_html = HTML_FORM.format(vysledek=result).encode("utf-8")
    start_response("200 OK", [
        ("Content-Type", "text/html; charset=utf-8"),
        ("Content-Length", str(len(response_html))),
    ])
    return [response_html]
```

> [!IMPORTANT]
> Proud `environ['wsgi.input']` smí být čten pouze do velikosti určené hlavičkou `CONTENT_LENGTH`. Nekonečné čtení `read()` bez uvedení délky by mohlo způsobit zablokování serveru.

---
<!-- slide: id=id4 title="POST IIa" tags="Skip" diff="basics" -->
## Nahrávání souborů a multipart/form-data

Pokud formulář obsahuje nahrávání souborů (`<input type="file">`), musí mít atribut **`enctype="multipart/form-data"`**.

V takovém případě tělo požadavku obsahuje oddělovače jednotlivých polí (*boundaries*) a binární bloky:

```python
import html
from wsgiref.simple_server import make_server

# Historický přístup s cgi.FieldStorage (Python <= 3.12)
# form = cgi.FieldStorage(fp=environ['wsgi.input'], environ=environ)
# soubor_data = form.getvalue('soubor')  # bytes pro binární soubor

# V moderním Pythonu 3.12+ / 3.13+:
# Pro zpracování multipart/form-data se standardně využívá knihovna python-multipart
# nebo frameworky jako Starlette / FastAPI:
#
# from starlette.requests import Request
# async def upload_endpoint(request: Request):
#     form = await request.form()
#     upload_file = form['soubor']  # UploadFile objekt
#     contents = await upload_file.read()

HTML_UPLOAD = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Upload</title></head>
<body>
    <form method="post" enctype="multipart/form-data" action="/">
        <fieldset>
            <legend><input type="submit" value="Nahrát"></legend>
            <p>Popis: <input name="popis" type="text"></p>
            <p>Soubor: <input name="soubor" type="file"></p>
        </fieldset>
    </form>
</body>
</html>"""
```

Klíčové komponenty při přenosu souborů:
- **`enctype="multipart/form-data"`**: Prohlížeč negeneruje prostý URL-encoded řetězec, ale MIME strukturovaný balíček.
- **Hlavička `Content-Type`**: Obsahuje unikátní `boundary=----WebKitFormBoundary...` pro oddělení položek.

---
<!-- slide: id=id5 title="POST IIb" tags="Skip" diff="basics" -->
## Analýza výstupu a bezpečnostní escapování

Při ladění požadavků na serverové konzoli vidíme strukturu formulářových dat i přístupový log HTTP serveru:

```plain
# 1. Čisté načtení formuláře metodou GET
form: FieldStorage(None, None, [])
127.0.0.1 - - [05/Apr/2026 15:18:58] "GET / HTTP/1.1" 200 455

# 2. Odeslání formuláře pouze s vyplněným textovým polem ('šachovnice')
form: FieldStorage(
    None, None,
    [
        FieldStorage('popis', None, 'šachovnice'),
        FieldStorage('soubor', '', b'')
    ]
)
127.0.0.1 - - [05/Apr/2026 15:19:06] "POST / HTTP/1.1" 200 545

# 3. Odeslání formuláře s textem i nahraným binárním obrázkem PNG
form: FieldStorage(
    None, None,
    [
        FieldStorage('popis', None, 'šachovnice'),
        FieldStorage('soubor', 'sachovnice.png', b'\x89PNG\r\n\x1a\n...')
    ]
)
127.0.0.1 - - [05/Apr/2026 15:19:19] "POST / HTTP/1.1" 200 546
```

### Proč je nutné použít `html.escape()`?

Pokud server vrací uživatelem zadané hodnoty zpět do stránky (např. vypsání typu souboru `<class 'bytes'>` nebo jména souboru), znaky `<` a `>` by prohlížeč interpretoval jako HTML tagy:

```python
import html

safe_type = html.escape(str(type(soubor_data)))
# '<class \'bytes\'>' se převede na '&lt;class \'bytes\'&gt;'
```

> [!CAUTION]
> Vypsání neošetřeného vstupu od uživatele zpět do HTML dokumentu způsobuje kritickou zranitelnost **Cross-Site Scripting (XSS)**!

---
<!-- slide: id=id6 title="Získávání parametrů – „getlist()“, „getfirst()“" tags="Tricky" diff="pythonic" -->
## Získávání parametrů: Bezpečný návrh API

Jelikož HTTP klient může poslat libovolný počet parametrů se stejným názvem (např. `?id=1&id=2`), spoléhání na metody s nejednoznačným návratovým typem vede k závažným chybám.

### Problém metody `getvalue()`:
- Pokud parametr existuje **jednou**: vrátí `str` (např. `'ahoj'`).
- Pokud parametr existuje **vícekrát**: vrátí `list[str]` (např. `['ahoj', 'svete']`).
- Pokud parametr **neexistuje**: vrátí `None`.

Kód předpokládající jeden řetězec pak selže s `AttributeError: 'list' object has no attribute 'strip'`.

### Řešení: Explicitní metody s garantovaným typem:

1. **`getlist(klíč)`**:
   - Vždy garantuje návrat **seznamu** (`list[str]`).
   - Pokud klíč chybí, vrátí prázdný seznam `[]`.
   - Ideální pro checkboxy, vícenásobné výběry a štítky.

2. **`getfirst(klíč, default=None)`**:
   - Vždy vrátí **právě jednu hodnotu** (první nalezenou).
   - Pokud je parametr zadán vícekrát, ostatní ignoruje.
   - Pokud chybí, vrátí zadanou výchozí hodnotu `default`.

```python
from urllib.parse import parse_qs

# Moderní ekvivalent v Pythonu 3:
data = parse_qs("lang=py&lang=rs&user=alice")

# Ekvivalent getlist():
languages = data.get("lang", [])         # ['py', 'rs']

# Ekvivalent getfirst():
user = data.get("user", [None])[0]       # 'alice'
missing = data.get("missing", [None])[0] # None
```
