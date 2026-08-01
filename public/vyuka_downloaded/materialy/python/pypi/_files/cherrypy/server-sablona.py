#!/usr/bin/env python3

import cherrypy


with open('gui-sablona.html', encoding='utf-8') as f:
    šablona = f.read()


class NášServer(object):
    
    @cherrypy.expose
    def info(self, jmeno='', vek=''):
        return šablona.format(jméno=jmeno, věk=vek)


if __name__ == '__main__':
    cherrypy.quickstart(NášServer())
