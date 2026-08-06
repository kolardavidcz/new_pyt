from urllib.parse import parse_qs

def application(environ, start_response):

    body = 'ENVIRON (pouze QUERY_STRING)\n\n'
    body += str(environ['QUERY_STRING']) + '\n\n'

    form = parse_qs(environ['QUERY_STRING'])    # vrací dict
    for key, value in form.items():
        body += key + ': ' + str(value) + '\n'

    body = bytes(body, encoding='utf-8')

    response_headers = [
        ("Content-type", "text/plain; charset=UTF-8"),
        ("Content-length", str(len(body)) ),
    ]

    start_response("200 OK", response_headers)
    return [body,]
 
if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    server = make_server('localhost', 8080, application)
    #server.handle_request()
    server.serve_forever()
