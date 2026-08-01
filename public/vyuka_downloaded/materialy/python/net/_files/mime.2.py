import email
from email.iterators import _structure

data = b'Content-Type:  multipart/form-data; boundary=---------------------------123504625239007772824141014506\r\n\r\n-----------------------------123504625239007772824141014506\r\nContent-Disposition: form-data; name="jmeno"\r\n\r\nAlisa\r\n-----------------------------123504625239007772824141014506\r\nContent-Disposition: form-data; name="jazyky"\r\n\r\neng\r\n-----------------------------123504625239007772824141014506\r\nContent-Disposition: form-data; name="jazyky"\r\n\r\nrus\r\n-----------------------------123504625239007772824141014506\r\nContent-Disposition: form-data; name="jazyky"\r\n\r\njap\r\n-----------------------------123504625239007772824141014506\r\nContent-Disposition: form-data; name="soubor"; filename="sachovnice.png"\r\nContent-Type: image/png\r\n\r\n\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x03\x00\x00\x00\x03\x08\x02\x00\x00\x00\xd9J"\xe8\x00\x00\x00\x1cIDATx\x9c%\xc3\xb1\r\x00\x00\x0c\xc3 >\xcf\xe9\xeeP$\x84_m\x83\x92\xd4\x01\xb4\xd2\rr\xa6|\xffu\x00\x00\x00\x00IEND\xaeB`\x82\r\n-----------------------------123504625239007772824141014506--\r\n'

msg = email.message_from_bytes(data)
#print(msg)
print(repr(msg))    # <email.message.Message>
_structure(msg)
