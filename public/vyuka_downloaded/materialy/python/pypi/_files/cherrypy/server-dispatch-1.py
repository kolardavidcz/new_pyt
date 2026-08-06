#!/usr/bin/env python3

import cherrypy

@cherrypy.popargs('name')
class Band(object):
    def __init__(self):
        self.albums = Album()

@cherrypy.popargs('title')
class Album(object):
    def __init__(self):
        self.tracks = Track()

@cherrypy.popargs('num', 'track')
class Track(object):
    @cherrypy.expose
    def index(self, name, title, num, track):
        out = f'album <i>{title}</i> by <i>{name}</i>, track <b>{num} - {track}</b>'
        return out

if __name__ == '__main__':
    cherrypy.quickstart(Band())
