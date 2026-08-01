import urllib.request


# výroba a odeslání POST-požadavku
req = urllib.request.Request(url='http://vyuka.hotaru/cgi-bin/cgi.1.py',
                             data='Data predavana do stdin-proudu CGI-skriptu.')
resp = urllib.request.urlopen(req)

# rozkódování a výpis odpovědi
page = resp.read().decode('utf-8')
print(page)

