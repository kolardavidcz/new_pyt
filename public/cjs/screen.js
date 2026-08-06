/*
 *  Modern full-page article JS for Python VŠCHT lecture pages
 *  Replaces the old slideshow navigation with:
 *  - Sticky TOC with active section tracking (IntersectionObserver)
 *  - Dark/light mode toggle with localStorage persistence
 *  - Back to top button
 *  - Reading progress bar
 *  - Sidebar toggle
 */

(function () {
  'use strict'

  /* ─── Dark / Light Mode ─────────────────────────────────── */

  const THEME_KEY = 'python-course-theme'

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      applyTheme(saved)
    } else {
      // Default to dark mode to match dashboard
      applyTheme('dark')
    }
  }

  function setupThemeToggle() {
    const btn = document.getElementById('themeToggle')
    if (!btn) return
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'dark'
      applyTheme(current === 'dark' ? 'light' : 'dark')
    })
  }


  /* ─── Sidebar TOC Toggle ─────────────────────────────────── */

  function getScrollRoot() {
    return document.getElementById('contentMain') || document.documentElement
  }

  function setupSidebarToggle() {
    const tocBtn  = document.getElementById('tocToggle')
    const sidebar = document.getElementById('obsahSidebar')
    const layout  = document.querySelector('.app-layout')
    if (!tocBtn || !sidebar) return

    function isMobile() { return window.innerWidth <= 900 }

    tocBtn.addEventListener('click', function () {
      const collapsed = sidebar.classList.toggle('collapsed')
      tocBtn.classList.toggle('active', !collapsed)
      if (layout) {
        layout.style.gridTemplateColumns = collapsed ? '1fr' : '260px 1fr'
      }
    })
  }


  /* ─── TOC Active Section (IntersectionObserver) ─────────── */

  function getLectureSlug() {
    const path = window.location.pathname
    const match = path.match(/([^\/]+)\.(xml|html)$/i)
    return match ? match[1] : 'lecture'
  }

  let saveTimer = null
  function saveScrollPosition(sectionId) {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(function() {
      const key = 'lastpos-' + getLectureSlug()
      localStorage.setItem(key, sectionId)
    }, 300)
  }

  function initSlideBadges() {
    if (typeof window.SLIDE_CLASS === 'undefined') return

    const slug = window.location.pathname.split('/').pop().replace(/\.(xml|html)$/, '')
    
    const diffMap = {
      'skippable': { cls: 'pa', label: 'PA' },
      'new-syntax': { cls: 'jc', label: 'J+C++' },
      'new-concept': { cls: 'nw', label: 'Nové' },
      'new-way': { cls: 'uq', label: 'Unikát' },
      // New taxonomy values
      'basics': { cls: 'pa', label: 'PA' },
      'resyntax': { cls: 'jc', label: 'J+C++' },
      'newconcept': { cls: 'nw', label: 'Nové' },
      'pythonic': { cls: 'uq', label: 'Unikát' },
      'paradigm': { cls: 'uq', label: 'Unikát' }
    }

    const defaultDiff = document.querySelector('meta[name="lecture-difficulty"]')?.getAttribute('content')
    const defaultClassMap = {
      'green': 'basics',
      'orange': 'resyntax',
      'red': 'newconcept',
      'purple': 'pythonic',
      
      // If defaultDiff is already using the new taxonomy:
      'basics': 'basics',
      'resyntax': 'resyntax',
      'newconcept': 'newconcept',
      'pythonic': 'pythonic',
      'paradigm': 'paradigm'
    }
    const fallbackClass = defaultClassMap[defaultDiff] || defaultDiff

    document.querySelectorAll('.slide-section, .priklad').forEach(section => {
      const key = slug + '#' + section.id
      let classification = window.SLIDE_CLASS ? window.SLIDE_CLASS[key] : undefined
      if (!classification) classification = fallbackClass
      
      let targetEl = section.querySelector('h2');
      if (!targetEl) targetEl = section.querySelector('.zadani');
      
      // Render slide tags
      if (window.SLIDE_TAGS && window.SLIDE_TAGS[key] && targetEl) {
        window.SLIDE_TAGS[key].forEach(t => {
          let cls = 'generic';
          if (t === 'Core') cls = 'core';
          else if (t === 'WOW') cls = 'wow';
          else if (t === 'Legendary') cls = 'legendary';
          else if (t === 'Tricky') cls = 'tricky';
          else if (t === 'Skip') cls = 'skip';
          
          const tagHtml = `<span class="custom-tag ${cls} slide-meta-tag">${t}</span>`;
          if (targetEl.tagName === 'H2') {
              targetEl.insertAdjacentHTML('beforeend', tagHtml);
          } else {
              targetEl.insertAdjacentHTML('afterbegin', tagHtml);
          }
        });
      }
    })

  }

  function setupTOCObserver() {
    const tocLinks = document.querySelectorAll('.obsah-sections .toc-link')
    if (!tocLinks.length) return

    const scrollRoot = getScrollRoot()
    const sectionMap = new Map()
    tocLinks.forEach(function (link) {
      const id  = link.getAttribute('href').slice(1)
      const sec = document.getElementById(id)
      if (sec) sectionMap.set(sec, link)
    })

    if (!sectionMap.size) return

    let activeSection = null

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const link = sectionMap.get(entry.target)
          if (link && link !== activeSection) {
            if (activeSection) activeSection.classList.remove('active')
            link.classList.add('active')
            activeSection = link
            link.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            saveScrollPosition(entry.target.id)
          }
        }
      })
    }, {
      root: scrollRoot === document.documentElement ? null : scrollRoot,
      rootMargin: '-56px 0px -60% 0px',
      threshold: 0
    })

    sectionMap.forEach(function (_link, section) {
      observer.observe(section)
    })

    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        const id = link.getAttribute('href').slice(1)
        const target = document.getElementById(id)
        if (target) {
          if (scrollRoot && scrollRoot.scrollTo) {
            const top = target.offsetTop - (scrollRoot === document.documentElement ? 0 : scrollRoot.offsetTop) - 12
            scrollRoot.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
          } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      })
    })
  }

  /* Per-paragraph difficulty indicators (from data-diff on p, ul, blockquote etc.) */
  function initParagraphDiffIndicators() {
    const diffMap = {
      'basics':    { cls: 'basics',    label: 'Základy' },
      'resyntax':  { cls: 'resyntax',  label: 'Resyntax' },
      'newconcept':{ cls: 'newconcept',label: 'Nové' },
      'pythonic':  { cls: 'pythonic',  label: 'Pythonic' },
      'paradigm':  { cls: 'paradigm',  label: 'Paradigma' }
    }

    document.querySelectorAll('.section-body [data-diff]').forEach(function (block) {
      const flavor = block.getAttribute('data-diff')
      if (!flavor || !diffMap[flavor]) return

      // Avoid adding multiple times
      if (block.querySelector('.para-diff')) return

      const info = diffMap[flavor]
      const badge = document.createElement('span')
      badge.className = `para-diff diff-dot ${info.cls}`
      badge.title = info.label
      badge.style.cssText = 'display:inline-block;width:8px;height:8px;margin-right:6px;vertical-align:middle;flex-shrink:0;'

      // Prepend to the block (works well for p, blockquote etc)
      if (block.firstChild) {
        block.insertBefore(badge, block.firstChild)
      } else {
        block.appendChild(badge)
      }
    })
  }


  /* ─── Reading Progress Bar ───────────────────────────────── */

  function setupReadingProgress() {
    const fill = document.getElementById('readingProgress')
    if (!fill) return

    function update() {
      const scrollTop  = window.scrollY
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight
      const progress   = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      fill.style.width = progress + '%'
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
  }


  /* ─── Back to Top Button ─────────────────────────────────── */

  function setupBackToTop() {
    const btn = document.getElementById('backToTop')
    if (!btn) return

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400)
    }, { passive: true })

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }


  /* ─── SyntaxHighlighter ──────────────────────────────────── */

  function initSyntaxHighlighter() {
    if (typeof SyntaxHighlighter !== 'undefined') {
      SyntaxHighlighter.defaults['toolbar'] = false
      SyntaxHighlighter.defaults['gutter']  = true
      SyntaxHighlighter.highlight()
    }
  }

  function setupCopyButtons() {
    // Give SyntaxHighlighter a brief moment to render
    setTimeout(function () {
      const blocks = document.querySelectorAll('.syntaxhighlighter')
      blocks.forEach(function (block) {
        // Ensure container is positioned relatively for copy button placement
        block.style.position = 'relative'

        const btn = document.createElement('button')
        btn.className = 'copy-code-btn'
        btn.setAttribute('title', 'Kopírovat kód')
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'

        btn.addEventListener('click', function () {
          const lines = block.querySelectorAll('.line')
          let text = ''
          if (lines.length > 0) {
            const list = []
            lines.forEach(function (line) {
              list.push(line.textContent)
            })
            text = list.join('\n')
          } else {
            const codeBox = block.querySelector('td.code')
            text = codeBox ? codeBox.textContent : block.textContent
          }

          navigator.clipboard.writeText(text).then(function () {
            showCopyTooltip(btn)
          }).catch(function (err) {
            console.error('Failed to copy text:', err)
          })
        })

        block.appendChild(btn)
      })
    }, 400)
  }

  function showCopyTooltip(btn) {
    const existing = btn.parentNode.querySelector('.copy-tooltip')
    if (existing) existing.remove()

    const tooltip = document.createElement('span')
    tooltip.className = 'copy-tooltip'
    tooltip.textContent = 'Zkopírováno!'
    btn.parentNode.appendChild(tooltip)

    setTimeout(function () {
      tooltip.classList.add('fade-out')
      setTimeout(function () {
        tooltip.remove()
      }, 300)
    }, 1500)
  }

  /* Export to static HTML removed (prototype-only). */

  function setupExportHtml_removed() {
    const btn = document.getElementById('exportHtml')
    if (!btn) return
    btn.addEventListener('click', function () {
      const docClone = document.documentElement.cloneNode(true)
      
      // Convert relative paths under /cjs/ to absolute URLs so it works locally/offline
      const baseHost = (window.location.protocol === 'file:') ? 'http://vyuka.ookami.cz' : window.location.origin
      
      docClone.querySelectorAll('link').forEach(el => {
        const href = el.getAttribute('href')
        if (href && href.startsWith('/cjs/')) {
          el.setAttribute('href', baseHost + href)
        }
      })
      docClone.querySelectorAll('script').forEach(el => {
        const src = el.getAttribute('src')
        if (src && src.startsWith('/cjs/')) {
          el.setAttribute('src', baseHost + src)
        }
      })
      docClone.querySelectorAll('img').forEach(el => {
        const src = el.getAttribute('src')
        if (src && src.startsWith('/cjs/')) {
          el.setAttribute('src', baseHost + src)
        }
      })
      docClone.querySelectorAll('a').forEach(el => {
        const href = el.getAttribute('href')
        if (href && href.startsWith('/cjs/')) {
          el.setAttribute('href', baseHost + href)
        }
      })

      // Remove export button in downloaded file
      const cloneExportBtn = docClone.querySelector('#exportHtml')
      if (cloneExportBtn) cloneExportBtn.remove()
      
      const serializer = new XMLSerializer()
      const content = '<!DOCTYPE html>\n' + serializer.serializeToString(docClone)
      
      let filename = 'slide.html'
      const titleEl = document.querySelector('.lecture-header h1') || document.querySelector('h1')
      if (titleEl && titleEl.textContent) {
        filename = titleEl.textContent.trim().toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_|_$)/g, '') + '.html'
      }
      
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }


  /* ─── Peek Definition Subsystem ─────────────────────────── */

  function escapeHtml(str) {
    if (!str) return ''
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function initPeekSubsystem() {
    if (typeof PEEK_DATA === 'undefined') return

    // Scan code tokens in SyntaxHighlighter and inline code
    setTimeout(function() {
      const tokens = document.querySelectorAll('.syntaxhighlighter .keyword, code')
      tokens.forEach(token => {
        const keyword = token.textContent.trim()
        if (!keyword || keyword.length < 2) return
        
        const section = token.closest('.slide-section')
        if (section && window.SLIDE_CLASS) {
          const slug = window.location.pathname.split('/').pop().replace(/\.(xml|html)$/, '')
          const key = slug + '#' + section.id
          if (window.SLIDE_CLASS[key] === 'skippable' || window.SLIDE_CLASS[key] === 'basics') return
        }
        
        token.classList.add('peekable-token')
        
        let activeKeyword = keyword
        let hasDef = !!PEEK_DATA[activeKeyword]
        
        if (!hasDef) {
          const subWords = keyword.split(/[^a-zA-Z0-9_-]+/)
          for (let i = 0; i < subWords.length; i++) {
            const sw = subWords[i].trim()
            if (sw && PEEK_DATA[sw]) {
              activeKeyword = sw
              hasDef = true
              break
            }
          }
        }
        
        if (!hasDef) return // Do not make it peekable if there's no definition!
        
        token.classList.add('peekable-token')
        token.setAttribute('title', `Klikněte pro definici '${activeKeyword}'`)
        
        token.addEventListener('click', function(e) {
          e.stopPropagation()
          togglePeekPanel(token, activeKeyword)
        })
      })
    }, 600)

    document.addEventListener('click', function() {
      closeAllPeekPanels()
    })
  }

  function togglePeekPanel(token, keyword) {
    const line = token.closest('.line') || token.closest('p') || token
    if (!line) return

    const existing = line.nextElementSibling
    if (existing && existing.classList.contains('peek-panel-container')) {
      existing.remove()
      return
    }

    closeAllPeekPanels()

    const data = PEEK_DATA[keyword]
    const panelWrap = document.createElement('div')
    panelWrap.className = 'peek-panel-container'
    panelWrap.addEventListener('click', function(e) {
      e.stopPropagation()
    })

    if (data) {
      let contentHtml = ''
      if (data.type === 'syntax') {
        contentHtml = `
          <div class="peek-panel-content syntax-shape">
            <p class="peek-desc">${data.desc}</p>
            <div class="peek-comparison-grid">
              <div class="peek-code-col">
                <div class="peek-code-title">Statický ekvivalent (C++ / Java)</div>
                <pre class="peek-code">${escapeHtml(data.old_code)}</pre>
              </div>
              <div class="peek-code-col">
                <div class="peek-code-title">Python</div>
                <pre class="peek-code">${escapeHtml(data.new_code)}</pre>
              </div>
            </div>
          </div>
        `
      } else if (data.type === 'concept') {
        contentHtml = `
          <div class="peek-panel-content concept-shape">
            <p class="peek-desc">${data.desc}</p>
            <div class="peek-stacked-info">
              <div class="peek-info-block">
                <div class="peek-info-title">Problém / Důvod</div>
                <div class="peek-info-text">${data.reason}</div>
              </div>
              <div class="peek-info-block">
                <div class="peek-info-title">Řešení v Pythonu</div>
                <div class="peek-info-text">${data.workaround}</div>
              </div>
            </div>
          </div>
        `
      } else if (data.type === 'paradigm') {
        contentHtml = `
          <div class="peek-panel-content paradigm-shape">
            <p class="peek-desc">${data.desc}</p>
            <div class="peek-comparison-grid">
              <div class="peek-paradigm-col">
                <div class="peek-paradigm-title">Statické mentální schéma</div>
                <div class="peek-paradigm-text">${data.old_mental}</div>
              </div>
              <div class="peek-paradigm-col">
                <div class="peek-paradigm-title">Python dynamické schéma</div>
                <div class="peek-paradigm-text">${data.new_mental}</div>
              </div>
            </div>
          </div>
        `
      } else {
        contentHtml = `
          <div class="peek-panel-content">
            <p class="peek-desc">${data.desc || data.text || ''}</p>
          </div>
        `
      }

      panelWrap.innerHTML = `
        <div class="peek-panel-header">
          <span class="peek-title">${data.title}</span>
          <button class="peek-close-btn">&times;</button>
        </div>
        ${contentHtml}
      `
      
      const closeBtn = panelWrap.querySelector('.peek-close-btn')
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation()
        panelWrap.remove()
      })
    }

    line.parentNode.insertBefore(panelWrap, line.nextSibling)
  }

  function closeAllPeekPanels() {
    document.querySelectorAll('.peek-panel-container').forEach(el => el.remove())
  }


  /* ─── Scroll Restore Subsystem ───────────────────────────── */

  function restoreScrollPosition() {
    const key = 'lastpos-' + getLectureSlug()
    const savedId = localStorage.getItem(key)
    if (savedId) {
      const target = document.getElementById(savedId)
      if (target) {
        setTimeout(function() {
          target.scrollIntoView({ block: 'start' })
        }, 150)
      }
    }
  }


  /* ─── Tabs & History Subsystem ───────────────────────────── */

  function trackPageVisit(title, url) {
    let recents = []
    try {
      recents = JSON.parse(localStorage.getItem('recent-pages') || '[]')
    } catch (e) {
      recents = []
    }
    recents = recents.filter(p => p.url !== url)
    recents.unshift({ title: title, url: url })
    recents = recents.slice(0, 3)
    localStorage.setItem('recent-pages', JSON.stringify(recents))
  }

  function renderTabs() {
    const tabsList = document.getElementById('tabsList')
    if (!tabsList) return
    tabsList.innerHTML = ''

    // Pinned dashboard
    const dashTab = document.createElement('a')
    dashTab.className = 'tab'
    dashTab.href = '/new_order.html'
    dashTab.innerHTML = `<span class="dot-icon"></span>new_order.html`
    tabsList.appendChild(dashTab)

    let recents = []
    try {
      recents = JSON.parse(localStorage.getItem('recent-pages') || '[]')
    } catch (e) {
      recents = []
    }

    const currentUrl = window.location.pathname + window.location.search
    recents = recents.filter(x => x.url && !x.url.includes('new_order.html')).slice(0, 3)
    let currentInRecents = recents.some(x => x.url === currentUrl)

    recents.forEach(p => {
      const isActive = (p.url === currentUrl)
      const tabWrap = document.createElement('div')
      tabWrap.className = 'tab-wrapper'
      
      const link = document.createElement('a')
      link.className = 'tab' + (isActive ? ' active' : '')
      link.href = p.url
      link.innerHTML = `<span class="dot-icon" style="background-color: var(--pa)"></span><span class="tab-title">${p.title}</span>`
      
      const closeBtn = document.createElement('button')
      closeBtn.className = 'tab-close-btn'
      closeBtn.innerHTML = '&times;'
      closeBtn.setAttribute('title', 'Zavřít tab')
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault()
        e.stopPropagation()
        removeTab(p.url)
      })
      link.appendChild(closeBtn)
      tabWrap.appendChild(link)
      tabsList.appendChild(tabWrap)
    })

    if (!currentInRecents && !currentUrl.includes('new_order.html')) {
      const pageTitle = document.title.replace(' — Python', '')
      const tabWrap = document.createElement('div')
      tabWrap.className = 'tab-wrapper'

      const link = document.createElement('a')
      link.className = 'tab active'
      link.href = currentUrl
      link.innerHTML = `<span class="dot-icon" style="background-color: var(--accent)"></span><span class="tab-title">${pageTitle}</span>`

      const closeBtn = document.createElement('button')
      closeBtn.className = 'tab-close-btn'
      closeBtn.innerHTML = '&times;'
      closeBtn.setAttribute('title', 'Zavřít tab')
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault()
        e.stopPropagation()
        removeTab(currentUrl)
      })
      link.appendChild(closeBtn)
      tabWrap.appendChild(link)
      tabsList.appendChild(tabWrap)
    }
  }

  function removeTab(url) {
    let recents = []
    try {
      recents = JSON.parse(localStorage.getItem('recent-pages') || '[]')
    } catch (e) {
      recents = []
    }
    recents = recents.filter(x => x.url !== url)
    localStorage.setItem('recent-pages', JSON.stringify(recents))
    
    const currentUrl = window.location.pathname + window.location.search
    if (url === currentUrl) {
      window.location.href = '/new_order.html'
    } else {
      renderTabs()
    }
  }


  /* ─── Activity Bar Actions ───────────────────────────────── */

  function setupActivityBar() {
    // Search — use native browser find
    const searchBtn = document.getElementById('act-search')
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        // Ctrl+F equivalent — window.find() is non-standard but works in all Chromium/Firefox builds
        // As a fallback we just call the browser's native search
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }))
        if (typeof window.find === 'function') {
          window.find()
        }
      })
    }

    // Progress — scroll to footer / statusbar area
    const progressBtn = document.getElementById('act-progress')
    if (progressBtn) {
      progressBtn.addEventListener('click', function () {
        const footer = document.querySelector('.lecture-footer')
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        }
      })
    }
  }


  /* ─── Status Bar ─────────────────────────────────────────── */

  function updateStatusBar() {
    const bar = document.getElementById('statusbar')
    if (!bar) return

    const leftEl  = bar.querySelector('.status-left')
    const rightEl = bar.querySelector('.status-right')
    if (!leftEl || !rightEl) return

    const theme  = document.documentElement.getAttribute('data-theme') || 'dark'
    const total  = document.querySelectorAll('.slide-section').length

    // Current section index from active TOC link
    const tocLinks  = document.querySelectorAll('.toc-link')
    const activeLink = document.querySelector('.toc-link.active')
    const idx = activeLink
      ? [...tocLinks].indexOf(activeLink) + 1
      : 1

    // Reading progress %
    const scrollTop  = window.scrollY
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight
    const progress   = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0

    leftEl.textContent  = total > 0
      ? `Sekce ${idx} z ${total} \u00b7 ${progress}%`
      : `${progress}%`
    rightEl.textContent = `Motiv: ${theme}`
  }

  function updateThemeIcons() {
    const isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark'
    const sun  = document.querySelector('.sun-icon')
    const moon = document.querySelector('.moon-icon')
    if (sun && moon) {
      sun.style.display  = isDark ? 'block' : 'none'
      moon.style.display = isDark ? 'none'  : 'block'
    }
  }


  /* ─── Init ───────────────────────────────────────────────── */

  function init() {
    initTheme()
    setupThemeToggle()
    setupSidebarToggle()
    setupTOCObserver()
    setupReadingProgress()
    setupBackToTop()
    initSyntaxHighlighter()
    setupCopyButtons()
    // setupExportHtml removed (prototype only)
    initPeekSubsystem()
    initSlideBadges()
    initParagraphDiffIndicators()
    if (typeof window.initCourseExplorer === 'function') {
      window.initCourseExplorer()
    }

    // Page Visit and tabs rendering
    const cleanTitle = document.title.replace(' — Python', '')
    const currentUrl = window.location.pathname + window.location.search
    trackPageVisit(cleanTitle, currentUrl)
    renderTabs()
    restoreScrollPosition()

    // Fix relative links in content pointing to vyuka_downloaded
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href')
      if (href && href.startsWith('vyuka_downloaded/')) {
        a.setAttribute('href', '/' + href)
      }
    })

    // Status bar: initial render + live scroll update
    updateStatusBar()
    updateThemeIcons()
    const scrollRoot = getScrollRoot()
    if (scrollRoot && scrollRoot.addEventListener) {
      scrollRoot.addEventListener('scroll', updateStatusBar, { passive: true })
    }
    window.addEventListener('scroll', updateStatusBar, { passive: true })

    // Re-sync status bar and icons whenever theme changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName === 'data-theme') {
    window.addEventListener('scroll', updateStatusBar, { passive: true })

    // Re-sync status bar and icons whenever theme changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName === 'data-theme') {
          updateStatusBar()
          updateThemeIcons()
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    setupKeyboardNav()
  }

  /* ─── Keyboard & Fullscreen Subsystem ───────────────────── */
  function setupKeyboardNav() {
    document.addEventListener('keydown', function(e) {
      const isInput = !!e.target.closest('input, textarea, select, [contenteditable]')
      if (isInput) return

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        const active = document.querySelector('.toc-link.active')
        const links = [...document.querySelectorAll('.toc-link')]
        const idx = active ? links.indexOf(active) : -1
        if (idx >= 0 && idx < links.length - 1) {
          links[idx + 1].click()
        } else if (links.length && idx < 0) {
          links[0].click()
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        const active = document.querySelector('.toc-link.active')
        const links = [...document.querySelectorAll('.toc-link')]
        const idx = active ? links.indexOf(active) : -1
        if (idx > 0) {
          links[idx - 1].click()
        }
      } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(function() {})
        } else {
          document.exitFullscreen().catch(function() {})
        }
      }
    })
  }

  window.initSubpage = init

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
