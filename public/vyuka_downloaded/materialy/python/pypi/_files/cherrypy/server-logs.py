#!/usr/bin/env python3

import cherrypy
from pprint import pprint


class NášServer(object):
    
    @cherrypy.expose
    def index(self):
        cherrypy.log('LOG: Zpráva z aplikace!')
        return f'<b>konfigurace:</b> <pre>{cherrypy.config}</pre>'


if __name__ == '__main__':
    config = {
        '/': {
            'log.access_file': './logs/access',
            'log.error_file': './logs/error',
        },
    }
    cherrypy.quickstart(NášServer(), '/', config)
