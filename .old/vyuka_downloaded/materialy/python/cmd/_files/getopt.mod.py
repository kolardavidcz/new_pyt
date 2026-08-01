import getopt, sys

try:
    opts, args = getopt.getopt(sys.argv[1:],
                               "hxc:", 
                               ["version", "help", "xhtml", "cssfile="])
except getopt.GetoptError as err:
    print(err)
    print( "Usage: {} [-x] [-c=CSS] filename".format( sys.argv[0] ) )
    sys.exit(2)

print('opts:', opts)
print('args:', args)
