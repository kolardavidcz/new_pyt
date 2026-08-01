:: ghc-7.6.3
ghc -c mylib.hs
ghc -c StartEnd.c
ghc -shared -o mylib.dll mylib.o StartEnd.o
erase mylib.hi mylib.o mylib_stub.h StartEnd.o
