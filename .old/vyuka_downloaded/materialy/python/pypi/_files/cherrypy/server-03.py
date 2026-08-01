#!/usr/bin/env python3

import cherrypy


class NášServer(object):
    
    @cherrypy.expose
    def info(self, jmeno='', vek=''):
        return f"jméno: {jmeno}<br>věk: {vek}"


if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
