<!-- slide: id=id1 title="Úvod do WSGI (PEP 3333)" tags="Core" diff="newconcept" -->
## Úvod do rozhraní WSGI (PEP 3333)

**WSGI** (*Web Server Gateway Interface*, definované v PEP 3333) je fundamentální standard v ekosystému Pythonu, který definuje univerzální rozhraní mezi webovým serverem (např. Gunicorn, uWSGI, Nginx s mod_wsgi) a pythonní webovou aplikací (Django, Flask, CherryPy, Bottle).

Význam WSGI:
- **Oddělení serveru od aplikace**: Aplikaci můžete napsat jednou a spustit ji na libovolném WSGI serveru bez změn v kódu.
- **Middleware architektura**: Mezi server a aplikaci lze vkládat řetězené obalové vrstvy (*middleware*) zajišťující autentizaci, routování, logování nebo kompresi gzip.
- **Součást standardní knihovny**: Modul **`wsgiref`** poskytuje referenční implementaci serveru přímo v Pythonu bez externích instalací.

---
<!-- slide: id=id2 title="Anatomie WSGI aplikace" tags="Core" diff="pythonic" -->
## Anatomie WSGI aplikace

Minimální WSGI aplikace je jakýkoliv volatelný objekt (*callable* – funkce nebo třída) se signaturou `(environ, start_response)`:

```python
def application(environ: dict, start_response) -> list[bytes]:
    # 1. Příprava těla odpovědi v bajtech (UTF-8)
    body = "Ahoj ze světa WSGI!".encode("utf-8")

    # 2. Nastavení HTTP hlaviček
    response_headers = [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ]

    # 3. Zahájení odpovědi (HTTP status kód a hlavičky)
    start_response("200 OK", response_headers)

    # 4. Návrat iterovatelného objektu s bajty těla
    return [body]
```

Klíčová pravidla PEP 3333:
- Tělo odpovědi musí být **iterovatelný objekt vracející bajty** (`bytes`), nejčastěji jednoprvkový seznam `[body]`.
- Návrat holého `bytes` nebo řetězce `str` je chybou (interpret by iteroval po jednotlivých bajtech!).

---
<!-- slide: id=id3 title="Spuštění lokálního WSGI serveru: wsgiref" tags="Core" diff="basics" -->
## Spuštění lokálního serveru pomocí `wsgiref`

Pro lokální vývoj a testování obsahuje standardní knihovna modul `wsgiref.simple_server`:

```python
from wsgiref.simple_server import make_server

def application(environ, start_response):
    body = b"Ahoj ze serveru wsgiref!"
    start_response("200 OK", [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ])
    return [body]

if __name__ == '__main__':
    with make_server('127.0.0.1', 8080, application) as httpd:
        print("WSGI server běží na http://127.0.0.1:8080/ (Ctrl+C pro ukončení)...")
        httpd.serve_forever()
```

- **`serve_forever()`**: Server běží v nekonečné smyčce a obsluhuje příchozí požadavky.
- **`handle_request()`**: Zpracuje přesně jeden dotaz a ukončí se (vhodné pro integrační testy).

---
<!-- slide: id=id4 title="Slovník prostředí: environ I" tags="Core" diff="basics" -->
## Slovník prostředí: `environ`

První argument `environ` je běžný pythonní slovník (`dict`), který server naplní všemi údaji o HTTP požadavku a prostředí:

```python
def application(environ, start_response):
    lines = ["PŘEHLED PROMĚNNÝCH ENVIRON:\n"]
    for k, v in sorted(environ.items()):
        lines.append(f"{k}: {v}\n")
    
    body = "".join(lines).encode("utf-8")
    start_response("200 OK", [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body))),
    ])
    return [body]
```

Při otevření stránky v prohlížeči uvidíte kompletní stav spojení.

---
<!-- slide: id=id5 title="Klíčové proměnné v environ II" tags="Core" diff="basics" -->
## Klíčové proměnné v `environ`

Slovník `environ` kombinuje CGI proměnné a WSGI specifické klíče:

- **`REQUEST_METHOD`**: HTTP metoda požadavku (`GET`, `POST`, `PUT`, `DELETE`).
- **`PATH_INFO`**: Požadovaná cesta URL (např. `/produkty/detail`, vždy začíná `/`).
- **`QUERY_STRING`**: Řetězec parametrů v URL za znakem `?` (např. `id=42&sort=asc`).
- **`CONTENT_LENGTH`**: Délka těla požadavku v bajtech (u `GET` je prázdná, u `POST` obsahuje číslo).
- **`CONTENT_TYPE`**: MIME typ těla požadavku (např. `application/json` nebo `application/x-www-form-urlencoded`).
- **`HTTP_*`**: Všechny klientské HTTP hlavičky (např. `HTTP_USER_AGENT`, `HTTP_COOKIE`, `HTTP_AUTHORIZATION`).
- **`wsgi.input`**: Binární vstupní proud (`io.BufferedReader`) pro čtení těla požadavku.

