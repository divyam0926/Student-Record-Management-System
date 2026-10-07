/**
 * Authentication Client Module
 */

const Auth = {
    init() {
        this.loginForm = document.getElementById('login-form');
        this.loginView = document.getElementById('login-modal');
        this.resetBtn = document.getElementById('login-reset-btn');
        this.demoBtn = document.getElementById('fill-demo-btn');
        this.logoutBtn = document.getElementById('logout-nav-btn');

        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.loginForm.reset();
            });
        }

        if (this.demoBtn) {
            this.demoBtn.addEventListener('click', () => {
                document.getElementById('login-username').value = 'admin';
                document.getElementById('login-password').value = 'admin123';
            });
        }

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        window.addEventListener('auth:unauthorized', () => {
            this.showLogin();
            App.showToast('Session expired. Please log in again.', 'warning');
        });

        this.checkInitialAuthState();
    },

    checkInitialAuthState() {
        const token = API.getToken();
        const user = API.getCurrentUser();

        if (token && user) {
            this.hideLogin();
            this.updateUserUI(user);
        } else {
            this.showLogin();
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const submitBtn = this.loginForm.querySelector('button[type="submit"]');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            App.showToast('Please enter both username and password.', 'warning');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

            const response = await API.post('/auth/login', { username, password });

            if (response.success && response.token) {
                API.setToken(response.token);
                API.setCurrentUser(response.user);
                this.updateUserUI(response.user);
                this.hideLogin();
                App.showToast(`Welcome back, ${response.user.username}!`, 'success');

                // Refresh active views
                Dashboard.load();
                Students.load();
            }
        } catch (error) {
            App.showToast(error.message || 'Invalid username or password.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    },

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            API.removeToken();
            this.showLogin();
            App.showToast('Logged out successfully.', 'info');
        }
    },

    showLogin() {
        if (this.loginView) {
            this.loginView.style.display = 'flex';
        }
    },

    hideLogin() {
        if (this.loginView) {
            this.loginView.style.display = 'none';
        }
    },

    updateUserUI(user) {
        const nameEl = document.getElementById('sidebar-user-name');
        const roleEl = document.getElementById('sidebar-user-role');
        const avatarEl = document.getElementById('sidebar-user-avatar');

        if (nameEl) nameEl.textContent = user.username || 'Admin';
        if (roleEl) roleEl.textContent = (user.role || 'Administrator').toUpperCase();
        if (avatarEl) avatarEl.textContent = (user.username ? user.username[0].toUpperCase() : 'A');
    }
};

window.Auth = Auth;