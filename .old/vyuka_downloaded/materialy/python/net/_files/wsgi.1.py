# WSGI-klient
def application(environ, start_response):
    body = bytes('Ahoj, světe!', encoding='utf-8')
    response_headers = [
        ("Content-type", "text/plain"),
        ("Content-length", str(len(body)) ),
    ]
    start_response("200 OK", response_headers)
    return [body,]

# WSGI-server (spuštěn pro jednu odpověď)
if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    server = make_server('localhost', 8080, application)
    server.handle_request()
