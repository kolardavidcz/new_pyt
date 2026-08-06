/**
 * Shared course explorer (obsah panel) — text-only tree, minimal chrome.
 * Used on dashboard and lecture subpages.
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizePath(path) {
    if (!path) return '';
    return path.replace(/^\//, '').replace(/\\/g, '/');
  }

  function currentPagePath() {
    const p = window.location.pathname.replace(/^\//, '');
    return normalizePath(p);
  }

  function selectTreeItem(...els) {
    document.querySelectorAll('.explorer-tree .tree-item, .explorer-tree .tree-folder').forEach(function (el) {
      el.classList.remove('active');
    });
    els.forEach(function (el) {
      if (el) el.classList.add('active');
    });
  }

  function expandAncestors(el) {
    let node = el;
    while (node) {
      if (node.classList && node.classList.contains('tree-folder')) {
        node.classList.remove('collapsed');
      }
      if (node.classList && node.classList.contains('tree-children')) {
        node.style.display = 'block';
        node.classList.add('open');
      }
      node = node.parentElement;
    }
  }

  function highlightCurrentPage() {
    const cur = currentPagePath();
    if (!cur) return;

    const hash = window.location.hash.replace('#', '');
    let matched = false;

    document.querySelectorAll('.explorer-tree .tree-item[data-path]').forEach(function (item) {
      const itemPath = normalizePath(item.dataset.path);
      const pageId = item.dataset.pageId || '';
      if (itemPath === cur && (!pageId || pageId === hash)) {
        selectTreeItem(item);
        expandAncestors(item);
        matched = true;
      }
    });

    if (!matched) {
      document.querySelectorAll('.explorer-tree .tree-folder[data-path]').forEach(function (folder) {
        const folderPath = normalizePath(folder.dataset.path);
        if (folderPath === cur) {
          selectTreeItem(folder);
          expandAncestors(folder);
        }
      });
    }
  }

  function wireFolderToggle(folderEl, childrenEl) {
    folderEl.addEventListener('click', function (e) {
      if (e.target.closest('.tree-item')) return;
      const collapsed = childrenEl.style.display === 'none';
      childrenEl.style.display = collapsed ? 'block' : 'none';
      folderEl.classList.toggle('collapsed', !collapsed);
    });
  }

  window.renderCourseExplorer = function (containerId) {
    const container = document.getElementById(containerId || 'timeline-track-root');
    if (!container) return;

    const cd = window.courseData || [];
    container.innerHTML = '';
    container.classList.add('explorer-tree');

    if (!cd.length) {
      container.innerHTML = '<div class="explorer-empty">Načítání obsahu…</div>';
      return;
    }

    cd.forEach(function (w) {
      const weekEl = document.createElement('div');
      weekEl.className = 'tree-folder';
      weekEl.dataset.week = w.week;
      weekEl.innerHTML =
        '<span class="chevron">›</span>' +
        '<span class="tree-label">W' + String(w.week).padStart(2, '0') + ' ' + escapeHtml(w.title) + '</span>';
      container.appendChild(weekEl);

      const weekChildren = document.createElement('div');
      weekChildren.className = 'tree-children open';
      weekChildren.style.display = 'block';
      wireFolderToggle(weekEl, weekChildren);

      if (w.lectures && w.lectures.length) {
        w.lectures.forEach(function (lec) {
          const lecEl = document.createElement('div');
          lecEl.className = 'tree-folder';
          lecEl.dataset.path = lec.path;
          lecEl.innerHTML =
            '<span class="chevron">›</span>' +
            '<span class="tree-label lec-title">' + escapeHtml(lec.title) + '</span>';

          const lecPages = document.createElement('div');
          lecPages.className = 'tree-children open';
          lecPages.style.display = 'block';
          wireFolderToggle(lecEl, lecPages);

          lecEl.addEventListener('click', function (e) {
            if (e.target.classList.contains('lec-title') || e.target.closest('.lec-title')) {
              e.stopPropagation();
              selectTreeItem(lecEl);
              window.location.href = '/' + normalizePath(lec.path);
            }
          });

          const pages = (window.lecturePagesData && window.lecturePagesData[lec.path]) || [];
          pages.forEach(function (p) {
            const pEl = document.createElement('div');
            pEl.className = 'tree-item';
            pEl.dataset.path = lec.path;
            pEl.dataset.pageId = p.id || '';
            pEl.innerHTML = '<span class="tree-label">' + escapeHtml(p.title) + '</span>';
            pEl.addEventListener('click', function (e) {
              e.stopPropagation();
              selectTreeItem(lecEl, pEl);
              const hash = p.id ? '#' + p.id : '';
              window.location.href = '/' + normalizePath(lec.path) + hash;
            });
            lecPages.appendChild(pEl);
          });

          weekChildren.appendChild(lecEl);
          weekChildren.appendChild(lecPages);
        });
      }

      if (w.exercises && w.exercises.length) {
        w.exercises.forEach(function (ex) {
          const exEl = document.createElement('div');
          exEl.className = 'tree-item';
          exEl.dataset.path = ex.path;
          exEl.innerHTML = '<span class="tree-label">' + escapeHtml(ex.title) + '</span>';
          exEl.addEventListener('click', function (e) {
            e.stopPropagation();
            selectTreeItem(exEl);
            window.location.href = '/' + normalizePath(ex.path);
          });
          weekChildren.appendChild(exEl);
        });
      }

      container.appendChild(weekChildren);
    });

    highlightCurrentPage();
  };

  window.initCourseExplorer = function () {
    const container = document.getElementById('timeline-track-root');
    if (!container) return;

    function render() {
      window.renderCourseExplorer('timeline-track-root');
    }

    if (window.lecturePagesData) {
      render();
      return;
    }

    fetch('/data/lecture-pages.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) {
        window.lecturePagesData = d || {};
        render();
      })
      .catch(function () {
        window.lecturePagesData = window.lecturePagesData || {};
        render();
      });
  };

  window.highlightCourseExplorer = highlightCurrentPage;
})();