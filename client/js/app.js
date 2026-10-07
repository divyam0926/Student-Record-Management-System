/**
 * Core Application Controller & Router
 */

const App = {
    activeTab: 'dashboard',
    theme: localStorage.getItem('srms_theme') || 'light',

    init() {
        this.applyTheme(this.theme);
        this.bindNavigation();
        this.bindThemeToggle();
        this.bindMobileMenu();
        this.checkHealthStatus();

        // Initialize Submodules
        Auth.init();
        Dashboard.init();
        Students.init();
        Attendance.init();
        Marks.init();
        Reports.init();
        DSA.init();

        // Load initial view
        this.switchTab('dashboard');
    },

    bindNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);

                // Close mobile sidebar if open
                document.querySelector('.sidebar') ?.classList.remove('mobile-open');
            });
        });
    },

    switchTab(tabName) {
        this.activeTab = tabName;

        // Update sidebar navigation active class
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-tab') === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update visible view sections
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        const activeView = document.getElementById(`view-${tabName}`);
        if (activeView) {
            activeView.classList.add('active');
        }

        // Update page header title
        const titleMap = {
            'dashboard': 'Dashboard Overview',
            'students': 'Student Information Management',
            'attendance': 'Attendance Monitoring Module',
            'marks': 'Academic Marks & Grading Module',
            'reports': 'Reports & Analytics Center',
            'dsa': 'Data Structures & Algorithms Playground'
        };

        const headerTitle = document.getElementById('navbar-page-title');
        if (headerTitle) {
            headerTitle.textContent = titleMap[tabName] || 'Student Record Management';
        }

        // Load data for active view
        if (tabName === 'dashboard') Dashboard.load();
        else if (tabName === 'students') Students.load();
        else if (tabName === 'attendance') Attendance.load();
        else if (tabName === 'marks') Marks.load();
        else if (tabName === 'reports') Reports.load();
        else if (tabName === 'dsa') DSA.switchPane(DSA.currentTab);
    },

    bindThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
                localStorage.setItem('srms_theme', this.theme);
                this.applyTheme(this.theme);
            });
        }
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.querySelector('#theme-toggle-btn i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    bindMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }
    },

    async checkHealthStatus() {
        try {
            const res = await API.get('/health');
            const pill = document.getElementById('db-status-text');
            if (pill) {
                pill.textContent = res.databaseMode || 'Active';
            }
        } catch (e) {
            const pill = document.getElementById('db-status-text');
            if (pill) pill.textContent = 'Offline';
        }
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <i class="fas ${iconMap[type] || 'fa-info-circle'} toast-icon"></i>
      <div class="toast-msg">${message}</div>
      <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }
};

window.App = App;

// Bootstrap application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});