import email
from collections import defaultdict

html = """
    <meta charset="utf-8" />
    <form method="post" accept-charset="utf-8" enctype="multipart/form-data" action="wsgi.6.py">
        <fieldset>
            <legend>
                <input type="submit" value="odeslat">
            </legend>
            <p>
                Jméno (<em>jedinečná hodnota</em>): <input type="text" name="jmeno">
            </p>
            <p>
                Jazyky (<em>více hodnot</em>):
                angličtina <input name="jazyky" type="checkbox" value="eng"> ,
                ruština <input name="jazyky" type="checkbox" value="rus"> ,
                japonština <input name="jazyky" type="checkbox" value="jap">
            </p>
            <p>
                Fotka: <input name="soubor" type="file">
            </p>
        </fieldset>
    </form>
    <p>
        {}
    </p>
"""

post_data_template = b'''Content-Type: %b\r\n\r\n%b'''

def application(environ, start_response):
    if (environ['REQUEST_METHOD'] in ('POST', 'PUT')):
        # příprava kompletní 'multipart/form-data' zprávy..
        cl = int(environ['CONTENT_LENGTH'])
        data = post_data_template % (
            environ['CONTENT_TYPE'].encode('utf-8'),    # str ⇒ bytes
            environ['wsgi.input'].read(cl)              # to už jsou bytes
        )
        msg = email.message_from_bytes(data)
        # ..pro potřeby jejího naparsování
        form = defaultdict(list)
        for part in msg.walk():
            # obalovou hlavičku přeskočíme
            if part.is_multipart():
                continue
            # hodnota hlavičky „name“, tj. formulářový prvek
            k, v = part.get_param('name', header='Content-Disposition'), part.get_payload()
            # není to náhodou soubor?
            f = part.get_filename()
            if f != None:
                form[k].append((f, v))
            else:
                form[k].append(v)
        #print(form)
    else:
        form = {}
    body = '<em>wsgi.input</em> skrz <em>email</em>:<br/>'
    for key, value in sorted(form.items()):
        body += key + ': ' + str(value) + '<br/>'
    response_body = html.format(body)
    response_body = bytes(response_body, encoding='utf-8')
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
