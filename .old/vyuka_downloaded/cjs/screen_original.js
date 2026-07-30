/*
 *  hlavní řídicí skript zobrazování slajdů přednášek
 * 
 */

var slidesEl, slidesLen
var slide = 0
var par = 1
var pageCurrentEl, pageAllEl
var naviEl

var init_screen = function() {
  /* zpracuj případný požadavek na nevstupní slajd */
  var searchPart = document.location.search
  if (searchPart != '') {
    var parts = searchPart.substring(1).split('&')
    for (var i=0; i<parts.length; i++) {
      if (parts[i].substring(0,6) == 'slajd=') {
        try { slide = parseInt( parts[i].substring(6) ) - 1 } catch (ex) {}
        if (isNaN(slide)) { slide = 1 }
      } else if (parts[i].substring(0,4) == 'par=') {
        try { par = parseInt( parts[i].substring(4) ) } catch (ex) {}
        if (isNaN(par)) { par = 1 }
      }
    }
    //console.log(slide+1, par)
  }
  /* jednotlivé slajdy */
  slidesEl = document.getElementsByClassName('slide')
  slidesLen = slidesEl.length
  slidesEl[slide].style.display = 'block'
  window.scrollTo(0,0)
  if (par != 1) {
    var paras = slidesEl[slide].getElementsByClassName('enumerate')
    //window.scrollTo( 0, paras[par-1].offsetTop )
    try { paras[par-1].scrollIntoView() }
    catch (ex) { console.log('Exception in paragraph location:', ex) }
  }
  /* číslo aktuálního slajdu */
  pageCurrentEl = document.getElementById('pageCurrent')
  pageAllEl = document.getElementById('pageAll')
  pageCurrentEl.innerHTML = slide+1
  pageAllEl.innerHTML = slidesLen
  /* navigace & „syntax highlighting“ */
  naviEl = document.getElementById('navi')
  txt = ''
  // nadpis
  var t = document.title
  t = t.substring( t.indexOf(' : ') + 3 )
  txt += '<option value="0" disabled>' + t + '</option>'
  // slajdy
  for (var i=0; i<slidesLen; i++) {
    s = slidesEl[i]
    sel = ''
    // schovej všechny slajdy kromě vstupního (nebo vyžádaného)
    if (i!=slide) s.style.display='none'
    if (i==slide) sel=' selected'
    // nastav navigaci
    if (i < 9) {
      num = '&#160;&#160;' + (i+1) + '. '
    } else {
      num = (i+1) + '. '
    }
    //txt += '<option value="' + i + '"' + sel + '>' + num + s.getAttribute('data-title') + '</option>'
    txt += '<option value="' + i + '"' + sel + '>' + num + s.getAttribute('data-title').replace( /</g,'&lt;') + '</option>'
  }
  naviEl.innerHTML = txt
  /* zapni „syntax highlighting“ pro již existující elementy <example> */
  // (<example src=""> si ho zapnou každý sám znovu po načtení; viz bindigs.js#binding)
  SyntaxHighlighter.highlight()
}

var slidePrevious = function() {
  if (slide-1 >= 0) {
    slidesEl[slide].style.display = 'none'
    slide--
    window.scrollTo(0,0)
    slidesEl[slide].style.display = 'block'
    pageCurrentEl.innerHTML = slide+1
    naviEl[slide+1].selected = true
  }
}
var slideNext = function() {
  if (slide+1 < slidesLen) {
    slidesEl[slide].style.display = 'none'
    slide++
    window.scrollTo(0,0)
    slidesEl[slide].style.display = 'block'
    pageCurrentEl.innerHTML = slide+1
    naviEl[slide+1].selected = true
  }
}
/* Tohle sice ukazuje slajd, ale pořád to rylouduje stránku:
var slidePrevious = function() {
  if (slide-1 >= 0) {
    slide--
    location.search = '?slajd=' + (slide+1)
  }
}
var slideNext = function() {
  if (slide+1 < slidesLen) {
    slide++
    location.search = '?slajd=' + (slide+1)
  }
}
*/

var slideLinePrevious = function() {
  window.scrollByLines(-1)
}
var slideLineNext = function() {
  window.scrollByLines(1)
}

/* klávesnice */
var keyup = function(evt) {
  switch (evt.keyCode) {
    case 37:   // ←
      slidePrevious()
      break
    case 39:   // →
      slideNext()
      break
  }
}

/* prezentér */
// zpracuje se pouze při pouštění z localhostu, na webu se nic nezmění
var keydown = function(evt) {
  if (!(document.location.host == 'localhost' || document.location.host == 'vyuka')) return
  switch (evt.keyCode) {
    // PageUp & PageDown předělané na skrolování po řádcích
    case 33:   // ←
      evt.preventDefault()
      slideLinePrevious()
      break
    case 34:   // →
      evt.preventDefault()
      slideLineNext()
      break
    // předchozí slajd [prezentér PLAY]
    case 116:   // F5
      evt.preventDefault()
    case 27:    // ESC
      slidePrevious()
      break
    // další slajd [prezentér BLANK]
    case 190:   // .
      slideNext()
      break
  }
}

/* swipe na mobilech a spol. */
var swipeTime = 0
var [swipeLengthX, swipeLengthY] = [0, 0]
var [swipeLengthX0, swipeLengthY0] = [0, 0]
var touchStart = function(evt) {
  swipeTime = new Date()
  swipeLengthX0 = evt.touches[0].pageX
  swipeLengthY0 = evt.touches[0].pageY
}
var touchMove = function(evt) {
  swipeLengthY = swipeLengthY0 - evt.touches[0].pageY
  swipeLengthX = swipeLengthX0 - evt.touches[0].pageX
}
var touchEnd = function(evt) {
  swipeTime = (new Date()) - swipeTime
  if ( (swipeTime <= 666) && (Math.abs(swipeLengthY) <= 66) && (Math.abs(swipeLengthX) > 66) ) {
    if (swipeLengthX > 0) { // doprava
      slideNext()
    } else {                // doleva
      slidePrevious()
    }
  }
}

/* ??? */
var navi = function(where) {
  switch (where) {
    case 'previous':
      slidePrevious()
      break
    case 'next':
      slideNext()
      break
  }
}

var select = function(order) {
  slidesEl[slide].style.display = 'none'
  slide = parseInt(order)
  slidesEl[order].style.display = 'block'
  pageCurrentEl.innerHTML = slide+1
}



/*
 *  spolu s print.css zajišťuje správný vzhled slajdů pro tisk
 * 
 */

var printing = function() {
    // ukázání slajdů
    for (var i=0; i<slidesLen; i++) {
        s = slidesEl[i]
        s.style.display = 'block'
    }
}



/*
 *  provázání událostí s handlery
 * 
 */
// ovládání slajdů
addEventListener('load', init_screen);
addEventListener('keyup', keyup);       // klávesnice
addEventListener('keydown', keydown);   // prezentér
// ovládání slajdů na mobilech, tabletech a dalších dotykových plochách
addEventListener('touchstart', touchStart);
addEventListener('touchmove', touchMove);
addEventListener('touchend', touchEnd);
// úprava slajdů pro tisk (IE&Mozilla dávno, Chrome 63+)
addEventListener('beforeprint', printing);
