/* ==========================================================================
   UI/UX DESIGNER PORTFOLIO — Dashboard JavaScript
   Powers all interactivity for dashboard.html
   Vanilla JS only — no dependencies
   ========================================================================== */

(function () {
    'use strict';

    /* ==========================================================================
       1. AUTH CHECK
       ========================================================================== */

    document.addEventListener('DOMContentLoaded', function () {
        var isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
            return;
        }
        initDashboard();
    });

    /* ==========================================================================
       2. DATA MANAGEMENT — Project Data Store
       ========================================================================== */

    var STORAGE_KEY = 'arjun_dashboard_projects';

    var defaultProjects = [
        { name: 'FinTech Banking App', client: 'FinBank Corp', category: 'Mobile', status: 'Completed', progress: 100, deadline: '2025-12-15', color: '#6366f1', description: 'A comprehensive mobile banking application with modern UI/UX design principles.' },
        { name: 'E-Commerce Redesign', client: 'ShopNow Inc', category: 'Web', status: 'In Progress', progress: 75, deadline: '2026-03-20', color: '#8b5cf6', description: 'Complete redesign of the e-commerce platform focusing on conversion optimization.' },
        { name: 'Healthcare Platform', client: 'MedCare Ltd', category: 'Mobile', status: 'In Progress', progress: 60, deadline: '2026-04-10', color: '#22c55e', description: 'Healthcare management platform with appointment booking and telemedicine features.' },
        { name: 'Food Delivery App', client: 'QuickBite', category: 'Mobile', status: 'Completed', progress: 100, deadline: '2025-11-30', color: '#f59e0b', description: 'On-demand food delivery application with real-time tracking.' },
        { name: 'Travel Portal', client: 'WanderLust', category: 'Web', status: 'Completed', progress: 100, deadline: '2025-10-20', color: '#ec4899', description: 'Full-featured travel booking portal with itinerary planning.' },
        { name: 'SaaS Dashboard', client: 'DataVibe', category: 'Dashboard', status: 'In Progress', progress: 45, deadline: '2026-05-01', color: '#06b6d4', description: 'Analytics dashboard for SaaS metrics visualization and reporting.' },
        { name: 'Education Platform', client: 'LearnHub', category: 'Web', status: 'Pending', progress: 0, deadline: '2026-06-15', color: '#a855f7', description: 'Online learning platform with course management and live sessions.' },
        { name: 'Fitness App', client: 'FitLife', category: 'Mobile', status: 'Completed', progress: 100, deadline: '2025-09-10', color: '#ef4444', description: 'Fitness tracking application with workout plans and nutrition guidance.' }
    ];

    function loadProjects() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) { /* localStorage unavailable */ }
        saveProjects(defaultProjects);
        return defaultProjects.slice();
    }

    function saveProjects(projects) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        } catch (e) { /* localStorage unavailable */ }
    }

    var projects = loadProjects();
    var filteredProjects = projects.slice();
    var currentPage = 1;
    var rowsPerPage = 5;
    var sortColumn = -1;
    var sortDirection = 'asc';
    var selectedRows = new Set();
    var activeFilter = 'all';

    /* ==========================================================================
       3. TOAST NOTIFICATION SYSTEM
       ========================================================================== */

    function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toastContainer');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = '<span>' + message + '</span><button class="toast-close">&times;</button>';
        container.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        var closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                dismissToast(toast);
            });
        }

        setTimeout(function () {
            dismissToast(toast);
        }, 4000);
    }

    function dismissToast(toast) {
        if (!toast || toast.classList.contains('is-dismissing')) return;
        toast.classList.add('is-dismissing');
        toast.classList.remove('show');
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 350);
    }

    /* ==========================================================================
       4. SIDEBAR TOGGLE
       ========================================================================== */

    function initSidebar() {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');
        var collapseBtn = document.getElementById('sidebarCollapseBtn');
        var hamburger = document.getElementById('topbarHamburger');

        if (!sidebar) return;

        /* Restore saved state */
        var savedCollapsed = localStorage.getItem('arjun_sidebar_collapsed');
        if (savedCollapsed === 'true') {
            sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        }

        /* Collapse button */
        if (collapseBtn) {
            collapseBtn.addEventListener('click', function () {
                var isMobile = window.innerWidth < 768;
                if (isMobile) {
                    sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('active');
                    document.body.classList.remove('sidebar-overlay-active');
                } else {
                    sidebar.classList.toggle('collapsed');
                    var collapsed = sidebar.classList.contains('collapsed');
                    document.body.classList.toggle('sidebar-collapsed', collapsed);
                    try {
                        localStorage.setItem('arjun_sidebar_collapsed', collapsed);
                    } catch (e) { /* ignore */ }
                }
            });
        }

        /* Hamburger for mobile */
        if (hamburger) {
            hamburger.addEventListener('click', function () {
                sidebar.classList.add('open');
                if (overlay) overlay.classList.add('active');
                document.body.classList.add('sidebar-overlay-active');
            });
        }

        /* Click outside to close on mobile */
        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.classList.remove('sidebar-overlay-active');
            });
        }

        /* Close sidebar on resize from mobile to desktop */
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.classList.remove('sidebar-overlay-active');
            }
        });
    }

    /* ==========================================================================
       5. ACTIVE NAV ITEM
       ========================================================================== */

    function initNavActive() {
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        var savedActive = localStorage.getItem('arjun_active_nav');

        if (savedActive) {
            navItems.forEach(function (item) {
                item.classList.remove('active');
                if (item.getAttribute('href') === savedActive) {
                    item.classList.add('active');
                }
            });
        }

        navItems.forEach(function (item) {
            item.addEventListener('click', function () {
                navItems.forEach(function (n) { n.classList.remove('active'); });
                item.classList.add('active');
                try {
                    localStorage.setItem('arjun_active_nav', item.getAttribute('href'));
                } catch (e) { /* ignore */ }

                /* Close mobile sidebar on nav click */
                if (window.innerWidth < 768) {
                    var sidebar = document.getElementById('sidebar');
                    var overlay = document.getElementById('sidebarOverlay');
                    if (sidebar) sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('active');
                    document.body.classList.remove('sidebar-overlay-active');
                }
            });
        });
    }

    /* ==========================================================================
       6. STAT CARD COUNTER ANIMATION
       ========================================================================== */

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return num.toString();
    }

    function animateCounter(element, target, duration) {
        duration = duration || 1800;
        var startTime = null;
        var startVal = 0;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var easedProgress = easeOutCubic(progress);
            var current = Math.round(startVal + (target - startVal) * easedProgress);
            element.textContent = formatNumber(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = formatNumber(target);
            }
        }

        requestAnimationFrame(step);
    }

    function initStatCounters() {
        var statValues = document.querySelectorAll('.stat-card-value');
        statValues.forEach(function (el) {
            var text = el.textContent.trim();
            var num = parseInt(text, 10);
            if (!isNaN(num)) {
                el.textContent = '0';
                setTimeout(function () {
                    animateCounter(el, num);
                }, 300);
            }
        });
    }

    /* ==========================================================================
       7. BAR CHART INTERACTIVITY
       ========================================================================== */

    function initBarChart() {
        var barChartBars = document.querySelectorAll('.bar-chart-bars .bar');
        if (barChartBars.length === 0) return;

        /* Create tooltip element */
        var tooltip = document.createElement('div');
        tooltip.className = 'bar-tooltip';
        tooltip.style.cssText = 'position:fixed;pointer-events:none;background:var(--bg-card,#1e1e2e);color:var(--text-primary,#fff);padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.2s ease;border:1px solid var(--border-color,rgba(255,255,255,0.1));white-space:nowrap;';
        document.body.appendChild(tooltip);

        barChartBars.forEach(function (bar, index) {
            var valueSpan = bar.querySelector('.bar-value');
            var col = bar.closest('.bar-chart-col');
            var label = col ? col.querySelector('.bar-label') : null;
            var value = valueSpan ? valueSpan.textContent.trim() : '';
            var month = label ? label.textContent.trim() : '';

            /* Set initial height to 0 for animation */
            var targetHeight = bar.style.getPropertyValue('--bar-height');
            bar.style.setProperty('--bar-height', '0%');
            bar.style.transition = 'none';

            /* Animate bars on load */
            setTimeout(function () {
                bar.style.transition = 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.setProperty('--bar-height', targetHeight);
            }, 400 + (index * 100));

            /* Hover tooltip */
            bar.addEventListener('mouseenter', function (e) {
                tooltip.textContent = month + ': ' + value + ' projects';
                tooltip.style.opacity = '1';
                bar.style.filter = 'brightness(1.15)';
                bar.style.transform = 'scaleX(1.06)';
                bar.style.transition = 'filter 0.2s, transform 0.2s';
            });

            bar.addEventListener('mousemove', function (e) {
                var rect = bar.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 12 + 'px';
            });

            bar.addEventListener('mouseleave', function () {
                tooltip.style.opacity = '0';
                bar.style.filter = '';
                bar.style.transform = '';
            });
        });

        /* Chart filter buttons */
        var filterBtns = document.querySelectorAll('.chart-card .chart-filter-btn');
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var parent = btn.closest('.chart-card-actions');
                if (parent) {
                    parent.querySelectorAll('.chart-filter-btn').forEach(function (b) {
                        b.classList.remove('active');
                    });
                }
                btn.classList.add('active');
            });
        });
    }

    /* ==========================================================================
       8. DONUT CHART INTERACTIVITY
       ========================================================================== */

    function initDonutChart() {
        var donut = document.querySelector('.donut-chart');
        var centerValue = document.querySelector('.donut-chart-center-value');
        var centerLabel = document.querySelector('.donut-chart-center-label');
        if (!donut) return;

        var legendItems = document.querySelectorAll('.donut-chart-legend .legend-item');
        var totalClients = 48;
        var segments = [
            { label: 'New Clients', value: 24, color: 'var(--accent-color, #6366f1)' },
            { label: 'Returning', value: 16, color: 'var(--chart-purple, #8b5cf6)' },
            { label: 'Referrals', value: 8, color: 'var(--chart-orange, #f59e0b)' }
        ];

        legendItems.forEach(function (item, index) {
            item.style.cursor = 'pointer';
            item.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

            item.addEventListener('mouseenter', function () {
                if (centerValue && index < segments.length) {
                    centerValue.textContent = segments[index].value;
                    if (centerLabel) centerLabel.textContent = segments[index].label;
                }
                item.style.opacity = '1';
                item.style.transform = 'translateX(4px)';
                legendItems.forEach(function (other, i) {
                    if (i !== index) other.style.opacity = '0.5';
                });
                /* Apply highlight via filter on the donut */
                donut.style.transition = 'filter 0.3s ease';
                donut.style.filter = 'brightness(1.1) contrast(1.05)';
            });

            item.addEventListener('mouseleave', function () {
                if (centerValue) centerValue.textContent = totalClients;
                if (centerLabel) centerLabel.textContent = 'Clients';
                item.style.transform = '';
                legendItems.forEach(function (other) {
                    other.style.opacity = '1';
                });
                donut.style.filter = '';
            });
        });
    }

    /* ==========================================================================
       9. LINE CHART — SVG PATH ANIMATION
       ========================================================================== */

    function initLineChart() {
        var line = document.querySelector('.line-chart-line');
        var area = document.querySelector('.line-chart-area');
        var points = document.querySelectorAll('.line-chart-svg circle');

        if (line) {
            var length = line.getTotalLength ? line.getTotalLength() : 1000;
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;
            line.style.transition = 'none';

            setTimeout(function () {
                line.style.transition = 'stroke-dashoffset 2s ease-in-out';
                line.style.strokeDashoffset = '0';
            }, 600);
        }

        if (area) {
            area.style.opacity = '0';
            area.style.transition = 'none';
            setTimeout(function () {
                area.style.transition = 'opacity 1.5s ease-in-out';
                area.style.opacity = '1';
            }, 800);
        }

        if (points && points.length > 0) {
            points.forEach(function (circle, i) {
                circle.style.opacity = '0';
                circle.style.transform = 'scale(0)';
                circle.style.transformOrigin = 'center';
                circle.style.transition = 'none';
                setTimeout(function () {
                    circle.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    circle.style.opacity = '1';
                    circle.style.transform = 'scale(1)';
                }, 1200 + (i * 120));
            });
        }
    }

    /* ==========================================================================
       10. PROJECT TABLE — Render, Search, Filter, Sort, Pagination
       ========================================================================== */

    function getProgressClass(progress) {
        if (progress >= 100) return 'progress-bar-fill--completed';
        if (progress > 0) return 'progress-bar-fill--inprogress';
        return 'progress-bar-fill--pending';
    }

    function getStatusClass(status) {
        var s = status.toLowerCase();
        if (s === 'completed') return 'status-badge--completed';
        if (s === 'in progress') return 'status-badge--inprogress';
        if (s === 'pending') return 'status-badge--pending';
        return '';
    }

    function getCategoryClass(cat) {
        var c = cat.toLowerCase();
        if (c === 'mobile') return 'category-badge--mobile';
        if (c === 'web') return 'category-badge--web';
        if (c === 'dashboard') return 'category-badge--dashboard';
        return '';
    }

    function renderTable() {
        var tbody = document.querySelector('.projects-table tbody');
        if (!tbody) return;

        var totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;
        if (currentPage < 1) currentPage = 1;

        var startIndex = (currentPage - 1) * rowsPerPage;
        var endIndex = Math.min(startIndex + rowsPerPage, filteredProjects.length);
        var pageData = filteredProjects.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageData.length === 0) {
            var emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" style="text-align:center;padding:40px 20px;color:var(--text-secondary,#94a3b8);">No projects found.</td>';
            tbody.appendChild(emptyRow);
        } else {
            pageData.forEach(function (project, i) {
                var globalIndex = startIndex + i;
                var tr = document.createElement('tr');
                tr.setAttribute('draggable', 'true');
                tr.setAttribute('data-index', globalIndex);
                if (selectedRows.has(globalIndex)) {
                    tr.classList.add('row-selected');
                }

                tr.innerHTML =
                    '<td>' +
                        '<div class="project-name-cell">' +
                            '<span class="project-dot" style="background:' + (project.color || '#6366f1') + '"></span>' +
                            escapeHTML(project.name) +
                        '</div>' +
                    '</td>' +
                    '<td>' + escapeHTML(project.client) + '</td>' +
                    '<td><span class="category-badge ' + getCategoryClass(project.category) + '">' + escapeHTML(project.category) + '</span></td>' +
                    '<td><span class="status-badge ' + getStatusClass(project.status) + '">' + escapeHTML(project.status) + '</span></td>' +
                    '<td>' +
                        '<div class="progress-cell">' +
                            '<div class="progress-bar">' +
                                '<div class="progress-bar-fill ' + getProgressClass(project.progress) + '" style="width:' + project.progress + '%"></div>' +
                            '</div>' +
                            '<span class="progress-text">' + project.progress + '%</span>' +
                        '</div>' +
                    '</td>' +
                    '<td>' + escapeHTML(project.deadline) + '</td>' +
                    '<td>' +
                        '<div class="action-btns">' +
                            '<button class="action-btn action-btn--view" title="View" data-action="view" data-index="' + globalIndex + '">' +
                                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
                            '</button>' +
                            '<button class="action-btn action-btn--edit" title="Edit" data-action="edit" data-index="' + globalIndex + '">' +
                                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
                            '</button>' +
                            '<button class="action-btn action-btn--delete" title="Delete" data-action="delete" data-index="' + globalIndex + '">' +
                                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
                            '</button>' +
                        '</div>' +
                    '</td>';

                tbody.appendChild(tr);
            });
        }

        /* Rebind row events */
        bindActionButtons();
        bindRowDragDrop();
        updatePagination(totalPages);
        updateSelectAllCheckbox();
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /* --- Table Search --- */
    function initTableSearch() {
        var searchInput = document.querySelector('.projects-search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', function () {
            var query = searchInput.value.trim().toLowerCase();
            applyFiltersAndSearch(query);
        });
    }

    /* --- Table Filter (status dropdown) --- */
    function initTableFilter() {
        var filterSelect = document.querySelector('.projects-filter');
        if (!filterSelect) return;

        filterSelect.addEventListener('change', function () {
            activeFilter = filterSelect.value;
            var searchInput = document.querySelector('.projects-search-input');
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            applyFiltersAndSearch(query);
        });
    }

    function applyFiltersAndSearch(query) {
        filteredProjects = projects.filter(function (p) {
            var matchesSearch = true;
            var matchesFilter = true;

            if (query) {
                matchesSearch = p.name.toLowerCase().indexOf(query) !== -1 ||
                    p.client.toLowerCase().indexOf(query) !== -1 ||
                    p.category.toLowerCase().indexOf(query) !== -1;
            }

            if (activeFilter !== 'all') {
                matchesFilter = p.status.toLowerCase().replace(/\s+/g, '-') === activeFilter;
            }

            return matchesSearch && matchesFilter;
        });

        /* Re-apply current sort */
        if (sortColumn !== -1) {
            applySortToFiltered();
        }

        currentPage = 1;
        selectedRows.clear();
        renderTable();
    }

    /* --- Table Sort --- */
    function initTableSort() {
        var headers = document.querySelectorAll('.projects-table thead th');
        headers.forEach(function (th, index) {
            /* Skip the last column (Actions) */
            if (index >= 6) return;

            th.style.cursor = 'pointer';
            th.classList.add('sortable-th');

            /* Add sort indicator */
            var indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = ' ';
            th.appendChild(indicator);

            th.addEventListener('click', function () {
                if (sortColumn === index) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = index;
                    sortDirection = 'asc';
                }

                /* Update indicators */
                headers.forEach(function (h) {
                    var ind = h.querySelector('.sort-indicator');
                    if (ind) ind.textContent = ' ';
                });
                indicator.textContent = sortDirection === 'asc' ? ' \u25B2' : ' \u25BC';

                applySortToFiltered();
                renderTable();
            });
        });
    }

    function applySortToFiltered() {
        var keys = ['name', 'client', 'category', 'status', 'progress', 'deadline'];
        var key = keys[sortColumn] || 'name';

        filteredProjects.sort(function (a, b) {
            var valA = a[key];
            var valB = b[key];

            if (key === 'progress') {
                valA = Number(valA);
                valB = Number(valB);
            } else if (key === 'deadline') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            var cmp = 0;
            if (valA < valB) cmp = -1;
            else if (valA > valB) cmp = 1;

            return sortDirection === 'asc' ? cmp : -cmp;
        });
    }

    /* --- Table Row Selection --- */
    function initTableSelect() {
        var selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', function () {
                var startIndex = (currentPage - 1) * rowsPerPage;
                var endIndex = Math.min(startIndex + rowsPerPage, filteredProjects.length);

                if (selectAll.checked) {
                    for (var i = startIndex; i < endIndex; i++) {
                        selectedRows.add(i);
                    }
                } else {
                    for (var i = startIndex; i < endIndex; i++) {
                        selectedRows.delete(i);
                    }
                }
                renderTable();
                updateBulkActions();
            });
        }
    }

    function updateSelectAllCheckbox() {
        var selectAll = document.getElementById('selectAll');
        if (!selectAll) return;

        var startIndex = (currentPage - 1) * rowsPerPage;
        var endIndex = Math.min(startIndex + rowsPerPage, filteredProjects.length);
        var pageIndices = [];
        for (var i = startIndex; i < endIndex; i++) {
            pageIndices.push(i);
        }

        var allSelected = pageIndices.length > 0 && pageIndices.every(function (idx) {
            return selectedRows.has(idx);
        });

        selectAll.checked = allSelected;
        selectAll.indeterminate = !allSelected && pageIndices.some(function (idx) {
            return selectedRows.has(idx);
        });
    }

    function updateBulkActions() {
        var bulkBar = document.querySelector('.bulk-actions-bar');
        if (!bulkBar) {
            if (selectedRows.size > 0) {
                createBulkActionsBar();
            }
            return;
        }

        if (selectedRows.size > 0) {
            bulkBar.style.display = 'flex';
            var countEl = bulkBar.querySelector('.bulk-count');
            if (countEl) countEl.textContent = selectedRows.size + ' selected';
        } else {
            bulkBar.style.display = 'none';
        }
    }

    function createBulkActionsBar() {
        var projectsSection = document.querySelector('.projects-section');
        if (!projectsSection) return;

        var header = projectsSection.querySelector('.projects-header');
        if (!header) return;

        var bar = document.createElement('div');
        bar.className = 'bulk-actions-bar';
        bar.style.cssText = 'display:none;align-items:center;gap:12px;padding:10px 16px;background:var(--accent-color,#6366f1);color:#fff;border-radius:10px;margin-top:12px;font-size:14px;font-weight:500;animation:fadeIn 0.3s ease;';
        bar.innerHTML =
            '<span class="bulk-count">' + selectedRows.size + ' selected</span>' +
            '<button class="bulk-btn bulk-btn-delete" style="background:rgba(255,255,255,0.2);color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;">Delete Selected</button>' +
            '<button class="bulk-btn bulk-btn-clear" style="background:transparent;color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.3);padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:500;font-size:13px;">Clear Selection</button>';

        header.parentNode.insertBefore(bar, header.nextSibling);

        bar.querySelector('.bulk-btn-delete').addEventListener('click', function () {
            if (selectedRows.size === 0) return;
            var indices = Array.from(selectedRows).sort(function (a, b) { return b - a; });
            indices.forEach(function (idx) {
                projects.splice(idx, 1);
            });
            saveProjects(projects);
            filteredProjects = projects.slice();
            selectedRows.clear();
            var searchInput = document.querySelector('.projects-search-input');
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            applyFiltersAndSearch(query);
            updateBulkActions();
            showToast('Selected projects deleted successfully.', 'success');
        });

        bar.querySelector('.bulk-btn-clear').addEventListener('click', function () {
            selectedRows.clear();
            renderTable();
            updateBulkActions();
        });
    }

    /* --- Pagination --- */
    function initPagination() {
        renderTable();
    }

    function updatePagination(totalPages) {
        var info = document.querySelector('.pagination-info');
        var controls = document.querySelector('.pagination-controls');
        if (!controls) return;

        var startEntry = filteredProjects.length === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1;
        var endEntry = Math.min(currentPage * rowsPerPage, filteredProjects.length);

        if (info) {
            info.textContent = 'Showing ' + startEntry + '-' + endEntry + ' of ' + filteredProjects.length + ' projects';
        }

        controls.innerHTML = '';

        /* Previous button */
        var prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn pagination-btn--prev';
        prevBtn.disabled = currentPage <= 1;
        prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
        prevBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        controls.appendChild(prevBtn);

        /* Page number buttons */
        var maxVisible = 5;
        var startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        var endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            controls.appendChild(createPageBtn(1));
            if (startPage > 2) {
                var dots = document.createElement('button');
                dots.className = 'pagination-btn';
                dots.textContent = '...';
                dots.disabled = true;
                controls.appendChild(dots);
            }
        }

        for (var p = startPage; p <= endPage; p++) {
            controls.appendChild(createPageBtn(p));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                var dots2 = document.createElement('button');
                dots2.className = 'pagination-btn';
                dots2.textContent = '...';
                dots2.disabled = true;
                controls.appendChild(dots2);
            }
            controls.appendChild(createPageBtn(totalPages));
        }

        /* Next button */
        var nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn pagination-btn--next';
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
        nextBtn.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        controls.appendChild(nextBtn);
    }

    function createPageBtn(pageNum) {
        var btn = document.createElement('button');
        btn.className = 'pagination-btn';
        if (pageNum === currentPage) btn.classList.add('pagination-btn--active');
        btn.textContent = pageNum;
        btn.addEventListener('click', function () {
            currentPage = pageNum;
            renderTable();
        });
        return btn;
    }

    /* ==========================================================================
       11. TABLE ROW ACTIONS (View / Edit / Delete)
       ========================================================================== */

    function bindActionButtons() {
        document.querySelectorAll('.action-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var action = btn.getAttribute('data-action');
                var index = parseInt(btn.getAttribute('data-index'), 10);
                if (isNaN(index) || index < 0 || index >= projects.length) return;

                if (action === 'view') openViewModal(index);
                else if (action === 'edit') openEditModal(index);
                else if (action === 'delete') openDeleteModal(index);
            });
        });

        /* Row checkbox selection */
        document.querySelectorAll('.projects-table tbody tr').forEach(function (tr) {
            var checkbox = tr.querySelector('.row-select-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function () {
                    var idx = parseInt(tr.getAttribute('data-index'), 10);
                    if (checkbox.checked) {
                        selectedRows.add(idx);
                        tr.classList.add('row-selected');
                    } else {
                        selectedRows.delete(idx);
                        tr.classList.remove('row-selected');
                    }
                    updateSelectAllCheckbox();
                    updateBulkActions();
                });
            }
        });
    }

    /* --- View Modal --- */
    function openViewModal(index) {
        var project = projects[index];
        if (!project) return;

        setTextContent('viewProjectName', project.name);
        setTextContent('viewProjectClient', project.client);
        setTextContent('viewProjectCategory', project.category);

        var statusEl = document.getElementById('viewProjectStatus');
        if (statusEl) {
            statusEl.innerHTML = '<span class="status-badge ' + getStatusClass(project.status) + '">' + escapeHTML(project.status) + '</span>';
        }

        var progressBar = document.getElementById('viewProjectProgressBar');
        var progressText = document.getElementById('viewProjectProgressText');
        if (progressBar) {
            progressBar.style.width = project.progress + '%';
            progressBar.className = 'progress-bar-fill ' + getProgressClass(project.progress);
        }
        if (progressText) progressText.textContent = project.progress + '%';

        setTextContent('viewProjectDeadline', project.deadline);

        openModal('viewModal');
    }

    /* --- Edit Modal --- */
    function openEditModal(index) {
        var project = projects[index];
        if (!project) return;

        document.getElementById('editProjectIndex').value = index;
        document.getElementById('editProjectName').value = project.name;
        document.getElementById('editProjectClient').value = project.client;
        document.getElementById('editProjectCategory').value = project.category;
        document.getElementById('editProjectStatus').value = project.status;
        document.getElementById('editProjectProgress').value = project.progress;
        document.getElementById('editProjectDeadline').value = project.deadline;

        openModal('editModal');
    }

    function initEditForm() {
        var saveBtn = document.getElementById('editProjectSaveBtn');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', function () {
            var form = document.getElementById('editProjectForm');
            if (!form) return;

            /* Validate required fields */
            var name = document.getElementById('editProjectName').value.trim();
            var client = document.getElementById('editProjectClient').value.trim();
            var category = document.getElementById('editProjectCategory').value;
            var status = document.getElementById('editProjectStatus').value;
            var progress = parseInt(document.getElementById('editProjectProgress').value, 10);
            var deadline = document.getElementById('editProjectDeadline').value;

            if (!name || !client || !category || !status || isNaN(progress) || !deadline) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            if (progress < 0 || progress > 100) {
                showToast('Progress must be between 0 and 100.', 'error');
                return;
            }

            var index = parseInt(document.getElementById('editProjectIndex').value, 10);
            if (isNaN(index) || index < 0 || index >= projects.length) {
                showToast('Invalid project index.', 'error');
                return;
            }

            /* Update project */
            projects[index].name = name;
            projects[index].client = client;
            projects[index].category = category;
            projects[index].status = status;
            projects[index].progress = progress;
            projects[index].deadline = deadline;

            saveProjects(projects);

            /* Re-apply filters and re-render */
            var searchInput = document.querySelector('.projects-search-input');
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            applyFiltersAndSearch(query);

            closeModal('editModal');
            showToast('Project "' + name + '" updated successfully!', 'success');
        });
    }

    /* --- Delete Modal --- */
    function openDeleteModal(index) {
        var project = projects[index];
        if (!project) return;

        document.getElementById('deleteProjectIndex').value = index;
        var nameEl = document.getElementById('deleteProjectName');
        if (nameEl) nameEl.textContent = project.name;

        openModal('deleteModal');
    }

    function initDeleteConfirm() {
        var confirmBtn = document.getElementById('deleteProjectConfirmBtn');
        if (!confirmBtn) return;

        confirmBtn.addEventListener('click', function () {
            var index = parseInt(document.getElementById('deleteProjectIndex').value, 10);
            if (isNaN(index) || index < 0 || index >= projects.length) return;

            var name = projects[index].name;
            projects.splice(index, 1);
            saveProjects(projects);

            selectedRows.delete(index);
            /* Adjust selected rows indices */
            var newSelected = new Set();
            selectedRows.forEach(function (i) {
                if (i > index) newSelected.add(i - 1);
                else if (i < index) newSelected.add(i);
            });
            selectedRows = newSelected;

            var searchInput = document.querySelector('.projects-search-input');
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            applyFiltersAndSearch(query);

            closeModal('deleteModal');
            showToast('Project "' + name + '" has been deleted.', 'success');
        });
    }

    function setTextContent(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /* ==========================================================================
       12. MODAL SYSTEM
       ========================================================================== */

    var lastFocusedElement = null;

    function openModal(id) {
        var modal = document.getElementById(id);
        if (!modal) return;

        lastFocusedElement = document.activeElement;
        modal.classList.add('active');
        document.body.classList.add('modal-open');

        /* Focus first focusable element */
        setTimeout(function () {
            var focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }, 100);

        /* Overlay click to close */
        modal.addEventListener('click', function handler(e) {
            if (e.target === modal) {
                closeModal(id);
                modal.removeEventListener('click', handler);
            }
        });
    }

    function closeModal(id) {
        var modal = document.getElementById(id);
        if (!modal) return;

        modal.classList.remove('active');
        document.body.classList.remove('modal-open');

        if (lastFocusedElement && lastFocusedElement.focus) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function initModals() {
        /* Close buttons */
        document.querySelectorAll('[data-close]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = btn.getAttribute('data-close');
                closeModal(targetId);
            });
        });

        /* Escape key to close */
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                var activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    closeModal(activeModal.id);
                }
            }
        });

        /* Focus trap */
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Tab') return;
            var activeModal = document.querySelector('.modal-overlay.active');
            if (!activeModal) return;

            var focusable = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;

            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        initEditForm();
        initDeleteConfirm();
    }

    /* ==========================================================================
       13. THEME TOGGLE
       ========================================================================== */

    function initThemeToggle() {
        var toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        /* Restore saved theme */
        var savedTheme = localStorage.getItem('arjun_dashboard_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        toggle.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') || 'dark';
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('arjun_dashboard_theme', next);
            } catch (e) { /* ignore */ }
            showToast('Switched to ' + next + ' theme.', 'info');
        });
    }

    /* ==========================================================================
       14. NOTIFICATIONS DROPDOWN
       ========================================================================== */

    var notifications = [
        { text: 'New project request from MedCare Ltd', time: '2 min ago', read: false },
        { text: 'Design review approved for E-Commerce Redesign', time: '1 hour ago', read: false },
        { text: 'Client feedback received for Food Delivery App', time: '3 hours ago', read: false }
    ];

    function initNotifications() {
        var btn = document.getElementById('notificationBtn');
        if (!btn) return;

        /* Create dropdown */
        var dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.style.cssText = 'position:absolute;top:calc(100% + 8px);right:0;width:340px;background:var(--bg-card,#1e1e2e);border:1px solid var(--border-color,rgba(255,255,255,0.1));border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,0.3);z-index:10000;display:none;overflow:hidden;';

        dropdown.innerHTML =
            '<div style="padding:16px 18px;border-bottom:1px solid var(--border-color,rgba(255,255,255,0.1));display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-weight:700;font-size:15px;color:var(--text-primary,#fff);">Notifications</span>' +
                '<button class="mark-all-read" style="background:none;border:none;color:var(--accent-color,#6366f1);font-size:12px;cursor:pointer;font-weight:600;">Mark all read</button>' +
            '</div>' +
            '<div class="notification-list"></div>';

        btn.style.position = 'relative';
        btn.parentNode.appendChild(dropdown);

        renderNotifications(dropdown);

        /* Toggle dropdown */
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = dropdown.style.display === 'block';
            dropdown.style.display = isOpen ? 'none' : 'block';
            if (!isOpen) {
                dropdown.style.animation = 'fadeIn 0.2s ease';
            }
            /* Close profile dropdown if open */
            var profileMenu = document.getElementById('profileMenu');
            if (profileMenu) profileMenu.classList.remove('active');
        });

        /* Mark all read */
        dropdown.querySelector('.mark-all-read').addEventListener('click', function () {
            notifications.forEach(function (n) { n.read = true; });
            renderNotifications(dropdown);
            updateNotificationBadge();
            showToast('All notifications marked as read.', 'info');
        });

        /* Click outside to close */
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    function renderNotifications(dropdown) {
        var list = dropdown.querySelector('.notification-list');
        if (!list) return;

        list.innerHTML = '';

        notifications.forEach(function (notif, index) {
            var item = document.createElement('div');
            item.style.cssText = 'padding:14px 18px;border-bottom:1px solid var(--border-color,rgba(255,255,255,0.05));cursor:pointer;transition:background 0.2s;display:flex;gap:12px;align-items:flex-start;' + (notif.read ? 'opacity:0.6;' : '');

            item.innerHTML =
                '<div style="width:8px;height:8px;border-radius:50%;background:' + (notif.read ? 'transparent' : 'var(--accent-color,#6366f1)') + ';margin-top:6px;flex-shrink:0;"></div>' +
                '<div style="flex:1;">' +
                    '<p style="margin:0;font-size:13px;color:var(--text-primary,#fff);line-height:1.4;">' + escapeHTML(notif.text) + '</p>' +
                    '<span style="font-size:11px;color:var(--text-secondary,#94a3b8);margin-top:4px;display:block;">' + escapeHTML(notif.time) + '</span>' +
                '</div>';

            item.addEventListener('mouseenter', function () {
                item.style.background = 'var(--bg-hover,rgba(255,255,255,0.04))';
            });
            item.addEventListener('mouseleave', function () {
                item.style.background = '';
            });
            item.addEventListener('click', function () {
                notifications[index].read = true;
                renderNotifications(dropdown);
                updateNotificationBadge();
            });

            list.appendChild(item);
        });

        updateNotificationBadge();
    }

    function updateNotificationBadge() {
        var badge = document.querySelector('.topbar-notification-badge');
        var unread = notifications.filter(function (n) { return !n.read; }).length;
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? '' : 'none';
        }
    }

    /* ==========================================================================
       15. PROFILE DROPDOWN
       ========================================================================== */

    function initProfileDropdown() {
        var profileBtn = document.getElementById('profileBtn');
        var profileMenu = document.getElementById('profileMenu');
        if (!profileBtn || !profileMenu) return;

        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
            /* Close notifications if open */
            var notifDropdown = document.querySelector('.notification-dropdown');
            if (notifDropdown) notifDropdown.style.display = 'none';
        });

        document.addEventListener('click', function (e) {
            if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                profileMenu.classList.remove('active');
            }
        });

        /* Logout */
        var logoutBtn = profileMenu.querySelector('.dropdown-menu-item--danger');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                showToast('Signing you out...', 'info');
                setTimeout(function () {
                    window.location.href = 'login.html';
                }, 800);
            });
        }
    }

    /* ==========================================================================
       16. REAL-TIME CLOCK
       ========================================================================== */

    function initRealTimeClock() {
        var dateEl = document.getElementById('currentDate');
        if (!dateEl) return;

        function updateClock() {
            var now = new Date();
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            var dayName = days[now.getDay()];
            var monthName = months[now.getMonth()];
            var date = now.getDate();
            var year = now.getFullYear();

            var hours = now.getHours();
            var minutes = now.getMinutes();
            var seconds = now.getSeconds();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            if (hours === 0) hours = 12;
            var minStr = minutes < 10 ? '0' + minutes : minutes;
            var secStr = seconds < 10 ? '0' + seconds : seconds;

            dateEl.textContent = dayName + ', ' + monthName + ' ' + date + ' ' + year + ' | ' + hours + ':' + minStr + ':' + secStr + ' ' + ampm;
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    /* ==========================================================================
       17. KEYBOARD SHORTCUTS
       ========================================================================== */

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            /* Ctrl+K or Cmd+K: focus search */
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                var searchInput = document.querySelector('.topbar-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    }

    /* ==========================================================================
       18. TOPBAR SEARCH — filters dashboard content
       ========================================================================== */

    function initTopbarSearch() {
        var searchInput = document.querySelector('.topbar-search-input');
        if (!searchInput) return;

        var debounceTimer = null;

        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                var query = searchInput.value.trim().toLowerCase();
                if (query.length === 0) return;

                /* Also filter the table search */
                var tableSearch = document.querySelector('.projects-search-input');
                if (tableSearch) {
                    tableSearch.value = searchInput.value;
                    tableSearch.dispatchEvent(new Event('input'));
                }

                /* Highlight matching activity items */
                highlightActivity(query);
            }, 300);
        });
    }

    function highlightActivity(query) {
        var items = document.querySelectorAll('.activity-item');
        items.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            if (query && text.indexOf(query) !== -1) {
                item.style.background = 'var(--accent-color-alpha, rgba(99, 102, 241, 0.1))';
                item.style.borderRadius = '10px';
            } else {
                item.style.background = '';
                item.style.borderRadius = '';
            }
        });
    }

    /* ==========================================================================
       19. DRAG AND DROP — Table Row Reordering
       ========================================================================== */

    var draggedRow = null;
    var draggedIndex = -1;

    function bindRowDragDrop() {
        var rows = document.querySelectorAll('.projects-table tbody tr');

        rows.forEach(function (row) {
            row.addEventListener('dragstart', function (e) {
                draggedRow = row;
                draggedIndex = parseInt(row.getAttribute('data-index'), 10);
                row.classList.add('row-dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedIndex);
            });

            row.addEventListener('dragend', function () {
                row.classList.remove('row-dragging');
                document.querySelectorAll('.projects-table tbody tr').forEach(function (r) {
                    r.classList.remove('row-drag-over');
                });
                draggedRow = null;
                draggedIndex = -1;
            });

            row.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (row !== draggedRow) {
                    row.classList.add('row-drag-over');
                }
            });

            row.addEventListener('dragleave', function () {
                row.classList.remove('row-drag-over');
            });

            row.addEventListener('drop', function (e) {
                e.preventDefault();
                row.classList.remove('row-drag-over');

                var targetIndex = parseInt(row.getAttribute('data-index'), 10);
                if (isNaN(targetIndex) || draggedIndex === targetIndex) return;

                /* Swap projects */
                var temp = projects[draggedIndex];
                projects.splice(draggedIndex, 1);
                projects.splice(targetIndex, 0, temp);

                saveProjects(projects);

                /* Update selection indices */
                var newSelected = new Set();
                selectedRows.forEach(function (i) {
                    if (i === draggedIndex) newSelected.add(targetIndex);
                    else if (draggedIndex < targetIndex && i > draggedIndex && i <= targetIndex) {
                        newSelected.add(i - 1);
                    } else if (draggedIndex > targetIndex && i < draggedIndex && i >= targetIndex) {
                        newSelected.add(i + 1);
                    } else {
                        newSelected.add(i);
                    }
                });
                selectedRows = newSelected;

                var searchInput = document.querySelector('.projects-search-input');
                var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
                applyFiltersAndSearch(query);
            });
        });
    }

    /* ==========================================================================
       20. STACKED BAR CHART INTERACTIVITY
       ========================================================================== */

    function initStackedBarChart() {
        var segments = document.querySelectorAll('.stacked-bar-segment');
        segments.forEach(function (seg) {
            seg.addEventListener('mouseenter', function () {
                seg.style.filter = 'brightness(1.2)';
                seg.style.transition = 'filter 0.2s ease, transform 0.2s ease';
            });
            seg.addEventListener('mouseleave', function () {
                seg.style.filter = '';
            });
        });
    }

    /* ==========================================================================
       21. SVG LINE CHART HOVER
       ========================================================================== */

    function initLineChartHover() {
        var svg = document.querySelector('.line-chart-svg');
        if (!svg) return;

        var circles = svg.querySelectorAll('circle');
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        var values = [600, 1000, 500, 1200, 1400, 1600, 1500];

        /* Create tooltip for line chart */
        var tooltip = document.createElement('div');
        tooltip.className = 'line-tooltip';
        tooltip.style.cssText = 'position:fixed;pointer-events:none;background:var(--bg-card,#1e1e2e);color:var(--text-primary,#fff);padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.2s ease;border:1px solid var(--border-color,rgba(255,255,255,0.1));white-space:nowrap;';
        document.body.appendChild(tooltip);

        circles.forEach(function (circle, index) {
            circle.style.cursor = 'pointer';
            circle.style.transition = 'r 0.2s ease';

            circle.addEventListener('mouseenter', function (e) {
                circle.setAttribute('r', '7');
                var monthName = index < months.length ? months[index] : '';
                var val = index < values.length ? values[index] : 0;
                tooltip.textContent = monthName + ': ' + formatNumber(val) + ' visitors';
                tooltip.style.opacity = '1';
            });

            circle.addEventListener('mousemove', function (e) {
                var rect = circle.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 12 + 'px';
            });

            circle.addEventListener('mouseleave', function () {
                circle.setAttribute('r', '4');
                tooltip.style.opacity = '0';
            });
        });
    }

    /* ==========================================================================
       22. ANIMATE PROGRESS BARS ON LOAD
       ========================================================================== */

    function animateProgressBars() {
        var fills = document.querySelectorAll('.progress-bar-fill');
        fills.forEach(function (fill) {
            var targetWidth = fill.style.width;
            fill.style.width = '0%';
            fill.style.transition = 'none';

            setTimeout(function () {
                fill.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
                fill.style.width = targetWidth;
            }, 500);
        });
    }

    /* ==========================================================================
       23. STAGGERED FADE-IN ANIMATION FOR CARDS
       ========================================================================== */

    function animateCards() {
        var cards = document.querySelectorAll('.stat-card, .chart-card, .projects-section, .activity-section');
        cards.forEach(function (card, i) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'none';

            setTimeout(function () {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200 + (i * 100));
        });
    }

    /* ==========================================================================
       24. ACTIVITY FEED ANIMATION
       ========================================================================== */

    function animateActivityFeed() {
        var items = document.querySelectorAll('.activity-item');
        items.forEach(function (item, i) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-15px)';
            item.style.transition = 'none';

            setTimeout(function () {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 800 + (i * 120));
        });
    }

    /* ==========================================================================
       25. RESPONSIVE HANDLING
       ========================================================================== */

    function initResponsive() {
        function handleResize() {
            var sidebar = document.getElementById('sidebar');
            var overlay = document.getElementById('sidebarOverlay');
            if (window.innerWidth >= 768) {
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.classList.remove('sidebar-overlay-active');
            }
        }

        window.addEventListener('resize', debounce(handleResize, 150));
    }

    function debounce(fn, delay) {
        var timer;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    /* ==========================================================================
       26. WELCOME TOAST
       ========================================================================== */

    function showWelcomeToast() {
        setTimeout(function () {
            showToast('Welcome back, Arjun! You have 3 new notifications.', 'info');
        }, 1000);
    }

    /* ==========================================================================
       27. INJECT REQUIRED CSS FOR DYNAMIC ELEMENTS
       ========================================================================== */

    function injectDynamicStyles() {
        var style = document.createElement('style');
        style.textContent =
            '@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.row-dragging { opacity: 0.5; }' +
            '.row-drag-over { border-top: 2px solid var(--accent-color, #6366f1) !important; }' +
            '.row-selected { background: var(--accent-color-alpha, rgba(99, 102, 241, 0.08)) !important; }' +
            '.sortable-th { user-select: none; position: relative; }' +
            '.sort-indicator { font-size: 11px; margin-left: 4px; color: var(--accent-color, #6366f1); }' +
            '.toast { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-radius: 10px; margin-bottom: 10px; font-size: 14px; font-weight: 500; color: #fff; transform: translateX(120%); transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }' +
            '.toast.show { transform: translateX(0); }' +
            '.toast.is-dismissing { transform: translateX(120%); opacity: 0; }' +
            '.toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); }' +
            '.toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); }' +
            '.toast-info { background: linear-gradient(135deg, #6366f1, #4f46e5); }' +
            '.toast-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }' +
            '.toast-close { background: rgba(255,255,255,0.2); border: none; color: #fff; font-size: 18px; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.2s; }' +
            '.toast-close:hover { background: rgba(255,255,255,0.35); }' +
            '.modal-open { overflow: hidden; }' +
            '.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 10001; display: none; align-items: center; justify-content: center; padding: 20px; }' +
            '.modal-overlay.active { display: flex; animation: fadeIn 0.25s ease; }' +
            '.modal { background: var(--bg-card, #1e1e2e); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.4); }' +
            '.modal--small { max-width: 440px; }' +
            '.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1)); }' +
            '.modal-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #fff); margin: 0; }' +
            '.modal-close { background: var(--bg-secondary, rgba(255,255,255,0.06)); border: none; color: var(--text-secondary, #94a3b8); font-size: 22px; cursor: pointer; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }' +
            '.modal-close:hover { background: var(--bg-hover, rgba(255,255,255,0.1)); color: var(--text-primary, #fff); }' +
            '.modal-body { padding: 24px; }' +
            '.modal-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.05)); }' +
            '.modal-detail-row:last-child { border-bottom: none; }' +
            '.modal-detail-label { font-size: 13px; color: var(--text-secondary, #94a3b8); font-weight: 500; }' +
            '.modal-detail-value { font-size: 14px; color: var(--text-primary, #fff); font-weight: 600; }' +
            '.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); }' +
            '.btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }' +
            '.btn--primary { background: var(--accent-color, #6366f1); color: #fff; }' +
            '.btn--primary:hover { filter: brightness(1.1); transform: translateY(-1px); }' +
            '.btn--secondary { background: var(--bg-secondary, rgba(255,255,255,0.06)); color: var(--text-primary, #fff); border: 1px solid var(--border-color, rgba(255,255,255,0.1)); }' +
            '.btn--secondary:hover { background: var(--bg-hover, rgba(255,255,255,0.1)); }' +
            '.btn--danger { background: #ef4444; color: #fff; }' +
            '.btn--danger:hover { background: #dc2626; transform: translateY(-1px); }' +
            '.form-group { margin-bottom: 16px; flex: 1; }' +
            '.form-row { display: flex; gap: 16px; }' +
            '.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary, #94a3b8); margin-bottom: 6px; }' +
            '.form-input, .form-select { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color, rgba(255,255,255,0.15)); background: var(--bg-secondary, rgba(255,255,255,0.05)); color: var(--text-primary, #fff); font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; box-sizing: border-box; }' +
            '.form-input:focus, .form-select:focus { border-color: var(--accent-color, #6366f1); }' +
            '.form-select { cursor: pointer; appearance: auto; }' +
            '.delete-modal-icon { text-align: center; margin-bottom: 16px; }' +
            '.delete-modal-icon svg { width: 56px; height: 56px; color: #ef4444; }' +
            '.delete-modal-text { text-align: center; font-size: 14px; color: var(--text-secondary, #94a3b8); line-height: 1.6; }' +
            '.notification-dropdown .notification-list { max-height: 320px; overflow-y: auto; }' +
            '[data-theme="light"] .modal { background: #fff; border-color: #e2e8f0; }' +
            '[data-theme="light"] .toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); }' +
            '[data-theme="light"] .toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); }' +
            '[data-theme="light"] .toast-info { background: linear-gradient(135deg, #6366f1, #4f46e5); }';
        document.head.appendChild(style);
    }

    /* ==========================================================================
       28. PAGE HEADER DATE (non-clock fallback)
       ========================================================================== */

    function setPageDate() {
        var dateEl = document.getElementById('currentDate');
        if (dateEl && !dateEl.textContent) {
            var now = new Date();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            dateEl.textContent = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
        }
    }

    /* ==========================================================================
       INIT — Master initialization function
       ========================================================================== */

    function initDashboard() {
        injectDynamicStyles();
        initSidebar();
        initNavActive();
        initStatCounters();
        initBarChart();
        initDonutChart();
        initLineChart();
        initLineChartHover();
        initStackedBarChart();
        initTableSearch();
        initTableFilter();
        initTableSort();
        initTableSelect();
        renderTable();
        initModals();
        initThemeToggle();
        initNotifications();
        initProfileDropdown();
        initRealTimeClock();
        initKeyboardShortcuts();
        initTopbarSearch();
        initResponsive();
        setPageDate();
        animateCards();
        animateProgressBars();
        animateActivityFeed();
        showWelcomeToast();
    }

})();