---
<!-- slide: id=id6 title="Získání dat z GETu versus POSTu" tags="Skip" diff="basics" -->
## Rozdíly v přenosu dat: GET vs. POST

- **Metoda GET**:
  - Data jsou předána v URL adrese v proměnné `environ['QUERY_STRING']`.
  - Vhodné pro bezpečné operace čtení, filtrování a záložky v prohlížeči.
- **Metoda POST**:
  - Data jsou přenášena v těle zprávy v binárním proudu `environ['wsgi.input']`.
  - Vhodné pro odesílání formulářů, JSON payloadů a nahrávání souborů.

---
<!-- slide: id=id7 title="Zpracování GET parametrů: QUERY_STRING" tags="Skip" diff="basics" -->
## Zpracování GET parametrů z URL

Při návštěvě URL `http://localhost:8080/?jmeno=Alisa&vek=17`:

```python
query = environ.get('QUERY_STRING', '')
# query obsahuje surový řetězec: 'jmeno=Alisa&vek=17'
```

Speciální znaky a diakritika jsou automaticky přeneseny v tzv. **URL encoding** (procentové kódování, např. `%20` pro mezeru, `%C4%9B` pro `ě`).

---
<!-- slide: id=id8 title="Zlaté bezpečnostní pravidlo webového vývoje" tags="Skip" diff="basics" -->
## Zlaté pravidlo: Nikdy nevěřte uživatelskému vstupu!

> [!CAUTION]
> **Data z `environ` (zejména `QUERY_STRING`, hlavičky i `wsgi.input`) pocházejí přímo z nedůvěryhodného vnějšího internetu!**
> 
> Vždy validujte typy, délky a formáty dat. Nikdy nevkládejte neošetřená uživatelská data přímo do HTML výstupu (prevence XSS – Cross-Site Scripting) ani do databázových dotazů (prevence SQL Injection).

---
<!-- slide: id=id9 title="Parsování query parametrů: urllib.parse.parse_qs" tags="Core" diff="pythonic" -->
## Parsování query parametrů: `urllib.parse.parse_qs()`

Pro rozparsování `QUERY_STRING` do pythonního slovníku slouží funkce **`parse_qs()`**:

```python
from urllib.parse import parse_qs

def application(environ, start_response):
    query_string = environ.get('QUERY_STRING', '')
    
    # parse_qs vrací dict, kde každá hodnota je seznam (list):
    params = parse_qs(query_string)
    # Pro ?jmeno=Alisa&role=admin&role=editor vrátí:
    # {'jmeno': ['Alisa'], 'role': ['admin', 'editor']}

    jmeno = params.get('jmeno', ['Neznámý'])[0]
    body = f"Vítej, {jmeno}!".encode('utf-8')

    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
    return [body]
```

---
<!-- slide: id=id10 title="Zpracování POST dat a wsgi.input" tags="Core" diff="newconcept" -->
## Zpracování POST dat přes `wsgi.input`

Při odeslání dat metodou `POST` leží data v binárním proudu `environ['wsgi.input']`.

Způsob kódování se řídí hlavičkou `CONTENT_TYPE`:
1. **`application/x-www-form-urlencoded`**: Standardní formulář (klíče a hodnoty v URL kódování).
2. **`application/json`**: Moderní REST API payload.
3. **`multipart/form-data`**: Formulář s nahrávanými soubory.

> [!IMPORTANT]
> Dle specifikace PEP 3333 **musíte** metodě `read()` předat přesný počet bajtů k načtení získaný z `int(environ['CONTENT_LENGTH'])`! Volání `read()` bez argumentu může vést k zablokování serveru, protože proud nemusí poslat EOF signál.

---
<!-- slide: id=id11 title="POST typu application/x-www-form-urlencoded" tags="Tricky" diff="pythonic" -->
## Čtení formulářových POST dat

Příklad zpracování běžného POST formuláře:

```python
from urllib.parse import parse_qs

def application(environ, start_response):
    if environ.get('REQUEST_METHOD') == 'POST':
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
        except ValueError:
            content_length = 0

        # Načtení přesně daného počtu bajtů
        raw_body = environ['wsgi.input'].read(content_length)
        post_data = parse_qs(raw_body.decode('utf-8'))
        
        jmeno = post_data.get('jmeno', ['Anonym'])[0]
        body = f"Přijato jméno: {jmeno}".encode('utf-8')
    else:
        body = b"Odeslete formular metodou POST."

    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
    return [body]
```

---
<!-- slide: id=id12 title="POST typu multipart/form-data: Struktura MIME" tags="Skip" diff="basics" -->
## Upload souborů a formát `multipart/form-data`

Při nahrávání souborů odesílá prohlížeč data jako **vícedílný MIME dokument** oddělený unikátní hranicí (*boundary*):

```text
-----------------------------123504625239007772824141014506
Content-Disposition: form-data; name="jmeno"

Alisa
-----------------------------123504625239007772824141014506
Content-Disposition: form-data; name="soubor"; filename="foto.png"
Content-Type: image/png

<binární bajty PNG obrázku>
-----------------------------123504625239007772824141014506--
```

