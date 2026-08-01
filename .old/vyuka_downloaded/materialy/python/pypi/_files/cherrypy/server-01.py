#!/usr/bin/env python3

import cherrypy


class NášServer(object):
    
    @cherrypy.expose
    def index(self):
        return "Zdraví Vás Váš osobní webový server!"


if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
