import re

text = """<p class="para1">
  Jednoduchý HTML-odstavec se <em>zvýrazněným</em> textem,
  <9a id="id3">falešným elementem</9a> a více řádkami.
</p>"""

pattern = re.compile(r"</?([^a-z/]\w*).*?>", re.IGNORECASE | re.M)
txt = pattern.sub("XXX", text)
print(txt)
