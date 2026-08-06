#!/usr/bin/env python3

def komplementární_báze(báze):
    """Pro vstupní bázi ze sekvence DNA vrací bázi k ní komplementární.
    
    >>> komplementární_báze('A')
    'T'
    """
    if báze == 'A':     # adenin
        return 'T'
    elif báze == 'T':   # thymin
        return 'A'
    elif báze == 'C':   # cytosin
        return 'G'
    elif báze == 'G':   # guanin
        return 'C'
    else:
        return ''

if __name__ == '__main__':
    import doctest
    doctest.testmod()
