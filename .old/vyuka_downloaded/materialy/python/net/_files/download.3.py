from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# příprava dotazu
url = 'http://vyuka.hotaru/priklady/_txt/example.txt'
req = Request(url)

# příprava návratové hodnoty
content = b''

# pokus o provedení dotazu
try:
    response = urlopen(req)
except HTTPError as e:
    print('Server nemohl úspěšně odpovědět na dotaz.')
    print('Kód chyby: ', e.code)
except URLError as e:
    print('Server je nedostupný.')
    print('Důvod: ', e.reason)
else:
    # vše je v pořádku, zpracujme výsledek
    content = response.read()
    print( 'Content:', content )

