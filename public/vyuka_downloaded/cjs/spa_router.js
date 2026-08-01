(function() {
    if (!window.DOMParser || !window.fetch || !window.history.pushState) return;

    function loadScripts(scripts, index, callback) {
        if (index >= scripts.length) {
            callback();
            return;
        }
        
        const script = scripts[index];
        const src = script.getAttribute('src');
        
        if (src) {
            // Always load (no caching of previous script versions during dev)
            const newScript = document.createElement('script');
            // Bust browser cache for the script
            const bust = (src.includes('?') ? '&' : '?') + '_cb=' + Date.now();
            newScript.src = src + bust;
            newScript.onload = () => loadScripts(scripts, index + 1, callback);
            newScript.onerror = () => loadScripts(scripts, index + 1, callback);
            document.head.appendChild(newScript);
        } else {
            // Inline script
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
            loadScripts(scripts, index + 1, callback);
        }
    }

    function loadStylesheets(links, callback) {
        let loadedCount = 0;
        const linksToLoad = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Always include styles (remove "already present" cache check for dev)
            if (href) {
                linksToLoad.push(link);
            }
        });
        
        if (linksToLoad.length === 0) {
            callback();
            return;
        }
        
        linksToLoad.forEach(link => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.type = 'text/css';
            // Bust cache on stylesheet href
            const origHref = link.getAttribute('href');
            const bust = (origHref.includes('?') ? '&' : '?') + '_cb=' + Date.now();
            newLink.href = origHref + bust;
            newLink.onload = () => {
                loadedCount++;
                if (loadedCount === linksToLoad.length) {
                    callback();
                }
            };
            newLink.onerror = () => {
                loadedCount++;
                if (loadedCount === linksToLoad.length) {
                    callback();
                }
            };
            document.head.appendChild(newLink);
        });
    }

    // Simple SPA loading indicator (top bar)
    let loadingBar = null;
    function showLoading() {
        if (!loadingBar) {
            loadingBar = document.createElement('div');
            loadingBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--accent,#3b82f6);width:0;z-index:99999;transition:width 0.25s ease-out;';
            document.body.appendChild(loadingBar);
        }
        loadingBar.style.width = '15%';
        loadingBar.style.opacity = '1';
    }
    function hideLoading() {
        if (loadingBar) {
            loadingBar.style.width = '100%';
            setTimeout(() => {
                if (loadingBar) {
                    loadingBar.style.opacity = '0';
                    loadingBar.style.width = '0';
                }
            }, 180);
        }
    }

    function loadPage(url, pushState = true) {
        showLoading();

        const render = (html) => {
            hideLoading();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const fetchedLayout = doc.getElementById('layout-root');
            const currentLayout = document.getElementById('layout-root');
            
            if (fetchedLayout && currentLayout) {
                currentLayout.replaceWith(fetchedLayout);
                
                document.title = doc.title;
                
                if (pushState) {
                    history.pushState({ url: url }, doc.title, url);
                }
                
                const isDashboard = url.endsWith('new_order.html') || url.endsWith('new_order') || url === '/' || new URL(url).pathname === '/new_order';
                
                if (isDashboard) {
                    document.documentElement.classList.remove('spa-subpage-active');
                    document.documentElement.classList.add('dashboard-active');
                } else {
                    document.documentElement.classList.add('spa-subpage-active');
                    document.documentElement.classList.remove('dashboard-active');
                }
                
                // Load stylesheet assets from doc head
                const docLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
                loadStylesheets(docLinks, () => {
                    // Load scripts sequentially
                    const docScripts = Array.from(doc.querySelectorAll('script')).filter(s => {
                        const src = s.getAttribute('src');
                        // Exclude the router itself to avoid double hooks
                        return !src || !src.includes('spa_router.js');
                    });
                    
                    loadScripts(docScripts, 0, () => {
                        if (isDashboard) {
                            if (window.initDashboard) {
                                window.initDashboard();
                            }
                        } else {
                            if (window.initSubpage) {
                                window.initSubpage();
                            }
                        }
                        
                        // Scroll management
                        const hash = new URL(url).hash;
                        setTimeout(() => {
                            if (hash) {
                                const targetEl = document.getElementById(hash.substring(1));
                                if (targetEl) {
                                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    return;
                                }
                            }
                            const container = document.getElementById('workspaceMain') || document.getElementById('contentMain') || document.documentElement;
                            if (container && container.scrollTo) {
                                container.scrollTo(0, 0);
                            } else if (container) {
                                container.scrollTop = 0;
                            }
                        }, 60);
                    });
                });
            }
        };

        // Always fetch fresh (no caching) so changes are visible immediately during development
        fetch(url, { cache: 'no-store' })
            .then(res => res.text())
            .then(html => {
                render(html);
            })
            .catch(err => {
                hideLoading();
                console.error("SPA Page loading failed:", err);
                if (pushState) window.location.href = url;
            });
    }

    // Link interception
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href) {
            const targetUrl = new URL(link.href);
            
            if (targetUrl.origin === window.location.origin) {
                if (targetUrl.pathname === window.location.pathname) {
                    // Same page link, allow browser scroll
                    return;
                }
                
                if (link.hasAttribute('target') || link.classList.contains('no-spa') || link.href.includes('mailto:') || link.href.includes('tel:')) {
                    return;
                }
                
                e.preventDefault();
                loadPage(link.href, true);
            }
        }
    });

    window.addEventListener('popstate', function() {
        loadPage(window.location.href, false);
    });

    // Check initial state
    const initialUrl = window.location.href;
    const isInitialDashboard = initialUrl.endsWith('new_order.html') || initialUrl.endsWith('new_order') || initialUrl.endsWith('/') || window.location.pathname === '/new_order';
    if (!isInitialDashboard) {
        document.documentElement.classList.add('spa-subpage-active');
        document.documentElement.classList.remove('dashboard-active');
    } else {
        document.documentElement.classList.add('dashboard-active');
    }

})();
