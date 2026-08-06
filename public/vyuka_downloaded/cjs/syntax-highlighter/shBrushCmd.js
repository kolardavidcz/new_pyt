;(function()
{
    // CommonJS
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== 'undefined'? require('shCore').SyntaxHighlighter : null);

    function Brush()
    {
        var keywords = 'break echo exit for goto if pause rem';
        var commands = 'assoc at attrib cacls call cd chcp chdir chkdsk chkntfs cls cmd color comp compact convert copy date del dir' +
                       'diskcomp diskcopy doskey endlocal erase fc find findstr format ftype graftabl help label md' +
                       'mkdir mode more move path popd print prompt pushd rd recover ren rename replace rmdir set setlocal shift' +
                       'sort start subst time title tree type ver verify vol xcopy';

        var r = SyntaxHighlighter.regexLib;
        
        this.findMatches = function(regexList, code) {
            //code = code.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
            this.code = code;
            return SyntaxHighlighter.Highlighter.prototype.findMatches.apply(this, [regexList, code]);
        };
        
        this.regexList = [
                { regex: SyntaxHighlighter.regexLib.singleLinePerlComments,    css: 'comments' },      // one line comments
                { regex: SyntaxHighlighter.regexLib.doubleQuotedString,        css: 'string' },        // double quoted strings
                { regex: SyntaxHighlighter.regexLib.singleQuotedString,        css: 'string' },        // single quoted strings
                { regex: new RegExp(this.getKeywords(keywords), 'gm'),       css: 'keyword' },       // keywords
                { regex: new RegExp(this.getKeywords(commands), 'gm'),       css: 'functions' }      // commands
            ];

        //this.forHtmlScript(r.scriptScriptTags);
    }

    Brush.prototype	= new SyntaxHighlighter.Highlighter();
    Brush.aliases	= ['cmd', 'bat'];

    SyntaxHighlighter.brushes.Cmd = Brush;

    // CommonJS
    typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
