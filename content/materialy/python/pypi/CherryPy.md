<!-- slide: id=id1 title="Úvod do webových aplikací a CherryPy" tags="Core" diff="basics" -->
## Úvod do webových aplikací a CherryPy

Čím dál častěji se v moderním vývoji hodí psát uživatelské rozhraní programu jako webovou aplikaci místo nativního desktopového GUI. Webový prohlížeč je dostupný na každé platformě bez nutnosti portace.

**CherryPy** je minimalistický, objektově orientovaný webový framework pro Python. Umožňuje stavět webové aplikace přesně stejným způsobem, jakým píšete běžné pythonní třídy a metody.

Základní myšlenka CherryPy:
> Převzít HTTP požadavek z prohlížeče, podle zadaného URL stromově vyhledat odpovídající metodu pythonní třídy označenou `@cherrypy.expose`, a její návratovou hodnotu odeslat zpět klientovi jako HTTP odpověď.

---
<!-- slide: id=id2 title="Předpoklady: Architektura HTTP komunikace" tags="Core" diff="basics" -->
## Jak funguje komunikace prohlížeč – server

Při každé návštěvě webové stránky proběhne následující cyklus:

1. **Klient (prohlížeč)** vyřeší IP adresu cílového serveru (DNS) a naváže TCP spojení (typicky port 80 pro HTTP nebo 443 pro HTTPS).
2. **Odeslání HTTP dotazu**: Prohlížeč odešle požadavek specifikující metodu (`GET`, `POST`), cestu (`/info`) a hlavičky (`Host`, `User-Agent`).
3. **Zpracování na serveru**: Webový server (náš Python proces) vyhodnotí URL, spustí obslužnou funkci a vygeneruje odpověď.
4. **Odeslání HTTP odpovědi**: Server vrátí status kód (`200 OK`, `404 Not Found`), hlavičky (`Content-Type: text/html; charset=utf-8`) a tělo dokumentu.
5. **Vykreslení**: Prohlížeč zpracuje přijatý HTML/CSS/JS obsah a vykreslí stránku.

---
<!-- slide: id=id3 title="Pokusný HTTP server v CherryPy" tags="WOW" diff="pythonic" -->
## První funkční HTTP server

V CherryPy stačí k vytvoření plnohodnotného webového serveru pouhých několik řádků:

```python
# Program: server.py
import cherrypy

class NášServer:
    @cherrypy.expose
    def index(self) -> str:
        return "Zdraví Vás Váš osobní webový server v Pythonu!"

if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
```

Po spuštění `python server.py` CherryPy nastartuje integrovaný multi-threaded HTTP server na adrese `http://127.0.0.1:8080/`.

> [!NOTE]
> Dekorátor **`@cherrypy.expose`** explicitně označuje metody, které mají být veřejně přístupné z webu. Neoznačené metody zůstanou privátní pro interní pythonní logiku.

---
<!-- slide: id=id4 title="Webová stránka s dotazem" tags="Skip" diff="basics" -->
## Tvorba dotazu z klienta: Odkaz `<a>`

Nejjednodušším způsobem, jak z prohlížeče vygenerovat dotaz na kořenový dokument, je hypertextový odkaz:

```html
<a href="/">Přejít na kořen serveru (/)</a>
```

Při kliknutí na odkaz sestaví prohlížeč standardní HTTP `GET` požadavek.

---
<!-- slide: id=id5 title="Odeslání HTTP dotazu po síti" tags="Skip" diff="basics" -->
## Co odejde po síti: Surový HTTP požadavek

Při kliknutí na odkaz odešle prohlížeč na socket serveru textový HTTP dotaz:

```http
GET / HTTP/1.1
Host: localhost:8080
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
```

Dotaz specifikuje metodu `GET`, požadovanou cestu `/` a cílového hostitele.

---
<!-- slide: id=id6 title="HTTP odpověď serveru" tags="Skip" diff="basics" -->
## Co vrátí server: Surová HTTP odpověď

Server zpracuje metodu `index()` a vrátí formátovanou HTTP odpověď:

```http
HTTP/1.1 200 OK
Content-Type: text/html;charset=utf-8
Server: CherryPy/18.9.0
Content-Length: 47
Date: Mon, 27 Oct 2026 17:00:00 GMT

Zdraví Vás Váš osobní webový server v Pythonu!
```

Prohlížeč přečte hlavičku `Content-Type`, zjistí kódování `utf-8` a zobrazí text na obrazovce.

