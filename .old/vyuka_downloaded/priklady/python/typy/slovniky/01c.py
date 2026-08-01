# Martin Novák

import pprint

def unionDics(d1, d2):
    return dict( list(d1.items()) + list(d2.items()) )

a = {"a": 1, "b": 2, "c": 3}
b = {"d": 7, "e": 8}

pprint.pprint(unionDics(a, b))
