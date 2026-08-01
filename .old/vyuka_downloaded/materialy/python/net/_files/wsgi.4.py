from email.message import Message
from urllib.parse import parse_qs

html = """
    <meta charset="utf-8" />
    <form method="post" action="wsgi.4.py">
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
        </fieldset>
    </form>
    <p>
        {}
    </p>
"""

def application(environ, start_response):
    if (environ['REQUEST_METHOD'] in ('POST', 'PUT')):
        cl = int(environ['CONTENT_LENGTH'])
        msg = Message()
        msg.set_payload(environ['wsgi.input'].read(cl))
        form = parse_qs(msg.get_payload())    # vrací dict
    else:
        form = {}
    body = '<em>wsgi.input</em> skrz <em>email.Message</em>:<br/>'
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
