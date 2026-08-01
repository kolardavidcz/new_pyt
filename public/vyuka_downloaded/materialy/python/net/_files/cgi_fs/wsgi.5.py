import cgi
import html

txt = """
    <meta charset="utf-8">
    <form method="post" enctype="multipart/form-data" action="wsgi.5.py">
        <fieldset>
            <legend>
                <input type="submit" value="odeslat">
            </legend>
            <p>
                popis: <input name="popis" type="text">
            </p>
            <p>
                soubor <input name="soubor" type="file">
            </p>
        </fieldset>
    </form>
    <p>
        {0}{1}
    </p>
"""

def application(environ, start_response):
    form = cgi.FieldStorage(fp=environ['wsgi.input'], environ=environ)
    print('form:', form)
    
    # a) textový popis
    popis = form.getvalue('popis')
    if popis != None:
        popis = 'popis: ' + popis + '<br/>'
    # b) binární data
    soubor = form.getvalue('soubor')
    if soubor != None:
        soubor = 'soubor typu: ' + html.escape( str(type(soubor)) ) + \
                 ' o délce ' + str(len(soubor)) + ' bajtů<br/>'
    
    body = txt.format(popis or '', soubor or '')
    response_body = bytes(body, encoding='utf-8')
    response_headers = [
        ("Content-type", "text/html"),
        ("Content-length", str(len(response_body)) ),
    ]
    start_response("200 OK", response_headers)
    return [response_body,]

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    server = make_server('localhost', 8080, application)
    server.serve_forever()
