import lxml.html as html

path = 'vyuka_downloaded/materialy/python/types.plus/NamedTuples.html'
with open(path, encoding='utf-8') as f:
    h = f.read()
doc = html.fromstring(h)
secs = doc.xpath('//section[contains(@class,"slide-section")]')
print('Found sections:', len(secs))
if secs:
    print('First data-title:', secs[0].get('data-title'))
    body = secs[0].find('.//div[contains(@class,"section-body")]')
    print('Has body:', body is not None)
    if body is not None:
        print('Body children count:', len(body))
        print('Sample content start:', html.tostring(body, encoding='unicode', method='html')[:120])
