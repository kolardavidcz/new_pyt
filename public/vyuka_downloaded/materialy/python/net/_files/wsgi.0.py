# WSGI-klient
def application(environ, start_response):
    # vlastní tělo HTTP-odpovědi (pro Python 3.x jako bajtový objekt)
    body = bytes('Ahoj, světe!', encoding='utf-8')
    # návratové hlavičky HTTP-odpovědi (kvůli délce vyžadují již známé tělo)
    response_headers = [
        ("Content-type", "text/plain"),
        ("Content-length", str(len(body)) ),
    ]
    # „nastartování“ HTTP-odpovědi
    start_response("200 OK", response_headers)
    # vrácení iterovatelného objektu s tělem odpovědi
    return [body,]
