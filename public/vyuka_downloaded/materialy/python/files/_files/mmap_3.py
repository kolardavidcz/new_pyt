import mmap

with mmap.mmap(-1, 5) as m: 
    m.write(b'pokus')
    print(m[:])     # b'pokus'
    m[:2] = b'12'
    print(m[:])     # b'12kus'
    print(m[4:])    # b's'
    m[4:] = b'34'   # IndexError
