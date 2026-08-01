import re

file_path = r"c:\Users\kolar\Desktop\local projects\python_overview\new_order.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define new JS functions
extra_js = """
    // Tab bar list management
    function renderTabs() {
        const tabsList = document.getElementById('tabsList');
        if (!tabsList) return;
        tabsList.innerHTML = '';

        const dashTab = document.createElement('a');
        dashTab.className = 'tab active';
        dashTab.href = '/new_order.html';
        dashTab.innerHTML = `<span class="dot-icon"></span>new_order.html`;
        tabsList.appendChild(dashTab);

        let recents = [];
        try {
            recents = JSON.parse(localStorage.getItem('recent-pages') || '[]');
        } catch(e) {
            recents = [];
        }

        recents = recents.filter(x => x.url && !x.url.includes('new_order.html')).slice(0, 3);
        recents.forEach(p => {
            const tab = document.createElement('a');
            tab.className = 'tab';
            tab.href = p.url;
            tab.innerHTML = `<span class="dot-icon" style="background-color: var(--pa)"></span>${p.title}`;
            tabsList.appendChild(tab);
        });
    }

    window.trackPageVisit = function(title, url) {
        let recents = [];
        try {
            recents = JSON.parse(localStorage.getItem('recent-pages') || '[]');
        } catch(e) {
            recents = [];
        }
        recents = recents.filter(x => x.url !== url);
        recents.unshift({ title: title, url: url });
        recents = recents.slice(0, 3);
        localStorage.setItem('recent-pages', JSON.stringify(recents));
    };

    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.timeline-sidebar');
        const btn = document.getElementById('act-toc');
        if (sidebar) {
            const isHidden = (sidebar.style.display === 'none');
            sidebar.style.display = isHidden ? 'flex' : 'none';
            if (btn) btn.classList.toggle('active', isHidden);
            const layout = document.querySelector('.app-layout');
            if (layout) {
                layout.style.gridTemplateColumns = isHidden ? '240px 1fr' : '1fr';
            }
        }
    };

    window.focusSearch = function() {
        const input = document.getElementById('search-input');
        if (input) {
            input.focus();
            input.select();
        }
    };

    window.scrollToStats = function() {
        const el = document.getElementById('bentoStats');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.toggleCheck = function(btn, event) {
        if (event) event.stopPropagation();
        const id = btn.getAttribute('data-id');
        const card = btn.closest('.topic-card');
        const isChecked = btn.classList.toggle('checked');
        if (isChecked) {
            card.classList.add('completed');
            localStorage.setItem(`completed-${id}`, 'true');
        } else {
            card.classList.remove('completed');
            localStorage.removeItem(`completed-${id}`);
        }
        updateAllStats();
    };

    function updateThemeIcons() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const moon = document.querySelector('.moon-icon');
        const sun = document.querySelector('.sun-icon');
        if (moon && sun) {
            if (isLight) {
                moon.style.display = 'block';
                sun.style.display = 'none';
            } else {
                moon.style.display = 'none';
                sun.style.display = 'block';
            }
        }
    }
"""

# Let's replace createItemCard
# First find createItemCard definition in content
create_card_pattern = re.compile(r"function createItemCard\(item, type, week, index\)\s*\{.*?return card;\s*\}", re.DOTALL)

new_create_card = """function createItemCard(item, type, week, index) {
        const card = document.createElement('div');
        const isCompleted = localStorage.getItem(`completed-${type}-${week}-${index}`) === 'true';
        card.className = `topic-card ${isCompleted ? 'completed' : ''}`;
        card.dataset.diff = item.diff;
        card.dataset.tags = JSON.stringify(item.tags);
        card.dataset.id = `${type}-${week}-${index}`;

        const tagsHtml = item.tags.map(t => `<span class="custom-tag">${t}</span>`).join('');
        const diffLabelMap = {
            green: "PA",
            orange: "Java/C++",
            red: "Nové",
            purple: "Unikát"
        };

        const hasCompare = item.compare && item.compare.trim().length > 0;

        card.innerHTML = `
            <div class="card-top">
                <button class="checkbox-btn ${isCompleted ? 'checked' : ''}" data-id="${type}-${week}-${index}" onclick="toggleCheck(this, event)" aria-label="Označit jako dokončené">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <div style="display:flex; flex-direction:column; gap:4px; min-width:0; flex:1;">
                    <div class="topic-title">${item.title}</div>
                    <div class="card-tags">
                        <span class="difficulty-tag ${item.diff}"><span class="diff-dot ${item.diff}"></span>${diffLabelMap[item.diff]}</span>
                        <span class="relevance-tag">Relevance: ${item.relevance}/10</span>
                        ${tagsHtml}
                    </div>
                </div>
            </div>
            <div class="topic-desc">${item.desc}</div>
            ${hasCompare ? `
            <div class="compare-box" id="compare-box-${type}-${week}-${index}" style="display: none;">
                <div class="compare-header">
                    SROVNÁNÍ S JAVA/C++
                </div>
                <div class="compare-text">${item.compare}</div>
            </div>
            ` : ''}
            <div class="card-actions">
                <a href="${item.path}" class="action-link primary" target="_blank" onclick="trackPageVisit('${item.title}', '${item.path}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    ${type === 'lec' ? 'Lokální snímky' : 'Lokální cvičení'}
                </a>
                ${hasCompare ? `
                <button class="action-link" onclick="toggleCompare(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5M4 12v8h8"></path></svg>
                    Srovnání
                </button>
                ` : ''}
                <a href="http://vyuka.ookami.cz/${item.path.replace('vyuka_downloaded/', '')}" class="action-link" target="_blank">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    Původní web
                </a>
            </div>
        `;

        return card;
    }"""

