#!/usr/bin/env python3

import cherrypy
import os


class NášServer(object):
    
    @cherrypy.expose
    def index(self):
        return """
            <link rel="stylesheet" href="/static/stylopis.css">
            Zdraví Vás Váš osobní webový server!
        """


if __name__ == '__main__':
    config = {
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
            'tools.staticdir.dir': './public',
        },
    }
    cherrypy.quickstart(NášServer(), '/', config)