---
<!-- slide: id=id7 title="Mapování URL na metody třídy" tags="Skip" diff="basics" -->
## Principy mapování URL na metody v CherryPy

CherryPy mapuje URL cesty přímo na atributy a metody instance:

```python
class NášServer:
    @cherrypy.expose
    def index(self):
        # Odpovídá dotazu GET /
        return "Hlavní stránka"
```

Dotaz `GET /` odpovídá kořenovému dokumentu webu, který CherryPy automaticky předá metodě `index()`. Návratová hodnota typu `str` nebo `bytes` se stane tělem HTTP odpovědi.

---
<!-- slide: id=id8 title="Instalace knihovny CherryPy" tags="Core" diff="basics" -->
## Instalace CherryPy

Knihovna CherryPy není součástí standardní distribuce a instaluje se přes `pip`:

```bash
pip install cherrypy
```

CherryPy je čistý Python balíček bez závislostí na céčkovských kompilátorech. Integruje v sobě robustní produkční WSGI HTTP server, správce relací (*sessions*), autorizaci i obsluhu statických souborů.

---
<!-- slide: id=id9 title="Přidání dalších URL adres" tags="Core" diff="pythonic" -->
## Přidání dalších URL adres

Každá další metoda třídy označená `@cherrypy.expose` se automaticky stane novou URL adresou:

```python
import cherrypy

class NášServer:
    @cherrypy.expose
    def index(self) -> str:
        return "Kořen serveru (/)"

    @cherrypy.expose
    def pokus(self) -> str:
        return "Odpověď na dotaz /pokus"

    @cherrypy.expose
    def napoveda(self) -> str:
        return "Nápověda k aplikaci (/napoveda)"

if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
```

- `http://localhost:8080/` $\rightarrow$ zavolá `self.index()`
- `http://localhost:8080/pokus` $\rightarrow$ zavolá `self.pokus()`
- `http://localhost:8080/napoveda` $\rightarrow$ zavolá `self.napoveda()`

---
<!-- slide: id=id10 title="Struktura serverových tříd" tags="Skip" diff="basics" -->
## Modularita serveru

Do třídy serveru můžete přidat libovolné množství obslužných metod. Metody bez dekorátoru `@cherrypy.expose` zůstávají skryté a slouží pro interní byznys logiku, databázové dotazy a pomocné výpočty.

---
<!-- slide: id=id11 title="Předávání vstupních parametrů přes URL (Query String)" tags="WOW" diff="pythonic" -->
## Vstupní parametry dotazu: Query String

Parametry předané v URL adrese za otazníkem (`?klic=hodnota&klic2=hodnota2`) CherryPy automaticky namapuje na pojmenované argumenty metody:

```python
import cherrypy

class NášServer:
    @cherrypy.expose
    def info(self, jmeno: str = "Host", vek: str = "neznámý") -> str:
        return f"Jméno: <b>{jmeno}</b><br>Věk: <b>{vek}</b>"

if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
```

Volání v prohlížeči:
- `/info?jmeno=Alisa&vek=17` $\rightarrow$ `info(jmeno='Alisa', vek='17')`
- `/info?vek=25&jmeno=David` $\rightarrow$ pořadí parametrů v URL nehraje roli!
- `/info` $\rightarrow$ použijí se výchozí hodnoty z definice funkce!

---
<!-- slide: id=id12 title="Formuláře a metoda GET" tags="Skip" diff="basics" -->
## Odesílání formulářů metodou GET

Parametry lze uživatelsky zadávat pomocí HTML formuláře:

```html
<meta charset="utf-8">
<form action="/info" method="get">
    <label>Jméno: <input type="text" name="jmeno" value="Alisa"></label>
    <label>Věk: <input type="number" name="vek" value="17"></label>
    <button type="submit">Odeslat</button>
</form>
```

Při odeslání prohlížeč vezme hodnoty z políček podle jejich atributu `name` a sestaví URL: `/info?jmeno=Alisa&vek=17`.

---
<!-- slide: id=id13 title="Formuláře a metoda POST" tags="Core" diff="pythonic" -->
## Odesílání formulářů metodou POST

Při metodě `POST` se parametry neposílají v adrese URL, ale v těle HTTP požadavku:

```html
<form action="/info" method="post">
    <input type="text" name="jmeno">
    <input type="number" name="vek">
    <button type="submit">Odeslat POSTem</button>
</form>
```

