#!/usr/bin/env python3

import cherrypy

@cherrypy.popargs('name', 'title', 'track')
class Track(object):
    @cherrypy.expose
    def index(self, name, title, track):
        out = f'album <i>{title}</i> by <i>{name}</i>, track <b>{track}</b>'
        return out

if __name__ == '__main__':
    cherrypy.quickstart(Track())
