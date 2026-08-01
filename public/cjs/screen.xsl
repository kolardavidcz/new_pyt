<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" encoding="utf-8" indent="no"/>

  <!--
    ##  DOCUMENT ROOT
  -->
  <xsl:template match="/">
    <html lang="cs">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <script>
          <xsl:text disable-output-escaping="yes"><![CDATA[
            (function() {
                const theme = localStorage.getItem('python-course-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                const bg = theme === 'light' ? '#f3f3f3' : '#181818';
                document.documentElement.style.backgroundColor = bg;
            })();
          ]]></xsl:text>
        </script>
        <style>
          html, body {
              background-color: #181818 !important;
          }
          html[data-theme="light"], html[data-theme="light"] body {
              background-color: #f3f3f3 !important;
          }
        </style>
        <xsl:apply-templates select="lecture/meta"/>
        <link rel="preload" href="/cjs/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
        <link rel="preload" href="/cjs/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
        <link href="/cjs/tokens.css" rel="stylesheet" type="text/css"/>
        <!-- SyntaxHighlighter -->
        <script src="/cjs/syntax-highlighter/shCore.min.js"></script>
        <link rel="stylesheet" href="/cjs/syntax-highlighter/shCoreDefault.css"/>
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
          <link rel="stylesheet" href="/cjs/mathscribe/jqmath-0.4.3.css"/>
          <script src="/cjs/mathscribe/jquery-1.4.3.min.js"></script>
          <script src="/cjs/mathscribe/jqmath-etc-0.4.6.min.js" charset="utf-8"></script>
        </xsl:if>
        <!-- /jqMath -->
        <xsl:if test="lecture/meta/use-x3dom">
          <link rel="stylesheet" href="/cjs/x3dom/x3dom.css"/>
          <script src="/cjs/x3dom/x3dom.js"></script>
        </xsl:if>
        <xsl:if test="lecture/meta/style">
          <xsl:copy-of select="lecture/meta/style"/>
        </xsl:if>
        <script src="/cjs/bindings.js"></script>
        <script src="/cjs/iframes.js"></script>
        <script src="/cjs/cestina.js"></script>
        <script src="/cjs/slide-classification.js"></script>
        <script src="/cjs/slide-tags.js"></script>
        <script src="/cjs/peek-data.js"></script>
        <link href="/cjs/dashboard.css" rel="stylesheet" type="text/css"/>
        <link href="/cjs/obsah-panel.css" rel="stylesheet" type="text/css"/>
        <link href="/cjs/screen.css" rel="stylesheet" type="text/css"/>
        <script src="/cjs/course-data.js"></script>
        <script src="/cjs/course-explorer.js"></script>
        <script src="/cjs/screen.js"></script>
        <script src="/cjs/spa_router.js"></script>
      </head>
      <body>
        <div class="app-container">
        <!-- 1. IDE window chrome titlebar -->
        <div class="titlebar">
          <span class="dot red-dot"></span>
          <span class="dot yellow-dot"></span>
          <span class="dot green-dot"></span>
          <span class="name">python-vscht — <xsl:value-of select="lecture/meta/title"/></span>
        </div>

        <!-- 2. Dynamic IDE tabbar -->
        <div class="tabbar" id="tabbar">
          <div class="tabs-list" id="tabsList">
            <!-- Populated by JS -->
          </div>
          <div class="tabbar-actions">
            <!-- exportHtml removed (was prototype-only) -->
          </div>
        </div>

        <!-- 3. Main editor panels area -->
        <div class="editor-body">
          <div class="activitybar slim">
            <button class="activity-btn active" id="tocToggle" title="Zobrazit/skrýt obsah">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <button class="activity-btn" id="themeToggle" title="Přepnout barevný motiv">
              <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <svg class="moon-icon" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>

          <div class="app-layout with-obsah page-layout" id="layout-root">
            <!-- Unified obsah panel: course tree + slide sections -->
            <aside class="obsah-sidebar timeline-sidebar open-by-default" id="obsahSidebar">
              <div class="obsah-sidebar-header">Obsah</div>
              <nav class="obsah-explorer timeline-track" id="timeline-track-root"></nav>
              <div class="obsah-sections" id="slideTocSection">
                <div class="toc-header">
                  <span class="toc-label">Sekce</span>
                  <span class="toc-count"><xsl:value-of select="count(lecture/slide)"/></span>
                </div>
                <nav class="toc-nav">
                  <ol class="toc-list">
                    <xsl:for-each select="lecture/slide">
                      <li class="toc-item">
                        <a class="toc-link" href="#id{position()}">
                          <span class="toc-num"><xsl:value-of select="position()"/></span>
                          <span class="toc-text"><xsl:value-of select="@title"/></span>
                        </a>
                      </li>
                    </xsl:for-each>
                  </ol>
                </nav>
              </div>
            </aside>

            <!-- Main content -->
            <main class="content-main" id="contentMain">
              <!-- Page header -->
              <header class="lecture-header">
                <div class="lecture-meta-row">
                  <span class="lecture-tag"><xsl:value-of select="lecture/meta/maintitle"/></span>
                  <span class="lecture-date"><xsl:value-of select="lecture/meta/date"/></span>
                </div>
                <h1 class="lecture-title"><xsl:value-of select="lecture/meta/title"/></h1>
                <p class="lecture-author">by <xsl:value-of select="lecture/meta/author"/></p>
              </header>

              <!-- All slides rendered as article sections -->
              <div class="slides-container">
                <xsl:apply-templates select="lecture/slide"/>
              </div>

              <!-- Footer -->
              <footer class="lecture-footer">
                <a href="/new_order.html" class="footer-back">&#8592; Back to Course Dashboard</a>
                <span class="footer-credit">vyuka @ 狼.cz</span>
              </footer>
            </main>
          </div>
        </div>

        <!-- Status bar bottom -->
        <div class="statusbar" id="statusbar">
          <span class="status-left">Sekce 1 z <xsl:value-of select="count(lecture/slide)"/> · 0% dokončeno</span>
          <span class="status-right">sync: local</span>
        </div>
        </div>
      </body>
    </html>
  </xsl:template>


  <!--
    ##  META: title tag
  -->
  <xsl:template match="meta">
    <title>
      <xsl:value-of select="title"/>
      &#8212;
      <xsl:value-of select="maintitle"/>
    </title>
  </xsl:template>


  <!--
    ##  SLIDE → article section
  -->
  <xsl:template match="slide">
    <!-- Use predictable id="idN" (matching build search index + classification data) so tags, difficulty, and 3-layer tree work reliably -->
    <section class="slide-section" id="id{position()}" data-title="{@title}">
      <div class="section-header">
        <span class="section-num"><xsl:number value="position()" format="1"/></span>
        <h2 class="section-title"><xsl:value-of select="@title"/></h2>
      </div>
      <div class="section-body">
        <xsl:apply-templates/>
      </div>
    </section>
  </xsl:template>

  <!-- Pass through difficulty (flavor) attribute from XML to data-diff for paragraphs/blocks -->
  <xsl:template match="p[@diff]|blockquote[@diff]|ul[@diff]|ol[@diff]|dl[@diff]">
    <xsl:element name="{local-name()}">
      <xsl:copy-of select="@*[name() != 'diff']"/>
      <xsl:attribute name="data-diff"><xsl:value-of select="@diff"/></xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>


  <!--
    ##  NOTES → callout boxes
  -->
  <xsl:template match="notes">
    <div class="notes-block">
      <xsl:apply-templates select="note"/>
    </div>
  </xsl:template>

  <xsl:template match="note">
    <div class="note-item">
      <span class="note-icon">&#128221;</span>
      <div class="note-content">
        <xsl:apply-templates/>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="handout"/>


  <!--
    ##  COLUMN LAYOUT
  -->
  <xsl:template match="columns">
    <div class="columns-grid" style="--col-count: {count(column)};">
      <xsl:apply-templates select="column"/>
    </div>
  </xsl:template>

  <xsl:template match="column">
    <div class="column">
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </div>
  </xsl:template>


  <!--
    ##  HTML IFRAME EXAMPLES
  -->
  <xsl:template match="html">
    <iframe class="html" src="{@src}" width="90%" onload="iframeLoaded(this, event)"/>
  </xsl:template>


  <!--
    ##  CODE EXAMPLES
  -->
  <xsl:template match="example[not(@src) and not(@layout)]">
    <pre class="brush: {@lang}; gutter: false; toolbar: false; {@classes}">
      <xsl:value-of select="."/>
    </pre>
  </xsl:template>

  <xsl:template match="example[@src and not(@layout)]">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="example[@layout='vertical']">
    <div class="example-block example-vertical">
      <xsl:if test="cmd">
        <div class="example-part">
          <div class="example-label">&#128187; Command</div>
          <pre class="brush: shell; gutter: false; toolbar: false; {@classes}">
            <xsl:value-of select="cmd"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="in[not(@src)]">
        <div class="example-part">
          <div class="example-label">&#8594; Input</div>
          <pre class="brush: {in/@lang}; gutter: false; toolbar: false; {in/@classes}">
            <xsl:value-of select="in"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="in[@src]">
        <div class="example-part">
          <div class="example-label">
            &#8594; Input: <a href="{in/@src}"><em><xsl:value-of select="substring-after(in/@src, 'files/')"/></em></a>
          </div>
          <example src="{in/@src}" lang="{in/@lang}"/>
        </div>
      </xsl:if>
      <xsl:if test="program[@src]">
        <div class="example-part">
          <div class="example-label">
            &#128196; Program: <a href="{program/@src}"><em><xsl:value-of select="substring-after(program/@src, 'files/')"/></em></a>
          </div>
          <example src="{program/@src}" lang="{program/@lang}"/>
        </div>
      </xsl:if>
      <xsl:if test="program[not(@src)]">
        <div class="example-part">
          <div class="example-label">&#128196; Program</div>
          <pre class="brush: {program/@lang}; gutter: false; toolbar: false; {program/@classes}">
            <xsl:value-of select="program"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="out[@src]">
        <div class="example-part">
          <div class="example-label">&#9654; Output</div>
          <example src="{out/@src}" lang="{out/@lang}"/>
        </div>
      </xsl:if>
      <xsl:if test="out[not(@src)]">
        <div class="example-part">
          <div class="example-label">&#9654; Output</div>
          <pre class="brush: {out/@lang}; gutter: false; toolbar: false; {out/@classes}">
            <xsl:value-of select="out"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:apply-templates select="img"/>
    </div>
  </xsl:template>

  <xsl:template match="example[@layout='horizontal']">
    <div class="example-block example-horizontal">
      <xsl:if test="cmd">
        <div class="example-row-full">
          <div class="example-label">&#128187; Command</div>
          <pre class="brush: shell; gutter: false; toolbar: false; {@classes}">
            <xsl:value-of select="cmd"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="in and not(img)">
        <div class="example-col">
          <div class="example-label">&#8594; Input: <a href="{in/@src}"><em><xsl:value-of select="substring-after(in/@src, 'files/')"/></em></a></div>
          <example src="{in/@src}" lang="{in/@lang}"/>
        </div>
      </xsl:if>
      <xsl:if test="in and img">
        <div class="example-col">
          <div class="example-label">&#8594; Input: <a href="{in/@src}"><em><xsl:value-of select="substring-after(in/@src, 'files/')"/></em></a></div>
          <example src="{in/@src}" lang="{in/@lang}"/>
        </div>
        <div class="example-col">
          <div class="example-label">&#9654; Output</div>
          <img src="{img/@src}" width="{img/@width}" height="{img/@height}" alt="{img/@alt}" class="example-img"/>
        </div>
      </xsl:if>
      <xsl:if test="program and out">
        <div class="example-col">
          <div class="example-label">&#128196; Program: <a href="{program/@src}"><em><xsl:value-of select="substring-after(program/@src, 'files/')"/></em></a></div>
          <example src="{program/@src}" lang="{program/@lang}"/>
        </div>
        <div class="example-col">
          <div class="example-label">&#9654; Output</div>
          <example src="{out/@src}" lang="{out/@lang}"/>
        </div>
      </xsl:if>
    </div>
  </xsl:template>

  <xsl:template match="examples[not(@type)]">
    <div class="example-block example-horizontal">
      <div class="example-col">
        <xsl:apply-templates select="example[1]"/>
      </div>
      <div class="example-col">
        <xsl:apply-templates select="example[2]"/>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="examples[@type='horizontal3']">
    <div class="example-block example-horizontal example-3col">
      <div class="example-col">
        <xsl:apply-templates select="example[1]"/>
      </div>
      <div class="example-col">
        <xsl:apply-templates select="example[2]"/>
      </div>
      <div class="example-col">
        <xsl:apply-templates select="example[3]"/>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="example[@layout='html5']">
    <div class="example-block example-vertical">
      <xsl:if test="cmd">
        <div class="example-part">
          <div class="example-label">&#128187; Command</div>
          <pre class="brush: {@lang}; gutter: false; toolbar: false; {cmd/@classes}">
            <xsl:value-of select="cmd"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="html[not(@src)]">
        <div class="example-part">
          <div class="example-label">HTML</div>
          <pre class="brush: xml; gutter: false; toolbar: false; {@classes}">
            <xsl:value-of select="html"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="html[@src]">
        <div class="example-part">
          <div class="example-label">HTML</div>
          <example src="{html/@src}" lang="xml"/>
        </div>
      </xsl:if>
      <xsl:if test="css[not(@src)]">
        <div class="example-part">
          <div class="example-label">CSS</div>
          <pre class="brush: css; gutter: false; toolbar: false; {@classes}">
            <xsl:value-of select="css"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="css[@src]">
        <div class="example-part">
          <div class="example-label">CSS</div>
          <example src="{css/@src}" lang="css"/>
        </div>
      </xsl:if>
      <xsl:if test="js[not(@src)]">
        <div class="example-part">
          <div class="example-label">JS</div>
          <pre class="brush: js; gutter: false; toolbar: false; {@classes}">
            <xsl:value-of select="js"/>
          </pre>
        </div>
      </xsl:if>
      <xsl:if test="js[@src]">
        <div class="example-part">
          <div class="example-label">JS</div>
          <example src="{js/@src}" lang="js"/>
        </div>
      </xsl:if>
      <xsl:if test="output[not(@src)]">
        <div class="example-part">
          <div class="example-label">&#9654; Output</div>
          <div class="html5-output">
            <xsl:copy-of select="output"/>
          </div>
        </div>
      </xsl:if>
      <xsl:if test="output[@src]">
        <div class="example-part">
          <div class="example-label">&#9654; Output</div>
          <div class="html5-output">
            <iframe src="{output/@src}" onload="iframeLoaded(this, event)"/>
          </div>
        </div>
      </xsl:if>
    </div>
  </xsl:template>


  <!--
    ##  MATH
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
    ##  ABC MUSIC
  -->
  <xsl:template match="abc">
    <xsl:copy-of select="."/>
    <div class="abc-score"/>
    <xsl:if test="./@class = 'play-midi'">
      <div class="abc-player"/>
    </xsl:if>
  </xsl:template>


  <!--
    ##  VIDEO
  -->
  <xsl:template match="video">
    <div class="video-wrapper">
      <xsl:copy-of select="."/>
    </div>
  </xsl:template>


  <!--
    ##  CITATIONS
  -->
  <xsl:template match="citace">
    <span class="citace">
      <xsl:copy-of select="."/>
    </span>
  </xsl:template>


  <!--
    ##  CC0 LICENSE
  -->
  <xsl:template match="CC0">
    <div class="CC0">
      <xsl:copy-of select="."/>
      <a href="http://creativecommons.org/publicdomain/zero/1.0/" class="external" alt="CC0">
        <img src="/cjs/CC0_80x15.png" width="80" height="15" alt="public domain"/>
      </a>
    </div>
  </xsl:template>


  <!--
    ##  FALLTHROUGH: pass-through HTML elements as-is
  -->
  <xsl:template match="*">
    <xsl:element name="{name()}">
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