Surový HTTP dotaz:
```http
POST /info HTTP/1.1
Host: localhost:8080
Content-Type: application/x-www-form-urlencoded
Content-Length: 21

jmeno=Alisa&vek=17
```

> [!IMPORTANT]
> Pro CherryPy je zpracování naprosto identické! Stejná pythonní metoda `def info(self, jmeno='', vek='')` automaticky obslouží jak `GET`, tak `POST` parametry bez nutnosti měnit jediný řádek kódu.

---
<!-- slide: id=id14 title="Poznámky k HTML formulářům" tags="Skip" diff="basics" -->
## Důležité vlastnosti HTML formulářů

- **`method="post"`**: Vhodné pro citlivá data (hesla), změny stavu na serveru (odeslání objednávky) a velké objemy dat.
- **`method="get"`**: Vhodné pro vyhledávání a filtrování, kde má mít výsledek unikátní URL pro uložení do záložek.
- **Skryté parametry (`<input type="hidden">`)**: Umožňují poslat skryté ID záznamu nebo CSRF token.
- **`enctype="multipart/form-data"`**: Vyžadováno při nahrávání souborů na server (`<input type="file">`).

---
<!-- slide: id=id15 title="Statické soubory v adresáři" tags="Core" diff="pythonic" -->
## Obsluha statických souborů (CSS, JS, obrázky)

Obrázky a stylopisy není efektivní vracet přes pythonní metody. CherryPy obsahuje vestavěný nástroj `tools.staticdir`:

```python
import cherrypy
import os

class NášServer:
    @cherrypy.expose
    def index(self) -> str:
        return '''
            <link rel="stylesheet" href="/static/style.css">
            <h1>Server běží s externím CSS!</h1>
        '''

if __name__ == '__main__':
    current_dir = os.path.abspath(os.path.dirname(__file__))
    config = {
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': os.path.join(current_dir, 'public'),
        }
    }
    cherrypy.quickstart(NášServer(), '/', config)
```

Dotaz na `/static/style.css` CherryPy automaticky přeloží na soubor `public/style.css` na disku.

---
<!-- slide: id=id16 title="Metoda quickstart() a mounting stromu" tags="Core" diff="pythonic" -->
## Metoda `cherrypy.quickstart()` a strom aplikací

Základní spuštění:

```python
cherrypy.quickstart(root_instance, script_name='/', config=None)
```

- `root_instance`: Kořenový objekt aplikace.
- `script_name`: Cesta v URL, kde je aplikace namontována (např. `'/api'`).
- `config`: Slovník konfigurace nebo cesta k souboru `.conf`.

Pro spuštění více nezávislých aplikací na jednom serveru slouží `cherrypy.tree.mount()` a `cherrypy.engine.start()`.

---
<!-- slide: id=id17 title="Zásady konfigurace CherryPy" tags="Core" diff="basics" -->
## Zásady konfigurace v CherryPy

Pravidla pro konfigurační slovníky:
1. **Hierarchické klíče**: Sekce odpovídají URL cestám (`'/'`, `'/static'`, `'/api'`).
2. **Absolutní cesty**: Cesty k adresářům na disku musí být vždy absolutní (`os.path.abspath(...)`), aby nedocházelo k chybám při spuštění z jiného pracovního adresáře.
3. **Globální konfigurace**: Globální nastavení serveru (číslo portu, adresa rozhraní) se nastavuje v `cherrypy.config.update({'server.socket_port': 8080})`.

---
<!-- slide: id=id18 title="Více sdílených adresářů" tags="Skip" diff="basics" -->
## Konfigurace více statických složek

Zjednodušení konfigurace pomocí kořene `tools.staticdir.root`:

```python
config = {
    '/': {
        'tools.staticdir.root': os.path.abspath(os.path.dirname(__file__)),
    },
    '/static': {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'public',
    },
    '/images': {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'assets/img',
    },
}
```

Díky nastavení `tools.staticdir.root` v sekci `'/'` stačí pro jednotlivé podsložky uvádět relativní cesty.

---
<!-- slide: id=id19 title="Hierarchické podadresy a vnořené aplikace" tags="Core" diff="paradigm" -->
## Hierarchické URL a vnořené aplikace

Pro tvorbu komplexních stromových struktur nabízí CherryPy dva přístupy:

1. **Atributy objektů**: Přiřazení podtřídy jako atributu nadřazené třídy:
   ```python
   class WebApp:
       def __init__(self):
           self.admin = AdminSection()
   ```
   Dotaz `/admin/users` automaticky zavolá metodu `users()` na instanci `AdminSection`!
