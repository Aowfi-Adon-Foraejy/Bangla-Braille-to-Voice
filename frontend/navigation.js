// Navigation System for Bangla Braille to Voice Conversion System

class NavigationManager {
    constructor() {
        this.currentPage = 'converter';
        this.sidebarOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateActiveMenu();
        this.showPage(this.currentPage);
    }

    setupEventListeners() {
        // Menu item clicks
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                const isClickInside = sidebar.contains(e.target);
                const isMenuToggle = e.target.closest('#mobileMenuToggle') || e.target.closest('#sidebarToggle');
                
                if (!isClickInside && !isMenuToggle && this.sidebarOpen) {
                    this.closeSidebar();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                this.closeSidebar();
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Initialize current hash
        this.handleHashChange();

        // Settings changes
        this.setupSettingsListeners();
    }

    setupSettingsListeners() {
        // Speech rate
        const speechRate = document.getElementById('speechRate');
        if (speechRate) {
            speechRate.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = `${value}x`;
                this.saveSetting('speechRate', value);
            });
        }

        // Speech volume
        const speechVolume = document.getElementById('speechVolume');
        if (speechVolume) {
            speechVolume.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = `${Math.round(value * 100)}%`;
                this.saveSetting('speechVolume', value);
            });
        }

        // Theme
        const theme = document.getElementById('theme');
        if (theme) {
            theme.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
                this.saveSetting('theme', e.target.value);
            });
        }

        // Font size
        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            fontSize.addEventListener('change', (e) => {
                this.applyFontSize(e.target.value);
                this.saveSetting('fontSize', e.target.value);
            });
        }
    }

    navigateToPage(page) {
        this.currentPage = page;
        this.updateActiveMenu();
        this.showPage(page);
        this.updatePageTitle(page);
        
        // Update URL hash
        window.location.hash = page;
        
        // Close mobile sidebar
        if (window.innerWidth <= 1024) {
            this.closeSidebar();
        }

        // Load page-specific data
        this.loadPageData(page);
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Ensure page content is properly displayed
        const pageContent = targetPage.querySelector('.container');
        if (pageContent) {
            pageContent.style.display = 'block';
        }
    }

    updateActiveMenu() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }

    updatePageTitle(page) {
        const titles = {
            converter: 'Braille Converter',
            dashboard: 'Analytics Dashboard',
            history: 'Conversion History',
            help: 'Help & Documentation',
            about: 'About Project',
            settings: 'Settings'
        };

        const titleElement = document.getElementById('pageTitle');
        if (titleElement) {
            titleElement.textContent = titles[page] || 'Braille Converter';
        }
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && this.isValidPage(hash)) {
            this.navigateToPage(hash);
        }
    }

    isValidPage(page) {
        const validPages = ['converter', 'dashboard', 'history', 'help', 'about', 'settings'];
        return validPages.includes(page);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            this.sidebarOpen = !this.sidebarOpen;
            if (this.sidebarOpen) {
                sidebar.classList.add('open');
            } else {
                sidebar.classList.remove('open');
            }
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            this.sidebarOpen = false;
            sidebar.classList.remove('open');
        }
    }

    loadPageData(page) {
        switch(page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'history':
                this.loadHistoryData();
                break;
            case 'converter':
                this.updateStats();
                break;
        }
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        console.log('Loading dashboard data...');
        // In a real app, this would fetch data from the server
    }

    loadHistoryData() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        // Get history from localStorage
        const history = JSON.parse(localStorage.getItem('brailleHistory') || '[]');
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="history-item">
                    <div class="history-item-content">
                        <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                            No conversion history yet. Start by converting some Braille images!
                        </p>
                    </div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item">
                <div class="history-item-header">
                    <strong>Conversion #${index + 1}</strong>
                    <span class="confidence-badge">${Math.round((item.confidence || 0) * 100)}%</span>
                </div>
                <div class="history-item-content">
                    ${item.text || 'No text recognized'}
                </div>
                <div class="history-item-meta">
                    <span><i class="fas fa-clock"></i> ${new Date(item.timestamp).toLocaleString()}</span>
                    <span><i class="fas fa-hourglass-half"></i> ${item.duration || 0}s</span>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const history = JSON.parse(localStorage.getItem('brailleHistory') || '[]');
        
        // Total conversions
        document.getElementById('totalConversions').textContent = history.length;
        
        // Average accuracy
        if (history.length > 0) {
            const avgAccuracy = history.reduce((sum, item) => sum + (item.confidence || 0), 0) / history.length;
            document.getElementById('avgAccuracy').textContent = `${Math.round(avgAccuracy * 100)}%`;
            
            // Average processing time
            const avgTime = history.reduce((sum, item) => sum + (item.duration || 0), 0) / history.length;
            document.getElementById('avgTime').textContent = `${avgTime.toFixed(1)}s`;
        } else {
            document.getElementById('avgAccuracy').textContent = '0%';
            document.getElementById('avgTime').textContent = '0s';
        }
    }

    loadSettings() {
        // Load saved settings
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        
        // Apply settings
        if (settings.speechRate) {
            const speechRate = document.getElementById('speechRate');
            if (speechRate) {
                speechRate.value = settings.speechRate;
                speechRate.nextElementSibling.textContent = `${settings.speechRate}x`;
            }
        }

        if (settings.speechVolume) {
            const speechVolume = document.getElementById('speechVolume');
            if (speechVolume) {
                speechVolume.value = settings.speechVolume;
                speechVolume.nextElementSibling.textContent = `${Math.round(settings.speechVolume * 100)}%`;
            }
        }

        if (settings.theme) {
            const theme = document.getElementById('theme');
            if (theme) {
                theme.value = settings.theme;
                this.applyTheme(settings.theme);
            }
        }

        if (settings.fontSize) {
            const fontSize = document.getElementById('fontSize');
            if (fontSize) {
                fontSize.value = settings.fontSize;
                this.applyFontSize(settings.fontSize);
            }
        }
    }

    saveSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        settings[key] = value;
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--bg-color', '#1e293b');
            document.documentElement.style.setProperty('--surface-color', '#334155');
            document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
            document.documentElement.style.setProperty('--text-secondary', '#cbd5e1');
            document.documentElement.style.setProperty('--border-color', '#475569');
        } else if (theme === 'light') {
            document.documentElement.style.setProperty('--bg-color', '#f8fafc');
            document.documentElement.style.setProperty('--surface-color', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#1e293b');
            document.documentElement.style.setProperty('--text-secondary', '#64748b');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        }
        // Auto theme would use system preference
    }

    applyFontSize(size) {
        const root = document.documentElement;
        switch(size) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
            default:
                root.style.fontSize = '16px';
        }
    }

    // Utility functions for other pages
    clearHistory() {
        if (confirm('Are you sure you want to clear all conversion history?')) {
            localStorage.removeItem('brailleHistory');
            this.loadHistoryData();
            this.updateStats();
            showNotification('History cleared successfully!');
        }
    }

    exportHistory() {
        const history = JSON.parse(localStorage.getItem('brailleHistory') || '[]');
        if (history.length === 0) {
            showNotification('No history to export', 'error');
            return;
        }

        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `braille-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('History exported successfully!');
    }
}

// Initialize navigation when DOM is ready
let navigationManager;

document.addEventListener('DOMContentLoaded', function() {
    navigationManager = new NavigationManager();
    
    // Make navigation manager globally available for other scripts
    window.navigationManager = navigationManager;
    

});

