#!/usr/bin/env python3

import cherrypy
import os


class NášServer(object):
    
    @cherrypy.expose
    def index(self):
        return """
            <link rel="stylesheet" href="/static/stylopis.css">
            <img src="/images/cherrypy.png" width="232" height="455" alt="CherryPy logo" align="left">
            Zdraví Vás Váš osobní webový server!
            <br>
            Je postaven nad technologií <em>CherryPy</em>.
        """


if __name__ == '__main__':
    config = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './public',
        },
        '/images': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './images',
        },
    }
    cherrypy.quickstart(NášServer(), '/', config)
