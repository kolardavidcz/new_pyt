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

# příprava hlaviček
user_agent = 'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT)'
headers = { 'User-Agent' : user_agent }

# výroba a odeslání POST-požadavku
req = urllib.request.Request(url, data, headers)
resp = urllib.request.urlopen(req)

# výpis odpovědi
page = resp.read()
print(page)