Každá položka formuláře má svou vlastní dílčí hlavičku a datový blok.

---
<!-- slide: id=id13 title="Anatomie MIME zprávy" tags="Skip" diff="basics" -->
## Části MIME zprávy

Každý oddělený segment obsahuje:
- **`Content-Disposition`**: Udává, že jde o `form-data`, jméno pole (`name="soubor"`) a původní název souboru (`filename="..."`).
- **`Content-Type`**: MIME typ nahrávaného souboru (např. `image/png`, `application/pdf`).
- **Prázdný řádek `\r\n`**: Odděluje hlavičky části od binárního obsahu.

---
<!-- slide: id=id14 title="Oddělovací řetězec: boundary" tags="Skip" diff="basics" -->
## Oddělovací řetězec: *boundary*

Hlavička `CONTENT_TYPE` obsahuje specifikaci oddělovače:
`multipart/form-data; boundary=---------------------------123504625`

Poslední hranice celého těla končí dvěma pomlčkami: `--boundary--`.

---
<!-- slide: id=id15 title="Konec podpory modulu cgi v Pythonu 3.13" tags="Skip" diff="basics" -->
## Konec modulu `cgi` v Pythonu 3.13 (PEP 594)

Po celá desetiletí se k parsování `multipart/form-data` používala třída `cgi.FieldStorage`.

> [!WARNING]
> Dle **PEP 594** byl zastaralý modul `cgi` v **Pythonu 3.13 kompletně odstraněn ze standardní knihovny**!
> Moderní aplikace musí pro parsování multipart dat používat moderní knihovny (jako `multipart` / `python-multipart`) nebo modul `email`.

---
<!-- slide: id=id16 title="Parsování MIME zpráv standardním modulem email" tags="Skip" diff="basics" -->
## Parsování MIME zpráv pomocí modulu `email`

Ve standardní knihovně lze k rozbalení dílů využít balíček `email`:

```python
import email

# Sestavení zprávy z binárních dat
msg = email.message_from_bytes(data)

for part in msg.walk():
    if part.is_multipart():
        continue
    field_name = part.get_param('name', header='Content-Disposition')
    filename = part.get_filename()
    payload = part.get_payload(decode=True)
```

---
<!-- slide: id=id17 title="Kompletní ukázka zpracování uploadu" tags="Tricky" diff="pythonic" -->
## Příklad: Zpracování uploadu ve WSGI

Příjem a uložení souboru:

```python
import email

def application(environ, start_response):
    if environ.get('REQUEST_METHOD') == 'POST':
        cl = int(environ.get('CONTENT_LENGTH', 0))
        # Předřazení Content-Type hlavičky pro korektní MIME parsování
        header = f"Content-Type: {environ['CONTENT_TYPE']}\r\n\r\n".encode('utf-8')
        raw_stream = environ['wsgi.input'].read(cl)
        
        msg = email.message_from_bytes(header + raw_stream)
        for part in msg.walk():
            filename = part.get_filename()
            if filename:
                # Uložení nahraného souboru na disk
                with open(f"/tmp/{filename}", "wb") as f:
                    f.write(part.get_payload(decode=True))
```

---
<!-- slide: id=id18 title="Moderní externí knihovna: python-multipart" tags="WOW" diff="pythonic" -->
## Moderní standard: Knihovna `multipart`

V reálných projektech se doporučuje používat specializovanou, rychlou a bezpečnou knihovnu **`python-multipart`** (využívanou např. ve Starlette a FastAPI):

```bash
pip install python-multipart
```

```python
from multipart import parse_form_data

def application(environ, start_response):
    if environ.get('REQUEST_METHOD') == 'POST':
        # parse_form_data automaticky obslouží jak urlencoded, tak multipart stream!
        forms, files = parse_form_data(environ)
        
        username = forms.get('username')
        if 'avatar' in files:
            uploaded_file = files['avatar']
            print(f"Uložen soubor {uploaded_file.filename} o velikosti {uploaded_file.size} B")
```

---
<!-- slide: id=id19 title="Závěrečná doporučení pro WSGI aplikace" tags="Skip" diff="basics" -->
## Shrnutí a best practices

1. **WSGI je kontrakt**: Aplikace očekává `(environ, start_response)` a vrací iterovatelný objekt s bajty (`list[bytes]`).
2. **Čtení `wsgi.input`**: Vždy respektujte `CONTENT_LENGTH`.
3. **Výjimky v aplikaci**: Pokud aplikace selže po zavolání `start_response`, předejte třetí argument `start_response(status, headers, sys.exc_info())`.
4. **Produkční nasazení**: Pro produkci nepoužívejte `wsgiref.simple_server` (je pomalý a jednovláknový). Použijte produkční aplikační server jako **Gunicorn** nebo **uWSGI** za reverzní proxy Nginx.