2. **RESTové dynamické URL**: Dekorátor `@cherrypy.popargs()` pro zachytávání dynamických segmentů URL (`/band/nirvana/album/nevermind`).

---
<!-- slide: id=id20 title="Dynamické REST URL: @cherrypy.popargs" tags="WOW" diff="pythonic" -->
## Dynamické REST routování: `@cherrypy.popargs`

Chceme-li obsloužit URL typu `/nirvana/nevermind/06-polly`, použijeme `@cherrypy.popargs`:

```python
import cherrypy

@cherrypy.popargs('kapela', 'album', 'skladba')
class Prehravac:
    @cherrypy.expose
    def index(self, kapela: str, album: str, skladba: str) -> str:
        return f"Přehrávám skladbu <b>{skladba}</b> z alba <i>{album}</i> od <b>{kapela}</b>."

if __name__ == '__main__':
    cherrypy.quickstart(Prehravac())
```

Jednotlivé segmenty z URL cesty se automaticky rozparsují do pozičních parametrů metody `index()`.

---
<!-- slide: id=id21 title="Vnořené REST podaplikace" tags="Core" diff="paradigm" -->
## Vnořené REST podaplikace

Segmenty lze kombinovat s vnořenými třídami pro čistý REST návrh:

```python
import cherrypy

@cherrypy.popargs('cislo', 'nazev')
class Track:
    @cherrypy.expose
    def index(self, interpret: str, album: str, cislo: str, nazev: str) -> str:
        return f"Interpret: {interpret} | Album: {album} | Track: #{cislo} {nazev}"

@cherrypy.popargs('album')
class Album:
    def __init__(self):
        self.tracks = Track()

@cherrypy.popargs('interpret')
class Band:
    def __init__(self):
        self.albums = Album()

if __name__ == '__main__':
    cherrypy.quickstart(Band())
```

Dotaz `/nirvana/albums/nevermind/tracks/06/polly` předá parametry přes celý řetězec tříd!

---
<!-- slide: id=id22 title="Logování v CherryPy" tags="Core" diff="basics" -->
## Logování přístupů a chyb

CherryPy obsahuje integrovaný subsystém logování:

```python
import cherrypy

class NášServer:
    @cherrypy.expose
    def index(self) -> str:
        cherrypy.log("Uživatel navštívil index stránku!")
        return "Log zaznamenán."

if __name__ == '__main__':
    config = {
        '/': {
            'log.access_file': './logs/access.log',
            'log.error_file': './logs/error.log',
        }
    }
    cherrypy.quickstart(NášServer(), '/', config)
```

- `access_file`: Zaznamenává každý HTTP dotaz v Apache formátu (IP, čas, kód, user-agent).
- `error_file`: Zaznamenává tracebacky neošetřených výjimek a hlášení z `cherrypy.log()`.

---
<!-- slide: id=id23 title="Role CherryPy v ekosystému" tags="Skip" diff="basics" -->
## Role CherryPy v moderním ekosystému

CherryPy je čistý routingový a serverový engine:
- Neobsahuje vestavěný ORM (databáze připojujete přes SQLAlchemy).
- Neobsahuje vestavěný šablonovací engine (HTML generujete přes Jinja2 nebo f-stringy).
- Je extrémně stabilní, spolehlivý a vhodný pro mikroservisy, administrátorská rozhraní a embedované nástroje.

---
<!-- slide: id=id24 title="Jednoduché šablony v Pythonu" tags="Tricky" diff="pythonic" -->
## Jednoduché šablonování v Pythonu

Pro jednoduché stránky není nutné instalovat těžké šablonovací systémy:

```html
<!-- Program: sablona.html -->
<!DOCTYPE html>
<html>
<body>
    <h1>Informace o uživateli</h1>
    <p>Jméno: <b>{jméno}</b></p>
    <p>Věk: <b>{věk}</b></p>
</body>
</html>
```

V CherryPy aplikaci stačí šablonu načíst a formátovat:

```python
import cherrypy

with open('sablona.html', encoding='utf-8') as f:
    HTML_SABLONA = f.read()

class NášServer:
    @cherrypy.expose
    def info(self, jmeno: str = 'Host', vek: str = '0') -> str:
        return HTML_SABLONA.format(jméno=jmeno, věk=vek)

if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
```

Pro produkční aplikace s cykly a podmínkami v HTML je standardem knihovna **`Jinja2`**.
