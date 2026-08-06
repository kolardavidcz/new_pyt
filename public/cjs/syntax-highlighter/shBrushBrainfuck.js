;(function()
{
    // CommonJS
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== 'undefined'? require('shCore').SyntaxHighlighter : null);

    function Brush()
    {
        var keywords = '><\+-\.,\[\]';

        var r = SyntaxHighlighter.regexLib;
        
        this.regexList = [
                { regex: new RegExp(this.getKeywords(keywords), 'gm'),		css: 'keyword' }			// keywords
            ];

        //this.forHtmlScript(r.scriptScriptTags);
    }

    Brush.prototype	= new SyntaxHighlighter.Highlighter();
    Brush.aliases	= ['brainfuck', 'bf', 'BF', 'b', 'bf'];

    SyntaxHighlighter.brushes.Brainfuck = Brush;

    // CommonJS
    typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
