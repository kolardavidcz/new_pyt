def application(environ, start_response):
    body = 'ENVIRON\n\n'
    for key, value in sorted(environ.items()):
        body += str(key) + ': ' + str(value) + '\n'
    body = bytes(body, encoding='utf-8')
    response_headers = [
        ("Content-type", "text/plain"),
        ("Content-length", str(len(body)) ),
    ]
    start_response("200 OK", response_headers)
    return [body,]

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    server = make_server('localhost', 8080, application)
    server.handle_request()
