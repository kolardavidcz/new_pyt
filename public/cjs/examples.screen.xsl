<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="html" encoding="utf-8" indent="no"/>
  
  <xsl:variable name="directory" select="/examples/@directory" />
  
  
  <xsl:template match="/">
    <html>
      <head>
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
        <title>
          Příklady k procvičení – <xsl:value-of select="/examples/@chapter" />
        </title>
        <link rel="preload" href="/cjs/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
        <link rel="preload" href="/cjs/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
        <link href="/cjs/tokens.css" rel="stylesheet" type="text/css" />
        <script src="/cjs/examples.screen.js"></script>
        <script src="/cjs/spa_router.js"></script>
        <script src="/cjs/bindings.js"></script>
        <script src="/cjs/cestina.js"></script>
        <!-- SyntaxHighlighter -->
        <script src="/cjs/syntax-highlighter/shCore.min.js"></script>
        <link rel="stylesheet" href="/cjs/syntax-highlighter/shCoreDefault.css" />
        <script src="/cjs/syntax-highlighter/shBrushPython.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushKarel.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushBrainfuck.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushPlain.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushSql.js"></script>
        <script src="/cjs/syntax-highlighter/shBrushBash.js"></script>
        <!-- /SyntaxHighlighter -->
        <!-- jqMath -->
        <xsl:if test="examples/use-math">
            <!--link rel="stylesheet" href="http://fonts.googleapis.com/css?family=UnifrakturMaguntia" /-->
            <link rel="stylesheet" href="/cjs/mathscribe/jqmath-0.4.3.css" />
            <script src="/cjs/mathscribe/jquery-1.4.3.min.js"></script>
            <script src="/cjs/mathscribe/jqmath-etc-0.4.6.min.js" charset="utf-8"></script>
        </xsl:if>
        <!-- /jqMath -->
        <!-- ABCjs -->
        <xsl:if test="examples/use-abc">
          <xsl:choose>
            <xsl:when test="examples/use-abc/@class = 'play-midi'">
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
        <xsl:if test="examples/style">
          <xsl:comment> místní styly </xsl:comment>
          <xsl:copy-of select="examples/style" />
        </xsl:if>
        <link href="/cjs/dashboard.css" rel="stylesheet" type="text/css" />
        <link href="/cjs/obsah-panel.css" rel="stylesheet" type="text/css" />
        <link href="/cjs/screen.css" rel="stylesheet" type="text/css" />
        <link href="/cjs/examples.screen.css" media="screen, print" rel="stylesheet" type="text/css" />
        <script src="/cjs/course-data.js"></script>
        <script src="/cjs/course-explorer.js"></script>
      </head>
      <body>
        <div class="app-container">
        <!-- 1. IDE window chrome titlebar -->
        <div class="titlebar">
          <span class="dot red-dot"></span>
          <span class="dot yellow-dot"></span>
          <span class="dot green-dot"></span>
          <span class="name">python-vscht — Příklady: <xsl:value-of select="/examples/@chapter"/></span>
        </div>

        <!-- 2. Dynamic IDE tabbar -->
        <div class="tabbar" id="tabbar">
          <div class="tabs-list" id="tabsList">
            <!-- Populated by JS -->
          </div>
          <div class="tabbar-actions">
            <button id="exportHtml" class="btn-icon" title="Exportovat do statického HTML" aria-label="Export to HTML">
              &#x1F4BE;
            </button>
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
            <aside class="obsah-sidebar timeline-sidebar open-by-default" id="obsahSidebar">
              <div class="obsah-sidebar-header">Obsah</div>
              <nav class="obsah-explorer timeline-track" id="timeline-track-root"></nav>
              <div class="obsah-sections" id="slideTocSection">
                <div class="toc-header">
                  <span class="toc-label">Úkoly</span>
                  <span class="toc-count"><xsl:value-of select="count(/examples/example)"/></span>
                </div>
                <nav class="toc-nav">
                  <ol class="toc-list">
                    <xsl:for-each select="/examples/example">
                      <li class="toc-item">
                        <a class="toc-link" href="#task-{position()}">
                          <span class="toc-num"><xsl:value-of select="position()"/></span>
                          <span class="toc-text">Úkol <xsl:value-of select="position()"/></span>
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
                  <span class="lecture-tag">Cvičení</span>
                </div>
                <h1 class="lecture-title"><xsl:value-of select="/examples/@chapter"/></h1>
              </header>

              <div class="slides-container">
                <xsl:apply-templates select="/examples/theory"/>
                <xsl:apply-templates select="/examples/example"/>
                <xsl:apply-templates select="/examples/note"/>
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
          <span class="status-left">Sekce 1 z <xsl:value-of select="count(/examples/example)"/> · 0% dokončeno</span>
          <span class="status-right">sync: local</span>
        </div>
        </div>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="theory">
    <div class="theory">
      <xsl:apply-templates mode="theory" />
    </div>
  </xsl:template>
  <xsl:template match="abc" mode="theory">
    <xsl:copy-of select="."/>
    <div class="abc-score"/>
    <xsl:if test="./@class = 'play-midi'">
      <div class="abc-player"/>
    </xsl:if>
  </xsl:template>
  <xsl:template match="*" mode="theory">
    <xsl:element name="{name()}">
      <xsl:copy-of select="@*" />
      <xsl:apply-templates mode="theory" />
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="note">
    <p class="note">
      <xsl:apply-templates select="node()" mode="text" />
    </p>
  </xsl:template>
  
  <xsl:template match="example">
    <div class="priklad" id="task-{position()}">
      <xsl:if test="@type='other'">
        <xsl:attribute name="class">priklad other</xsl:attribute>
      </xsl:if>

      <!-- Metadata header for diff / relevance / tags (from annotation schema) -->
      <xsl:if test="@diff or @relevance or @tags">
        <div class="exercise-meta">
          <xsl:if test="@diff">
            <span class="diff-badge {@diff}" title="Obtížnost / flavor">
              <span class="diff-dot {@diff}"></span>
              <xsl:value-of select="@diff"/>
            </span>
          </xsl:if>

          <xsl:if test="@relevance">
            <span class="rel-badge" title="Relevance">
              <span class="rel-bar"><span class="rel-fill" style="width:{@relevance * 10}%"></span></span>
              <span class="rel-val"><xsl:value-of select="@relevance"/>/10</span>
            </span>
          </xsl:if>

          <xsl:if test="@tags">
            <xsl:call-template name="split-tags">
              <xsl:with-param name="tags" select="@tags"/>
            </xsl:call-template>
          </xsl:if>
        </div>
      </xsl:if>

      <div class="zadani">
        <xsl:apply-templates select="text" />
      </div>
      <div class="reseni">
        <xsl:apply-templates select="hint" />
        <xsl:apply-templates select="tests" />
        <xsl:apply-templates select="solution" />
      </div>
    </div>
  </xsl:template>

  <!-- Helper: render tags like "Core,Tricky" -->
  <xsl:template name="split-tags">
    <xsl:param name="tags"/>
    <xsl:choose>
      <xsl:when test="contains($tags, ',')">
        <xsl:call-template name="split-tags">
          <xsl:with-param name="tags" select="substring-before($tags, ',')"/>
        </xsl:call-template>
        <xsl:call-template name="split-tags">
          <xsl:with-param name="tags" select="substring-after($tags, ',')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <span class="tag-badge"><xsl:value-of select="normalize-space($tags)"/></span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="text">
    <xsl:apply-templates mode="text"/>
  </xsl:template>
  <!-- příklady -->
  <xsl:template match="pre[@src]" mode="text">
    <example src="{@src}" lang="{@lang}" />
  </xsl:template>
  <xsl:template match="pre[not(@src)]" mode="text">
    <pre class="brush: {@lang}; gutter: false; toolbar: false;">
      <xsl:value-of select="."/>
    </pre>
  </xsl:template>
  
  <!-- content -->
  <xsl:template match="node()" mode="text">
    <xsl:copy-of select="."/>
  </xsl:template>
  <xsl:template match="abc" mode="text">
    <xsl:copy-of select="."/>
    <div class="abc-score"/>
    <xsl:if test="./@class = 'play-midi'">
      <div class="abc-player"/>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="hint">
    <details class="exercise-details">
      <summary class="exercise-summary"> nápověda </summary>
      <div class="exercise-details-content">
        <xsl:copy-of select="./node()" />
      </div>
    </details>
  </xsl:template>
  
  <xsl:template match="tests">
    <details class="exercise-details">
      <summary class="exercise-summary">
        testy
        (<a href="{@src}" onclick="event.stopPropagation();">
          <em><xsl:value-of select="@src"/></em>
        </a>)
        <xsl:call-template name="comment">
          <xsl:with-param name="data"><xsl:copy-of select="./node()"/></xsl:with-param>
        </xsl:call-template>
      </summary>
      <div class="exercise-details-content">
        <example src="{@src}" lang="{@lang}" />
      </div>
    </details>
  </xsl:template>
  
  <xsl:template match="solution">
    <details class="exercise-details">
      <summary class="exercise-summary">
        řešení
        (<a href="{@src}" onclick="event.stopPropagation();">
          <em><xsl:value-of select="@src"/></em>
        </a>)
        <xsl:call-template name="comment">
          <xsl:with-param name="data"><xsl:copy-of select="./node()"/></xsl:with-param>
        </xsl:call-template>
      </summary>
      <div class="exercise-details-content">
        <example src="{@src}" lang="{@lang}" />
      </div>
    </details>
  </xsl:template>
  
  <xsl:template name="comment">
    <xsl:param name="data"/>
    <xsl:if test="$data != ''">
      <span class="komentář">
        <xsl:text>:</xsl:text> <xsl:copy-of select='$data'/>
      </span>
    </xsl:if>
  </xsl:template>


  <!--
    ##  odkaz na literaturu
    -->
  <xsl:template match="citace" mode="text">
    <span class="citace">
      <xsl:copy-of select="."/>
    </span>
  </xsl:template>
</xsl:stylesheet>
