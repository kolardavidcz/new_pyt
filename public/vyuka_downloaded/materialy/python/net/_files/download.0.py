import urllib.request

# otevření proudu na URL
stream = urllib.request.urlopen('http://vyuka.hotaru/favicon.ico')

print( 'stream:', stream )
print()
print( dir(stream) )
print()
print( 'Is stream closed?', stream.isclosed() )
print()
print( 'HTTP headers:', stream.getheaders() )
print()
print( 'HTTP return code:', stream.getcode() )
print()
print( 'Real URL:', stream.geturl() )
print()
print( 'Info:\n', stream.info() )

# uzavření proudu
stream.close()
print( 'Is stream closed?', stream.isclosed() )

