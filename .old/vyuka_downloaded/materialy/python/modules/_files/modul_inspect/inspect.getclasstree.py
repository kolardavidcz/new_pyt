import skola
import inspect
import pprint

info = inspect.getclasstree([skola.Učitel, skola.Školák, skola.Člověk])
pprint.pprint(info)
