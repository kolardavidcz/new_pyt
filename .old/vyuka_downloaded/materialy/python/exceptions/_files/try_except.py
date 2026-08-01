#!/usr/bin/env python3
# Filename: try_except.py
 
try:
    text = input('Enter something --> ')
except EOFError:            # Unix: ^D & Windows: ^Z+↵
    print('\nWhy did you do an EOF on me?')
except KeyboardInterrupt:   # Unix: ^C & Windows: ^C
    print('\nYou cancelled the operation.')
else:                       # něco jsme napsali a odentrovali
    print('You entered "{0}".'.format(text))
finally:                    # vykoná se vždy při opouštění bloku příkazu 'try'
    print('Completed.')

