from subprocess import run

proces = run("sort", input="hello\nhow\nare\nyou", encoding="ascii")
