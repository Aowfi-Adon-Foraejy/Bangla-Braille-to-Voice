// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.apiUrl = 'http://localhost:8000/auth';
        this.init();
    }

    init() {
        this.loadStoredAuth();
        this.setupEventListeners();
        this.updateUI();
    }

    loadStoredAuth() {
        const stored = localStorage.getItem('braillevoice_auth');
        if (stored) {
            try {
                const auth = JSON.parse(stored);
                this.token = auth.token;
                this.currentUser = auth.user;
                
                // Validate token with server
                this.validateToken();
            } catch (error) {
                console.error('Failed to load stored auth:', error);
                this.clearAuth();
            }
        }
    }

    storeAuth(token, user) {
        this.token = token;
        this.currentUser = user;
        localStorage.setItem('braillevoice_auth', JSON.stringify({
            token: token,
            user: user
        }));
    }

    clearAuth() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('braillevoice_auth');
        this.updateUI();
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.apiUrl}/check`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                this.clearAuth();
                return false;
            }

            const data = await response.json();
            if (!data.authenticated) {
                this.clearAuth();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            this.clearAuth();
            return false;
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            this.storeAuth(data.access_token, data.user);
            this.updateUI();
            closeAuthModal();
            this.showSuccess('Login successful!');
            return true;
        } catch (error) {
            this.showError(error.message);
            return false;
        }
    }

    async register(username, email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }

            this.storeAuth(data.access_token, data.user);
            this.updateUI();
            closeAuthModal();
            this.showSuccess('Registration successful!');
            return true;
        } catch (error) {
            this.showError(error.message);
            return false;
        }
    }

    async logout() {
        if (!this.token) return;

        try {
            await fetch(`${this.apiUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        this.clearAuth();
        this.showSuccess('Logged out successfully!');
    }

    isAuthenticated() {
        return this.token !== null && this.currentUser !== null;
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    updateUI() {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.isAuthenticated()) {
            // User is logged in
            userName.textContent = this.currentUser.username;
            userEmail.textContent = this.currentUser.email;
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            // User is not logged in
            userName.textContent = 'Guest User';
            userEmail.textContent = 'Not logged in';
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const username = formData.get('username');
                const password = formData.get('password');
                
                const submitBtn = loginForm.querySelector('.auth-submit');
                submitBtn.classList.add('loading');
                
                await this.login(username, password);
                
                submitBtn.classList.remove('loading');
                loginForm.reset();
            });
        }

        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const username = formData.get('username');
                const email = formData.get('email');
                const password = formData.get('password');
                const confirmPassword = formData.get('confirmPassword');
                
                if (password !== confirmPassword) {
                    this.showError('Passwords do not match');
                    return;
                }
                
                const submitBtn = registerForm.querySelector('.auth-submit');
                submitBtn.classList.add('loading');
                
                await this.register(username, email, password);
                
                submitBtn.classList.remove('loading');
                registerForm.reset();
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAuthModal();
            }
        });

        // Close user dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const userDropdown = document.getElementById('userDropdown');
            
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    showError(message) {
        const errorDiv = document.querySelector('.auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 5000);
        } else {
            alert(message); // Fallback
        }
    }

    showSuccess(message) {
        const successDiv = document.querySelector('.auth-success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.add('show');
            setTimeout(() => successDiv.classList.remove('show'), 3000);
        } else {
            console.log(message); // Fallback
        }
    }
}

// Initialize Auth Manager
window.authManager = new AuthManager();

// Global authentication functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

function showAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');

    // Clear any existing messages
    document.querySelectorAll('.auth-error, .auth-success').forEach(el => {
        el.classList.remove('show');
    });

    if (mode === 'login') {
        authTitle.textContent = 'Login';
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchBtn.textContent = 'Sign Up';
    } else {
        authTitle.textContent = 'Sign Up';
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchBtn.textContent = 'Login';
    }

    modal.classList.add('show');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    
    // Close dropdown too
    document.getElementById('userDropdown').classList.remove('show');
}

function switchAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const authTitle = document.getElementById('authTitle');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');

    if (loginForm.style.display === 'none') {
        showAuthModal('login');
    } else {
        showAuthModal('register');
    }
}

async function logout() {
    await window.authManager.logout();
    closeAuthModal();
}