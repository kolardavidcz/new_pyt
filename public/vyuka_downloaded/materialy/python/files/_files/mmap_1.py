import mmap

with open('mmap_1.txt', 'br') as f:
    with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as m: 
        print(m[:5])    # b'Ahoj,'
        print(m[5:15])  # b' sv\xc4\x9bte!\r\n'
