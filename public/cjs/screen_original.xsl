<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="html" encoding="utf-8" indent="no"/>
  <!--xsl:output method="html" doctype-system="about:legacy-compat" encoding="utf-8" indent="no"/-->
  <!--xsl:output method="xml" doctype-system="about:legacy-compat" encoding="UTF-8" indent="no" /-->



  <!--
    ##  dokument
    -->
  <xsl:template match="/">
    <!--html lang="cs" xmlns:m="http://www.w3.org/1998/Math/MathML"-->
    <html>
      <head>
        <xsl:apply-templates select="lecture/meta"/>
        <link href="/cjs/screen.css" media="screen, print" rel="stylesheet" type="text/css" />
        <link href="/cjs/print.css" media="print" rel="stylesheet" type="text/css" />
        <style>
         /*
          * XXX: Tohle prostě nefunguje, v libovolné kombinaci. Pořád se to tiskne špatně.
          *
          @media screen, print {
            @import url('/cjs/screen.css');
          }
          @media print {
            @import url('/cjs/print.css');
          }
         */
        </style>
        <script src="/cjs/screen.js"></script>
        <script src="/cjs/bindings.js"></script>
        <script src="/cjs/iframes.js"></script>
        <script src="/cjs/cestina.js"></script>
        <!-- SyntaxHighlighter -->
        <script src="/cjs/syntax-highlighter/shCore.min.js"></script>
        <link rel="stylesheet" href="/cjs/syntax-highlighter/shCoreDefault.css" />
        <script src="/cjs/syntax-highlighter/shBrushBash.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushBrainfuck.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushCmd.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushCss.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushJScript.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushKarel.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushPlain.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushPython.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushSql.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushXml.js"></script>
        <!-- /SyntaxHighlighter -->
        <!-- jqMath -->
        <xsl:if test="lecture/meta/use-math">
            <!--link rel="stylesheet" href="http://fonts.googleapis.com/css?family=UnifrakturMaguntia" /-->
            <link rel="stylesheet" href="/cjs/mathscribe/jqmath-0.4.3.css" />
            <script src="/cjs/mathscribe/jquery-1.4.3.min.js"></script>
            <script src="/cjs/mathscribe/jqmath-etc-0.4.6.min.js" charset="utf-8"></script>
        </xsl:if>
        <!-- /jqMath -->
        <!-- x3dom -->
        <xsl:if test="lecture/meta/use-x3dom">
            <link rel="stylesheet" href="/cjs/x3dom/x3dom.css" />
            <script src="/cjs/x3dom/x3dom.js"></script>
        </xsl:if>
        <!-- /x3dom -->
        <!-- ABCjs -->
        <xsl:if test="lecture/meta/use-abc">
          <xsl:choose>
            <xsl:when test="lecture/meta/use-abc/@class = 'play-midi'">
              <script src="/cjs/music/ABCjs/abcjs_basic_midi_3.1.2-min.js"></script>
              <script>
                ABCJS.midi.soundfontUrl = "/cjs/music/soundfonts/FluidR3_GM/";
                //ABCJS.midi.instrument = "acoustic_grand_piano";       // výchozí nastavení
                //ABCJS.midi.instrument = "viola";                      // nefunguje
              </script>
              <link rel="stylesheet" href="/cjs/music/ABCjs/abcjs-midi.css" />
              <link rel="stylesheet" href="/cjs/font-awesome/font-awesome.min.css" />
            </xsl:when>
            <xsl:otherwise>
              <script src="/cjs/music/ABCjs/abcjs_basic_3.1.2-min.js"></script>
            </xsl:otherwise>
          </xsl:choose>
          <link rel="stylesheet" href="/cjs/music/abc.css" />
          <script src="/cjs/music/abc.js"></script>
        </xsl:if>
        <!-- /ABCjs -->
        <xsl:if test="lecture/meta/style">
          <xsl:comment> místní styly </xsl:comment>
          <xsl:copy-of select="lecture/meta/style" />
        </xsl:if>
      </head>
      <body>
        <xsl:apply-templates select="lecture/slide"/>
        <xsl:call-template name="footer"/>
      </body>
    </html>
  </xsl:template>



  <!--
    ##  stránka
    -->
  <xsl:template name="footer">
    <div id="footer">
      <a href="/" id="logo">výuka @ 狼.cz</a>
      <select id="navi" onchange="select(this.value)"></select>
      <div id="pages">
        <span class="navi" onclick="navi('previous')">←</span>
        &#160;&#160;&#160;
        <span id="pageCurrent">.</span>/<span id="pageAll">.</span>
        &#160;&#160;&#160;
        <span class="navi" onclick="navi('next')">→</span>
      </div>
    </div>
  </xsl:template>
  
  <xsl:template match="meta">
    <title>
      <xsl:value-of select="title"/>
      (<xsl:value-of select="date"/>)
      @
      <xsl:value-of select="maintitle"/>
    </title>
  </xsl:template>
  
  <xsl:template match="slide">
    <div class="slide" data-title="{@title}">
      <a href="http://studuj.bioinformatiku.cz" class="logo-bioinfo"><img class="logo-bioinfo" src="/cjs/StudujBioinfo.png" width="200" height="40" alt="http://studuj.bioinformatiku.cz" title="http://studuj.bioinformatiku.cz" /></a>
      <h2>
        <xsl:value-of select="@title"/>
      </h2>
      <xsl:apply-templates/>
    </div>
  </xsl:template>



  <!--
    ##  pomocné
    -->
 <!--
  <xsl:template match="node()">
    <xsl:copy-of select="."/>
  </xsl:template>
  <xsl:template match="text()">
    <xsl:value-of select="replace(.,'([aikosuvz])','$1&#160;','i')"/>
  </xsl:template>
 -->



  <!--
    ##  poznámky
    -->
  <xsl:template match="notes">
    <notes>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates select="note"/>
    </notes>
  </xsl:template>
  <xsl:template match="note">
    <note>
      <xsl:copy-of select="@*"/>
      <pointer/>
      <xsl:apply-templates/>
    </note>
  </xsl:template>

  <xsl:template match="handout"/>



  <!--
    ##  ukázka řešení programového problému
    -->
  <!--xsl:template match="coding-tip">
    <div class="coding-tip">
      <xsl:apply-templates/>
    </div>
  </xsl:template-->



  <!--
    ##  sloupečková sazba
    -->
  <xsl:template match="columns">
    <div class="columns" style="min-width: {963 div count(column)}px;">
      <xsl:apply-templates select="column"/>
    </div>
    <br/>
  </xsl:template>
  <xsl:template match="column">
    <div class="column">
      <xsl:copy-of select="@*" />
      <xsl:apply-templates/>
    </div>
  </xsl:template>



  <!--
    ##  příklady HTML-kódu
    -->
  <xsl:template match="html">
    <iframe class="html" src="{@src}" width="90%" onload="iframeLoaded(this, event)" />
  </xsl:template>



  <!--
    ##  příklady kódu
    ##  PS: {@classes} evidentně nejsou funkční => opravit zdrojová XML
    -->
  <xsl:template match="example[not(@src)]">
    <pre class="brush: {@lang}; gutter: false; toolbar: false; {@classes}">
      <xsl:value-of select="."/>
    </pre>
  </xsl:template>
  <xsl:template match="example[@src]">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
    </xsl:copy>
  </xsl:template>
 <!--
  <xsl:template match="example[@src]">
    <xsl:variable name="name" select="substring-after(@src,'pix/04/')"/>
    <xsl:text disable-output-escaping="yes">&lt;!ENTITY </xsl:text><xsl:value-of select="$name"/><xsl:text> "</xsl:text><xsl:value-of select="@src"/><xsl:text disable-output-escaping="yes">"&gt;</xsl:text>
    <pre class="brush: {@lang}; gutter: false; toolbar: false;">
      <xsl:text _disable-output-escaping="yes">&amp;</xsl:text>
      <xsl:value-of select="$name"/>
      <xsl:text>;</xsl:text>
    </pre>
  </xsl:template>
 -->
  
  <xsl:template match="example[@layout='vertical']">
    <div class="example vertical">
      <xsl:if test="cmd">
        <strong>Příkazová&#160;řádka:&#160;</strong>
        <pre class="brush: shell; gutter: false; toolbar: false; {@classes}">
          <xsl:value-of select="cmd"/>
        </pre>
      </xsl:if>
      <xsl:if test="in[not(@src)]">
        <strong>Vstup&#160;</strong>
        <strong>&#160;:</strong>
        <pre class="brush: {in/@lang}; gutter: false; toolbar: false; {in/@classes}">
          <xsl:value-of select="in"/>
        </pre>
      </xsl:if>
      <xsl:if test="in[@src]">
        <strong>Vstup&#160;</strong>
        <a href="{in/@src}">
          <em><xsl:value-of select="substring-after(in/@src, 'files/')"/></em>
        </a>
        <strong>&#160;:</strong>
        <example src="{in/@src}" lang="{in/@lang}" />
      </xsl:if>
      <xsl:if test="program[@src]">
        <strong>Program&#160;</strong>
        <a href="{program/@src}">
          <em><xsl:value-of select="substring-after(program/@src, 'files/')"/></em>
        </a>
        <strong>&#160;:</strong>
        <example src="{program/@src}" lang="{program/@lang}" />
      </xsl:if>
      <xsl:if test="program[not(@src)]">
        <strong>Program&#160;</strong>
        <a href="{program/@src}">
          <em><xsl:value-of select="substring-after(program/@src, 'files/')"/></em>
        </a>
        <strong>&#160;:</strong>
        <pre class="brush: {program/@lang}; gutter: false; toolbar: false; {program/@classes}">
          <xsl:value-of select="program"/>
        </pre>
      </xsl:if>
      <xsl:if test="out[@src]">
        <strong>Výstup:</strong>
        <example src="{out/@src}" lang="{out/@lang}" />
      </xsl:if>
      <xsl:if test="out[not(@src)]">
        <strong>Výstup:</strong>
        <pre class="brush: {out/@lang}; gutter: false; toolbar: false; {out/@classes}">
          <xsl:value-of select="out"/>
        </pre>
      </xsl:if>
      <xsl:apply-templates select="img"/>   <!-- TODO? -->
      <!--xsl:if test="img">
        <strong>Výstup:</strong>
        <xsl:apply-templates select="img"/>
      </xsl:if-->
    </div>
  </xsl:template>
  
  <xsl:template match="example[@layout='horizontal']">
    <div class="example horizontal">
      <xsl:if test="cmd">
        <div class="tcell tcenter">
          <strong>Příkazová&#160;řádka:&#160;</strong>
          <pre class="brush: shell; gutter: false; toolbar: false; {@classes}">
            <xsl:value-of select="cmd"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="in and not(img)">
        <div class="tcell tcenter">
          <strong>Vstup&#160;</strong>
          <a href="{in/@src}">
            <em><xsl:value-of select="substring-after(in/@src, 'files/')"/></em>
          </a>
          <strong>&#160;:</strong>
          <example src="{in/@src}" lang="{in/@lang}" />
        </div>
      </xsl:if>
      <xsl:if test="in and img">    <!-- použito v přednáškách o XML pro výstupy v browseru -->
        <div class="tcell tleft">
          <strong>Vstup&#160;</strong>
          <a href="{in/@src}">
            <em><xsl:value-of select="substring-after(in/@src, 'files/')"/></em>
          </a>
          <strong>&#160;:</strong>
          <example src="{in/@src}" lang="{in/@lang}" />
        </div>
        <div class="tcell tright">
          <strong>Výstup:</strong>
          <img src="{img/@src}" width="{img/@width}" height="{img/@height}" alt="{img/@alt}" class="example" />
        </div>
      </xsl:if>
      <xsl:if test="program and out">   <!-- zatím všude v přednáškách je „program“ následován „outem“ -->
        <div class="tcell tleft">
          <strong>Program&#160;</strong>
          <a href="{program/@src}">
            <em><xsl:value-of select="substring-after(program/@src, 'files/')"/></em>
          </a>
          <strong>&#160;:</strong>
          <example src="{program/@src}" lang="{program/@lang}" />
        </div>
        <div class="tcell tright">
          <strong>Výstup:</strong>
          <example src="{out/@src}" lang="{out/@lang}" />
        </div>
      </xsl:if>
      <xsl:if test="out and not(program)">
        <div style="font-size: 200%;">[Chyba v XSLT – &lt;out&gt; bez &lt;program&gt;!]</div>
      </xsl:if>
      <br clear="all" />
    </div>
  </xsl:template>
  
  <xsl:template match="examples[not(@type)]">
    <div class="example horizontal">
      <div class="tcell tleft">
        <xsl:apply-templates select="example[1]" />
      </div>
      <div class="tcell tright">
        <xsl:apply-templates select="example[2]" />
      </div>
      <br clear="all" />
    </div>
  </xsl:template>
  
  <xsl:template match="examples[@type='horizontal3']">
    <div class="example horizontal">
      <div class="tcell tleft3">
        <xsl:apply-templates select="example[1]" />
      </div>
      <div class="tcell tcenter3">
        <xsl:apply-templates select="example[2]" />
      </div>
      <div class="tcell tright3">
        <xsl:apply-templates select="example[3]" />
      </div>
      <br clear="all" />
    </div>
  </xsl:template>
  
  <xsl:template match="example[@layout='html5']">
    <div class="example vertical">
      <!-- (někde se hodí HTML-výstup k příkladu z jiného jazyka) -->
      <xsl:if test="cmd">
        <strong>Příkaz:&#160;</strong>
        <pre class="brush: {cmd/@lang}; gutter: false; toolbar: false; {cmd/@classes}">
          <xsl:value-of select="cmd"/>
        </pre>
      </xsl:if>
      <!-- (odsud dál už je to čistě pro ukázky HTML a CSS) -->
      <xsl:if test="html[not(@src)]">
        <strong>HTML:&#160;</strong>
        <pre class="brush: xml; gutter: false; toolbar: false; {@classes}">
          <xsl:value-of select="html"/>
        </pre>
      </xsl:if>
      <xsl:if test="html[@src]">
        <strong>HTML:&#160;</strong>
        <example src="{html/@src}" lang="xml" />
      </xsl:if>
      <xsl:if test="css[not(@src)]">
        <strong>CSS:&#160;</strong>
        <pre class="brush: css; gutter: false; toolbar: false; {@classes}">
          <xsl:value-of select="css"/>
        </pre>
      </xsl:if>
      <xsl:if test="css[@src]">
        <strong>CSS:&#160;</strong>
        <example src="{css/@src}" lang="css" />
      </xsl:if>
      <xsl:if test="js[not(@src)]">
        <strong>JS:&#160;</strong>
        <pre class="brush: js; gutter: false; toolbar: false; {@classes}">
          <xsl:value-of select="js"/>
        </pre>
      </xsl:if>
      <xsl:if test="js[@src]">
        <strong>JS:&#160;</strong>
        <example src="{js/@src}" lang="js" />
      </xsl:if>
      <xsl:if test="output[not(@src)]">
        <strong>Výstup:&#160;</strong>
        <div class="html5">
          <xsl:copy-of select="output"/>
        </div>
      </xsl:if>
      <xsl:if test="output[@src]">
        <strong>Výstup:&#160;</strong>
        <div class="html5">
          <iframe src="{output/@src}" onload="iframeLoaded(this, event)" />
        </div>
      </xsl:if>
    </div>
  </xsl:template>



  <!--
    ##  mathscribe
    -->
  <xsl:template match="m">
    <xsl:text>$</xsl:text>
    <xsl:value-of select="."/>
    <xsl:text>$</xsl:text>
  </xsl:template>
  <xsl:template match="math">
    <xsl:text>$$</xsl:text>
    <xsl:value-of select="."/>
    <xsl:text>$$</xsl:text>
  </xsl:template>



  <!--
    ##  ABC Music Notation
    -->
  <!--xsl:template match="abc[not(@src)]"-->
  <xsl:template match="abc">
    <xsl:copy-of select="."/>
    <div class="abc-score"/>
    <xsl:if test="./@class = 'play-midi'">
      <div class="abc-player"/>
    </xsl:if>
  </xsl:template>



  <!--
    ##  HTML5 video
    -->
  <xsl:template match="video">
    <p class="center">
      <xsl:copy-of select="."/>
    </p>
  </xsl:template>



  <!--
    ##  odkaz na literaturu
    -->
  <xsl:template match="citace">
    <span class="citace">
      <xsl:copy-of select="."/>
    </span>
  </xsl:template>



  <!--
    ##  odkaz na licenci CC0
    -->
  <xsl:template match="CC0">
    <div class="CC0">
      <xsl:copy-of select="." />
      <a href="http://creativecommons.org/publicdomain/zero/1.0/" class="external" alt="CC0"><img src="/cjs/CC0_80x15.png" width="80" height="15" alt="public domain" /></a>
    </div>
  </xsl:template>



  <!--
    ##  ostatní nezpracované elementy (mělo by být čisté HTML)
    -->
  <xsl:template match="*">
    <xsl:element name="{name()}">
      <xsl:copy-of select="@*" />
      <xsl:apply-templates />
    </xsl:element>
  </xsl:template>



</xsl:stylesheet>
