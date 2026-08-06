# encoding: utf-8

import xml.sax
 
 
class MyHandler(xml.sax.ContentHandler):

  def __init__(self):
    xml.sax.ContentHandler.__init__(self)
    self._level = 0
 
  def startElement(self, name, attrs):
    self._level += 1
    # <získání atributů>
    txt = ''
    if attrs.items():
        txt += ' { '
        for key, item in attrs.items():
            txt += key + '="' + item + '", '
        txt += '}'
    # </získání atributů>
    print( self._level*"  ", '<'+name+txt+'>' )
 
  def endElement(self, name):
    print( self._level*"  ", '</'+name+'>' )
    self._level -= 1
 
 
filename = "stromecek.xml"
handler = MyHandler()
xml.sax.parse( filename, handler )
