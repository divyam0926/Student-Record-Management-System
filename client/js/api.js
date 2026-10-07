/**
 * API Service Client
 * Unified HTTP client for backend REST communication
 */

const API = {
    baseUrl: window.location.origin + '/api',

    getToken() {
        return localStorage.getItem('srms_token') || '';
    },

    setToken(token) {
        localStorage.setItem('srms_token', token);
    },

    removeToken() {
        localStorage.removeItem('srms_token');
        localStorage.removeItem('srms_user');
    },

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('srms_user') || 'null');
        } catch (e) {
            return null;
        }
    },

    setCurrentUser(user) {
        localStorage.setItem('srms_user', JSON.stringify(user));
    },

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or unauthorized
                    this.removeToken();
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                }
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    },

    get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

window.API = API;