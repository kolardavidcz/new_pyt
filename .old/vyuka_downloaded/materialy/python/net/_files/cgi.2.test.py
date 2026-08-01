import urllib.request
import urllib.parse


# URL dotazu
url = 'http://vyuka.hotaru/cgi-bin/cgi.1.py'

# příprava a zakódování dat
values = {
    'id': 'id123',
    'text': 'Data předávaná do CGI-skriptu.',
    }
data = urllib.parse.urlencode(values)

# výroba a odeslání POST-požadavku
req = urllib.request.Request(url, data)
resp = urllib.request.urlopen(req)

# výpis odpovědi
page = resp.read()
print(page)

