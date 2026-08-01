import cgi

def application(environ, start_response):
    form = cgi.FieldStorage(environ=environ)
    
    # a) typ návratové hodnoty záleží na počtu výskytů
    body = 'getvalue():\n'
    for key in sorted(form):
        body += str(key) + ': ' + str(form.getvalue(key)) + '\n'
    # b) typ návratové hodnoty je vždy 'seznam'
    body += '\ngetlist():\n'
    for key in sorted(form):
        body += str(key) + ': ' + str(form.getlist(key)) + '\n'
    
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
