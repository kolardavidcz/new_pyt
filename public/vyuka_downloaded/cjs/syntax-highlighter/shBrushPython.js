/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/SyntaxHighlighter
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
 *
 * @version
 * 3.0.83 (Fri, 06 Dec 2013 16:34:19 GMT)
 *
 * @copyright
 * Copyright (C) 2004-2013 Alex Gorbatchev.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */
;(function()
{
    // CommonJS
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== 'undefined'? require('shCore').SyntaxHighlighter : null);

    function Brush()
    {
        // Contributed by Gheorghe Milas and Ahmad Sherif
        // (modified for Python3 by Pirat)

        var keywords =  'and as assert async await break case class continue def del ' +
                        'elif else except finally for from global if import in is ' +
                        'lambda match nonlocal not or pass raise return try while with yield';

        var funcs = 'abs all any ascii bin bool breakpoint bytearray bytes callable ' +
                    'chr classmethod compile complex delattr dict dir ' +
                    'divmod enumerate eval exec exit filter float format frozenset ' +
                    'getattr globals hasattr hash help hex id input int ' +
                    'isinstance issubclass iter len list locals map max memoryview min next ' +
                    'object oct open ord pow print property quit range ' +
                    'repr reversed round set setattr slice sorted staticmethod ' +
                    'str sum super tuple type vars zip';
                    //'copyright credits license ' +

        var special =  'None True False self cls class_';

        this.regexList = [
                { regex: SyntaxHighlighter.regexLib.singleLinePerlComments, css: 'comments' },
                { regex: /^\s*@\w+/gm, 										css: 'decorator' },
                { regex: /(['\"]{3})([^\1])*?\1/gm, 						css: 'comments' },
                { regex: /"(?!")(?:\.|\\\"|[^\""\n])*"/gm, 					css: 'string' },
                { regex: /'(?!')(?:\.|(\\\')|[^\''\n])*'/gm, 				css: 'string' },
                { regex: /\+|\-|\*|\/|\%|=|==/gm, 							css: 'keyword' },
                { regex: /\b\d+\.?\w*/g, 									css: 'value' },
                { regex: new RegExp(this.getKeywords(funcs), 'gmi'),		css: 'functions' },
                { regex: new RegExp(this.getKeywords(keywords), 'gm'), 		css: 'keyword' },
                { regex: new RegExp(this.getKeywords(special), 'gm'), 		css: 'color1' }
                ];
            
        this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
    };

    Brush.prototype	= new SyntaxHighlighter.Highlighter();
    Brush.aliases	= ['py', 'python'];

    SyntaxHighlighter.brushes.Python = Brush;

    // CommonJS
    typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
