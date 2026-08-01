/*
 *  ovládací funkce pro příklady (HUD modern)
 *
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

  function setupSidebarToggle() {
    const tocBtn  = document.getElementById('tocToggle')
    const sidebar = document.getElementById('obsahSidebar')
    const layout  = document.querySelector('.app-layout')
    if (!tocBtn || !sidebar) return

    tocBtn.addEventListener('click', function () {
      const collapsed = sidebar.classList.toggle('collapsed')
      tocBtn.classList.toggle('active', !collapsed)
      if (layout) {
        layout.style.gridTemplateColumns = collapsed ? '1fr' : '260px 1fr'
      }
    })
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
      const pageTitle = document.title.replace('Příklady k procvičení – ', '').replace(' — Python', '')
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


  /* ─── IO Panel Parser ────────────────────────────────────── */

  function formatIOBlocks() {
    const paragraphs = document.querySelectorAll('.priklad .zadani p');
    paragraphs.forEach(p => {
      const html = p.innerHTML;
      if (html.includes('VSTUP:') || html.includes('VÝSTUP:')) {
        p.classList.add('io-panel');
        
        let lines = html.split(/<br\s*\/?>/i);
        let formattedLines = lines.map(line => {
          let clean = line.trim();
          if (!clean) return '';
          
          if (clean.includes('VSTUP:')) {
            return `<div class="io-line io-input"><span class="io-prompt">VSTUP:</span> ${clean.replace(/^[^\w]*VSTUP:\s*/i, '')}</div>`;
          } else if (clean.includes('VÝSTUP:')) {
            return `<div class="io-line io-output"><span class="io-prompt">VÝSTUP:</span> ${clean.replace(/^[^\w]*VÝSTUP:\s*/i, '')}</div>`;
          }
          return `<div class="io-line">${clean}</div>`;
        });
        
        p.innerHTML = formattedLines.filter(Boolean).join('');
      }
    });
  }


  /* ─── Export HTML ────────────────────────────────────────── */

  function setupExportHtml() {
    const btn = document.getElementById('exportHtml')
    if (!btn) return
    btn.addEventListener('click', function () {
      const docClone = document.documentElement.cloneNode(true)
      
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

      const cloneExportBtn = docClone.querySelector('#exportHtml')
      if (cloneExportBtn) cloneExportBtn.remove()
      
      const serializer = new XMLSerializer()
      const content = '<!DOCTYPE html>\n' + serializer.serializeToString(docClone)
      
      let filename = 'exercise.html'
      const titleEl = document.querySelector('h1')
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

  /* ─── Activity Bar Actions ───────────────────────────────── */

  function setupActivityBar() {
    const searchBtn = document.getElementById('act-search')
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        if (typeof window.find === 'function') window.find()
      })
    }

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

    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    const total = document.querySelectorAll('.priklad').length

    // Track visible exercise from active TOC link
    const activeLink = document.querySelector('.toc-link.active')
    const tocLinks   = document.querySelectorAll('.toc-link')
    const idx = activeLink ? [...tocLinks].indexOf(activeLink) + 1 : 1

    leftEl.textContent  = total > 0 ? `Úkol ${idx} z ${total}` : `Cvičení`
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

  /* ─── TOC Active Section (IntersectionObserver) ─────────── */

  function setupTOCObserver() {
    const tocLinks = document.querySelectorAll('.obsah-sections .toc-link')
    if (!tocLinks.length) return

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
            updateStatusBar()
          }
        }
      })
    }, { rootMargin: '-56px 0px -60% 0px', threshold: 0 })

    sectionMap.forEach(function (_link, section) { observer.observe(section) })

    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        const id = link.getAttribute('href').slice(1)
        const target = document.getElementById(id)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (window.innerWidth <= 900) {
          const sidebar = document.getElementById('tocSidebar')
          if (sidebar) sidebar.classList.remove('open')
        }
      })
    })
  }


  function init() {
    initTheme()
    setupThemeToggle()
    setupSidebarToggle()
    setupTOCObserver()
    if (typeof window.initCourseExplorer === 'function') {
      window.initCourseExplorer()
    }

    if (window.SyntaxHighlighter) {
      SyntaxHighlighter.highlight()
    }
    setupExportHtml()

    // Page Visit and tabs rendering
    const cleanTitle = document.title.replace('Příklady k procvičení – ', '').replace(' — Python', '')
    const currentUrl = window.location.pathname + window.location.search
    trackPageVisit(cleanTitle, currentUrl)
    renderTabs()

    // Fix relative links in content pointing to vyuka_downloaded
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href')
      if (href && href.startsWith('vyuka_downloaded/')) {
        a.setAttribute('href', '/' + href)
      }
    })

    // Format VSTUP/VÝSTUP elements
    formatIOBlocks()

    // Status bar: initial render + scroll updates
    updateStatusBar()
    updateThemeIcons()
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
  }

  window.initSubpage = init

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Listen to storage changes to sync theme live if opened side-by-side
  window.addEventListener('storage', function(e) {
    if (e.key === THEME_KEY) {
      initTheme()
    }
  })
})()

