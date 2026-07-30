import email
from email.iterators import _structure

html = """
    <meta charset="utf-8" />
    <form method="post" accept-charset="utf-8" enctype="multipart/form-data" action="wsgi.5.py">
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
    <pre>{}</pre>
"""

def application(environ, start_response):
    if (environ['REQUEST_METHOD'] in ('POST', 'PUT')):
        cl = int(environ['CONTENT_LENGTH'])
        data = environ['wsgi.input'].read(cl)   # bytes
        print(data)
    else:
        data = ''
    body = '<em>wsgi.input</em> skrz <em>email</em>:<br/>'
    response_body = html.format(body, data)
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
