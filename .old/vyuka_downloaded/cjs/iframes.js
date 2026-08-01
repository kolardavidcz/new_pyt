/*
 *  úprava velikosti IFRAME'ů zobrazujících příklady pro HTML+CSS
 *  
 */

var iframeLoaded = function (el, evt) {
    var elContentBody = el.contentDocument.body
    var maxWidth = 948  /* maximální rozumná šířka pro obsah příkladů uvnitř slajdů */
    
    // a) příliš velký (hlavně široký) vnitřní dokument zmenšíme
    //console.log('Scroll BODY 1:', elContentBody.scrollWidth, elContentBody.scrollHeight, elContentBody, elContentBody.offsetWidth, elContentBody.offsetHeight)
    if (elContentBody.scrollWidth <= maxWidth) {
      el.width = elContentBody.scrollWidth
      el.height = elContentBody.scrollHeight
    } else {
      el.width = maxWidth
      el.height = elContentBody.scrollHeight + 24
    }
    
    // b) pro příliš malý vnitřní dokument zbytečně velký výchozí IFRAME (300x150) patřičně zmenšíme
    //console.log('Scroll BODY 2:', elContentBody.scrollWidth, elContentBody.scrollHeight, elContentBody, elContentBody.offsetWidth, elContentBody.offsetHeight)
    if (elContentBody.offsetWidth < 300 && elContentBody.offsetHeight < 150) {
      el.width = elContentBody.offsetWidth + 16
      el.height = elContentBody.offsetHeight + 24
    }
    
    // rámeček u IFRAME'u zapneme pouze v případě přítomnosti scrollbaru
    if (elContentBody.scrollWidth > elContentBody.clientWidth){
      el.style.border = "1px dotted grey"
    } else {
      el.style.border = "none"
    }
    
}
