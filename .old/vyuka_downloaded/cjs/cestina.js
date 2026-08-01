/*
 * „řešení“ odřádkování českých jednopísmenných předložek a spojek
 *
 * Hlavní myšlenka je jednoduchá:
 * ~ Vezmu innerHTML (tedy řetězec) vybraných elementů z XML-slajdů a zaměním v něm
 *   jednopísmenné předložky a spojky (a jejich kombinace) za variantu s pevnou mezerou.
 * ~ Lepší by to bylo udělat rovnou v XSLT, ale to by prohlížeče musely podporovat XSLT-2.0.
 *
 * Má to ale několik zádrhelů:
 * ~ Sice to zdá se operuje nad XML, takže se to vyhne syntax-highlighteru, ale...
 * ~ Ignoruju zatím <td>.
 * ~ Do <li> a <note> poměrně často cpu i příklady, které to teď vezme s sebou.
 * ~ ...
 *
 */

var init_cestina = function() {
  // poměrně bezpečné elementy (snad žádná další vnitřní struktura)
  var Hs = document.getElementsByTagName('H1')
  nahrad(Hs)
  var Hs = document.getElementsByTagName('H2')
  nahrad(Hs)
  var Hs = document.getElementsByTagName('H3')
  nahrad(Hs)
  var Ps = document.getElementsByTagName('P')
  nahrad(Ps)
  var BLOCKQUOTEs = document.getElementsByTagName('BLOCKQUOTE')
  nahrad(BLOCKQUOTEs)
  // nebezpečné elementy (obsahují občas třeba <example> a tak)
  var NOTEs = document.getElementsByTagName('note')
  nahrad(NOTEs)
  var LIs = document.getElementsByTagName('LI')
  nahrad(LIs)
  // nebezpečné elementy u příkladů (obsahují občas třeba <example> a tak)
  var ZADANIs = document.getElementsByTagName('ZADANI')
  nahrad(ZADANIs)
}

var nahrad = function(col) {
  for (var i=0; i<col.length; i++) {
    col[i].innerHTML = predlozky(col[i].innerHTML)
  }
}

var predlozky = function(txt) {
  // speciality – dvojpředložky
  txt = txt.replace( / ([ai]) ([kosuvzi]) /g,  ' $1&#160;$2&#160;')
  txt = txt.replace( / ([AI]) ([kosuvzi]) /g,  ' $1&#160;$2&#160;')
  txt = txt.replace( / \(([AI]) ([kosuvz]) /g,  ' ($1&#160;$2&#160;')
  // speciality – matematické výrazy
  txt = txt.replace( />([aikosuvz]) ([-%^+*/=]) /g,  '>$1&#160;$2&#160;')
  // ostatní výskyty
  txt = txt.replace( / ([aikosuvz]) /g,  ' $1&#160;')
  txt = txt.replace( / ([AIKOSUVZ]) /g,  ' $1&#160;')
  txt = txt.replace( / \(([aikosuvz]) /g,  ' ($1&#160;')
  txt = txt.replace( / \(([AIKOSUVZ]) /g,  ' ($1&#160;')
  txt = txt.replace( / „([aikosuvz]) /g,  ' „$1&#160;')
  txt = txt.replace( / „([AIKOSUVZ]) /g,  ' „$1&#160;')
  txt = txt.replace( />([aikosuvz]) /g,  '>$1&#160;')
  txt = txt.replace( />([AIKOSUVZ]) /g,  '>$1&#160;')
  //
  return txt
}

addEventListener('load', init_cestina);
