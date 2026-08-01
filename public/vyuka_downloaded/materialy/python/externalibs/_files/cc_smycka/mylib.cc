
int smycka1(int n) {
    int i = 0;
    while (i<=n) {
        i++;
    }
    return n;
}

static int smycka2(int n) {
    int i = 0;
    while (i<=n) {
        i++;
    }
    return n;
}

extern "C" int smycka3(int n) {
    int i = 0;
    while (i<=n) {
        i++;
    }
    return n;
}
