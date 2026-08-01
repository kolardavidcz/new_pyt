from multipart import parse_form_data, MultiDict

html = """
    <meta charset="utf-8" />
    <form method="post" accept-charset="utf-8" enctype="multipart/form-data" action="multipart.0.py">
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

def application(environ, start_response):
    if (environ['REQUEST_METHOD'] in ('POST', 'PUT')):
        form, file = parse_form_data(environ)
    else:
        form, file = MultiDict(), MultiDict()
    body = '<em>wsgi.input</em> skrz <em>multipart</em>:<br/>'
    body += '<b>form:</b><br/>'
    for key, value in form.iterallitems():
        body += f'\t{key}: {value}<br/>'
    body += '<b>file:</b><br/>'
    for key, value in file.iterallitems():
        body += f'\t{key}: {value.name} | {value.filename} | {value.size} | {value.raw}<br/>'
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
