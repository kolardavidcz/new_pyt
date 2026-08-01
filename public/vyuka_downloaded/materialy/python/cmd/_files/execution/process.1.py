import subprocess

with open("process.1.out", "w", encoding="ascii") as outfile:
    p = subprocess.Popen("sort", stdin=subprocess.PIPE, stdout=outfile)
    p.communicate( b"hello\nhow\nare\nyou" )