content, c = create_card_pattern.subn(new_create_card, content)
print(f"Replaced createItemCard: {c}")

# Let's replace toggleTheme, savedTheme check, and toggleWeekComplete
theme_pattern = re.compile(r"// Toggle light/dark theme.*?window\.toggleWeekComplete = function\(weekNum\)\s*\{.*?updateAllStats\(\);\s*\};", re.DOTALL)

new_theme_js = """// Toggle light/dark theme
    window.toggleTheme = function() {
        const el = document.documentElement;
        if (el.getAttribute('data-theme') === 'light') {
            el.removeAttribute('data-theme');
            localStorage.setItem('python-course-theme', 'dark');
        } else {
            el.setAttribute('data-theme', 'light');
            localStorage.setItem('python-course-theme', 'light');
        }
        updateThemeIcons();
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('python-course-theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    setTimeout(updateThemeIcons, 50);

    // Toggle entire week complete
    window.toggleWeekComplete = function(weekNum) {
        const w = courseData.find(x => x.week === weekNum);
        if (!w) return;
        
        let allCompleted = true;
        const checkItem = (item, type, index) => {
            const id = `${type}-${weekNum}-${index}`;
            if (localStorage.getItem(`completed-${id}`) !== 'true') {
                allCompleted = false;
            }
        };
        w.lectures.forEach((item, index) => checkItem(item, 'lec', index));
        w.exercises.forEach((item, index) => checkItem(item, 'exe', index));
        
        const targetState = !allCompleted;
        
        const setItemState = (item, type, index) => {
            const id = `${type}-${weekNum}-${index}`;
            const btn = document.querySelector(`.checkbox-btn[data-id="${id}"]`);
            if (btn) {
                const card = btn.closest('.topic-card');
                if (targetState) {
                    btn.classList.add('checked');
                    card.classList.add('completed');
                    localStorage.setItem(`completed-${id}`, 'true');
                } else {
                    btn.classList.remove('checked');
                    card.classList.remove('completed');
                    localStorage.removeItem(`completed-${id}`);
                }
            }
        };
        w.lectures.forEach((item, index) => setItemState(item, 'lec', index));
        w.exercises.forEach((item, index) => setItemState(item, 'exe', index));
        
        updateAllStats();
    };"""

content, c = theme_pattern.subn(new_theme_js, content)
print(f"Replaced theme/week toggle: {c}")

# Let's replace toggleCompare
compare_pattern = re.compile(r"window\.toggleCompare = function\(btn\)\s*\{.*?btn\.style\.color = '';\s*\}\s*\};", re.DOTALL)
new_compare_js = """window.toggleCompare = function(btn) {
        const card = btn.closest('.topic-card');
        const box = card.querySelector('.compare-box');
        if (box) {
            const isShown = (box.style.display !== 'none');
            box.style.display = isShown ? 'none' : 'block';
            if (!isShown) {
                btn.style.borderColor = 'var(--accent)';
                btn.style.color = 'var(--text)';
            } else {
                btn.style.borderColor = '';
                btn.style.color = '';
            }
        }
    };"""

content, c = compare_pattern.subn(new_compare_js, content)
print(f"Replaced toggleCompare: {c}")

# Inject extra helper functions and renderTabs in init at the end of the script block
# Find restoreCollapsibleStates() call or similar
init_app_pattern = re.compile(r"// Initialize App.*?renderWeeks\(\);.*?restoreCollapsibleStates\(\);", re.DOTALL)
new_init = extra_js + """
    // Initialize App
    renderWeeks();
    restoreCollapsibleStates();
    renderTabs();
    document.getElementById('act-toc').addEventListener('click', toggleSidebar);
"""

content, c = init_app_pattern.subn(new_init, content)
print(f"Injected helpers and tabs: {c}")

# Let's also update updateAllStats to output correct element texts
stats_pattern = re.compile(r"document\.getElementById\('stat-total'\)\.textContent =.*?;", re.DOTALL)
new_stats = """document.getElementById('stat-total').textContent = `${completedItems}/${totalItems}`;
        document.getElementById('stat-green').textContent = `${diffStats.green.completed}/${diffStats.green.total}`;
        document.getElementById('stat-orange').textContent = `${diffStats.orange.completed}/${diffStats.orange.total}`;
        document.getElementById('stat-red').textContent = `${diffStats.red.completed}/${diffStats.red.total}`;
        document.getElementById('stat-purple').textContent = `${diffStats.purple.completed}/${diffStats.purple.total}`;
        
        // Update status left text
        const statusLeft = document.getElementById('status-left-text');
        if (statusLeft) {
            statusLeft.textContent = `Python 3.x course · ${completedItems}/${totalItems} dokončeno`;
        }"""
content, c = stats_pattern.subn(new_stats, content)
print(f"Replaced updateAllStats updates: {c}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done.")
