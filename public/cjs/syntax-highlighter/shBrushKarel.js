;(function()
{
    // CommonJS
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== 'undefined'? require('shCore').SyntaxHighlighter : null);

    function Brush()
    {
        var funcs = '(?:[^\\?ÚŘJD]KROK[^\\?U]|VLEVO VBOK|POLOŽ[^\\?]|ZVEDNI[^\\?])';
        var special = '(?:RYCHLE|POMALU|STOP|KONEC)';
        var keywords = '(?:KDYŽ|JINAK|DOKUD|NEŽ|AŽ|OPAKUJ|-KRÁT)';
        var conds = '(?:[^NA ]SEVER|[^NA ]JIH|[^NA ]VÝCHOD|[^NA ]ZÁPAD|ZNAČKA|MÍSTO|ZEĎ|DOMOV' +
                    '|JE SEVER|JE JIH|JE VÝCHOD|JE ZÁPAD|JE ZNAČKA|JE MÍSTO|JE ZEĎ|JE DOMOV' +
                    '|NENÍ SEVER|NENÍ JIH|NENÍ VÝCHOD|NENÍ ZÁPAD|NENÍ ZNAČKA|NENÍ MÍSTO|NENÍ ZEĎ|NENÍ DOMOV)';

        var r = SyntaxHighlighter.regexLib;
        
        this.regexList = [
                { regex: new RegExp('/;.*$/', 'gm'),  css: 'comments' },
                { regex: new RegExp(funcs, 'gm'),     css: 'functions' },
                { regex: new RegExp(special, 'gm'),   css: 'keyword' },
                { regex: new RegExp(keywords, 'gm'),  css: 'keyword' },
                { regex: new RegExp(conds, 'gm'),     css: 'color4' },
            ];

        //this.forHtmlScript(r.scriptScriptTags);
    }

    Brush.prototype	= new SyntaxHighlighter.Highlighter();

    Brush.aliases	= ['k', 'k99', 'karel'];
    SyntaxHighlighter.brushes.Karel = Brush;

    // CommonJS
    typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
