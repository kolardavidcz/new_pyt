import re

text = """<p class="para1">
  Jednoduchý HTML-odstavec se <em>zvýrazněným</em> textem,
  <9a>falešným elementem</9a> a více řádkami.
</p>"""

pattern = re.compile(r"<([a-z]\w*).*?>", re.IGNORECASE | re.M)
for match in pattern.finditer(text):
    print(match)
