/**
 * Authentication Module
 * Handles user registration, login, logout and session management.
 * Uses localStorage as the persistence layer (will be replaced by a backend API later).
 *
 * @module utils/auth
 * @version 0.1.0
 */

const Auth = (function () {
    'use strict';

    const USERS_KEY = 'detractio_users';
    const SESSION_KEY = 'detractio_session';

    // ── Helpers ──────────────────────────────────────────────────

    /** Get all registered users from localStorage */
    function _getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
        } catch (_) {
            return {};
        }
    }

    /** Save users map back to localStorage */
    function _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    /** Simple hash for password (NOT secure — placeholder until backend) */
    function _hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'h_' + Math.abs(hash).toString(36);
    }

    /** Generate a simple session token */
    function _generateToken() {
        return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    // ── Public API ──────────────────────────────────────────────

    /**
     * Register a new user.
     * @param {Object} details - { email, password, firstName, lastName }
     * @returns {{ success: boolean, error?: string }}
     */
    function register(details) {
        const { email, password, firstName, lastName } = details;

        if (!email || !password || !firstName) {
            return { success: false, error: 'Email, password and first name are required.' };
        }

        const emailKey = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey)) {
            return { success: false, error: 'Please enter a valid email address.' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const users = _getUsers();
        if (users[emailKey]) {
            return { success: false, error: 'An account with this email already exists.' };
        }

        users[emailKey] = {
            email: emailKey,
            firstName: firstName.trim(),
            lastName: (lastName || '').trim(),
            passwordHash: _hashPassword(password),
            createdAt: new Date().toISOString(),
            tier: 'free'
        };

        _saveUsers(users);

        // Auto-login after registration
        const token = _generateToken();
        const session = { email: emailKey, token: token, loginAt: new Date().toISOString() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true };
    }

    /**
     * Login an existing user.
     * @param {string} email
     * @param {string} password
     * @returns {{ success: boolean, error?: string }}
     */
    function login(email, password) {
        if (!email || !password) {
            return { success: false, error: 'Email and password are required.' };
        }

        const emailKey = email.trim().toLowerCase();
        const users = _getUsers();
        const user = users[emailKey];

        if (!user) {
            return { success: false, error: 'No account found with this email.' };
        }

        if (user.passwordHash !== _hashPassword(password)) {
            return { success: false, error: 'Incorrect password.' };
        }

        const token = _generateToken();
        const session = { email: emailKey, token: token, loginAt: new Date().toISOString() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true };
    }

    /** Logout the current user */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    /**
     * Get the currently logged-in user profile, or null.
     * @returns {Object|null} - { email, firstName, lastName, tier, createdAt }
     */
    function getCurrentUser() {
        try {
            const session = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!session || !session.email) return null;

            const users = _getUsers();
            const user = users[session.email];
            if (!user) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }

            return {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                tier: user.tier || 'free',
                createdAt: user.createdAt
            };
        } catch (_) {
            return null;
        }
    }

    /** Check if a user is currently logged in */
    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    return {
        register: register,
        login: login,
        logout: logout,
        getCurrentUser: getCurrentUser,
        isLoggedIn: isLoggedIn
    };
})();
