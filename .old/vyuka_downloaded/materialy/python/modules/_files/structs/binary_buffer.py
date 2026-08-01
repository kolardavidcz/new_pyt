#!/usr/bin/env python3

import ctypes
import struct

buffer = ctypes.create_string_buffer(17)
print(len(buffer.raw), buffer.raw)

struct.pack_into('>3s i f', buffer, 2, b'abc', 3, 3.14)
print(len(buffer.raw), buffer.raw)

value = struct.unpack_from('>if', buffer, 5)
print(value)
