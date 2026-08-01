/*
 *  načítání a zobrazování "ABC Music Notation" elementů <abc>
 *  (JS-náhrada za XBL)
 *
 */


var load_abc = function(element) {
  // načítací funkce
  var exampleLoaded = function(evt, el) {
    // importovaná data
    var str = evt.target.responseText;
    el.innerHTML = str;
    // vykreslení výstupu
    display_abc(el);
    if (el.className == 'play-midi') {
        play_abc(el);
    }
  };
  // volací kód
  var src = element.getAttribute('src');
  var request = new XMLHttpRequest();
  request.onload = function(evt) { exampleLoaded(evt, element) };
  request.open('GET', src);
  //request.setRequestHeader('If-Modified-Since', 'Tue, 01 Nov 2011 00:00:00 GMT');
  request.send();
};

var display_abc = function(example) {
    ABCJS.renderAbc(
        example.nextElementSibling,
        example.innerText
    );
};
var play_abc = function(example) {
    ABCJS.renderMidi(
        example.nextElementSibling.nextElementSibling,
        example.innerText,
        {}, {}, {}
        //{}, { generateInline: true }, {}
    );
};

var init_abc = function() {
    var examples = document.getElementsByTagName('abc');
    // zpracuj pro každý <abc> jeho obsah (synchronně)
    for (var i=0; i<examples.length; i++) {
        var el = examples[i];
        if (el.getAttribute('src') == null) {
            display_abc(el);
            if (el.className == 'play-midi') {
                play_abc(el);
            }
        }
    }
    // načti pro každý <abc src=""> odpovídající externí obsah a zpracuj ho (asynchronně)
    for (var i=0; i<examples.length; i++) {
        var el = examples[i];
        if (el.getAttribute('src') != null) {
            load_abc(el);
        }
    }
};

// inicializace převodu ABC Music Notation
addEventListener('load', init_abc);
//addEventListener('load', init_abc, false);
