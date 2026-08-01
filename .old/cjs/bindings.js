/*
 *  JS-náhrada za XBL pro načítání externích příkladů
 *  (hnusné řešení, ale zase snad poběží všude)
 */

var load_binding = function(element) {
  // načítací funkce
  var exampleLoaded = function(evt, el) {
    // importovaná data
    var str = evt.target.responseText
    str = str.replace( /</g, '&lt;' )
    // výstupní node
    if ( el.getAttribute('highlight') == 'no' ) {   /* žádný „syntax highlighting“ */
      var txt = '<pre>' + str + '</pre>'
      el.innerHTML = txt
    } else {                                        /* „syntax highlighting“ */
      var txt = '<pre class="brush: '
      txt += el.getAttribute('lang')
      txt += '; gutter: false; toolbar: false;">'
      txt += str
      txt += '</pre>'
      el.innerHTML = txt
      // vnuť „syntax highlighting“ pro <example src="">
      // --> běží asynchronně, takže ho určitě nestihne hlavní zapnutí v init()
      SyntaxHighlighter.highlight()
    }
  }
  // volací kód
  var src = element.getAttribute('src')
  var request = new XMLHttpRequest()
  request.onload = function(evt) { exampleLoaded(evt, element) }
  request.open('GET', src)
  //request.setRequestHeader('If-Modified-Since', 'Tue, 01 Nov 2011 00:00:00 GMT')
  request.send()
}

var init_bindings = function() {
  var examples = document.getElementsByTagName('example')
  // načti pro každý <example src=""> odpovídající externí obsah
  for (var i=0; i<examples.length; i++) {
    load_binding(examples[i])
  }
}

addEventListener('load', init_bindings);
