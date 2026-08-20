/* ==========================================================================
   UI/UX DESIGNER PORTFOLIO - Login Page JavaScript
   Handles form validation, password toggle, auth flow, and toast notifications
   ========================================================================== */

(function () {
    'use strict';

    /* --------------------------------------------------------------------------
       DOM References
       -------------------------------------------------------------------------- */
    const DOM = {
        loginForm: document.getElementById('loginForm'),
        emailInput: document.getElementById('email'),
        roleInput: document.getElementById('role'),
        passwordInput: document.getElementById('password'),
        togglePassword: document.getElementById('togglePassword'),
        loginBtn: document.getElementById('loginBtn'),
        rememberMe: document.getElementById('rememberMe'),
        emailGroup: document.getElementById('emailGroup'),
        roleGroup: document.getElementById('roleGroup'),
        passwordGroup: document.getElementById('passwordGroup'),
        toastContainer: document.getElementById('toastContainer'),
        successOverlay: document.getElementById('successOverlay'),
        loadingScreen: document.getElementById('loadingScreen'),
    };

    /* --------------------------------------------------------------------------
       Loading Screen
       -------------------------------------------------------------------------- */
    function hideLoadingScreen() {
        if (DOM.loadingScreen) {
            DOM.loadingScreen.classList.add('is-loaded');
            setTimeout(function () {
                DOM.loadingScreen.style.display = 'none';
            }, 600);
        }
    }

    window.addEventListener('load', function () {
        setTimeout(hideLoadingScreen, 800);
    });

    /* --------------------------------------------------------------------------
       Password Visibility Toggle
       -------------------------------------------------------------------------- */
    if (DOM.togglePassword) {
        DOM.togglePassword.addEventListener('click', function () {
            var isPassword = DOM.passwordInput.type === 'password';
            DOM.passwordInput.type = isPassword ? 'text' : 'password';
            DOM.togglePassword.classList.toggle('is-visible', isPassword);
            DOM.togglePassword.setAttribute(
                'aria-label',
                isPassword ? 'Hide password' : 'Show password'
            );
        });
    }

    /* --------------------------------------------------------------------------
       Validation Helpers
       -------------------------------------------------------------------------- */
    function isValidEmail(email) {
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function setError(group, message) {
        group.classList.add('has-error');
        group.classList.remove('is-valid');
        var errorEl = group.querySelector('.login-error-message');
        if (errorEl && message) {
            errorEl.textContent = message;
        }
    }

    function clearError(group) {
        group.classList.remove('has-error');
    }

    function setValid(group) {
        group.classList.remove('has-error');
        group.classList.add('is-valid');
    }

    function shakeElement(el) {
        el.classList.remove('login-shake');
        void el.offsetWidth;
        el.classList.add('login-shake');
    }

    /* --------------------------------------------------------------------------
       Real-time Validation on Blur
       -------------------------------------------------------------------------- */
    if (DOM.emailInput) {
        DOM.emailInput.addEventListener('blur', function () {
            var value = DOM.emailInput.value.trim();
            if (value === '') {
                clearError(DOM.emailGroup);
                DOM.emailGroup.classList.remove('is-valid');
            } else if (!isValidEmail(value)) {
                setError(DOM.emailGroup, 'Please enter a valid email address');
            } else {
                setValid(DOM.emailGroup);
            }
        });

        DOM.emailInput.addEventListener('input', function () {
            if (DOM.emailGroup.classList.contains('has-error')) {
                var value = DOM.emailInput.value.trim();
                if (isValidEmail(value)) {
                    setValid(DOM.emailGroup);
                }
            }
        });
    }

    if (DOM.passwordInput) {
        DOM.passwordInput.addEventListener('blur', function () {
            var value = DOM.passwordInput.value;
            if (value === '') {
                clearError(DOM.passwordGroup);
                DOM.passwordGroup.classList.remove('is-valid');
            } else if (value.length < 6) {
                setError(DOM.passwordGroup, 'Password must be at least 6 characters');
            } else {
                setValid(DOM.passwordGroup);
            }
        });

        DOM.passwordInput.addEventListener('input', function () {
            if (DOM.passwordGroup.classList.contains('has-error')) {
                if (DOM.passwordInput.value.length >= 6) {
                    setValid(DOM.passwordGroup);
                }
            }
        });
    }

    /* --------------------------------------------------------------------------
       Toast Notification System
       -------------------------------------------------------------------------- */
    function showToast(type, message, duration) {
        duration = duration || 4000;
        if (!DOM.toastContainer) return;

        var toast = document.createElement('div');
        toast.className = 'login-toast login-toast--' + type;

        var icons = {
            success: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };

        toast.innerHTML =
            '<span class="login-toast-icon">' + (icons[type] || '') + '</span>' +
            '<span class="login-toast-message">' + message + '</span>' +
            '<button class="login-toast-close" aria-label="Dismiss notification">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<line x1="18" y1="6" x2="6" y2="18"/>' +
                    '<line x1="6" y1="6" x2="18" y2="18"/>' +
                '</svg>' +
            '</button>';

        DOM.toastContainer.appendChild(toast);

        var closeBtn = toast.querySelector('.login-toast-close');
        closeBtn.addEventListener('click', function () {
            removeToast(toast);
        });

        setTimeout(function () {
            removeToast(toast);
        }, duration);
    }

    function removeToast(toast) {
        if (!toast || toast.classList.contains('is-exiting')) return;
        toast.classList.add('is-exiting');
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /* --------------------------------------------------------------------------
       Form Submission
       -------------------------------------------------------------------------- */
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var email = DOM.emailInput.value.trim();
            var role = DOM.roleInput.value;
            var password = DOM.passwordInput.value;
            var hasError = false;

            /* Validate email */
            if (email === '') {
                setError(DOM.emailGroup, 'Email address is required');
                shakeElement(DOM.emailGroup);
                hasError = true;
            } else {
                setValid(DOM.emailGroup);
            }

            /* Validate role */
            if (role === '') {
                setError(DOM.roleGroup, 'Please select your role');
                shakeElement(DOM.roleGroup);
                hasError = true;
            } else {
                setValid(DOM.roleGroup);
            }

            /* Validate password */
            if (password === '') {
                setError(DOM.passwordGroup, 'Password is required');
                shakeElement(DOM.passwordGroup);
                hasError = true;
            } else {
                setValid(DOM.passwordGroup);
            }

            if (hasError) {
                shakeElement(DOM.loginForm);
                return;
            }

            /* Show loading state */
            setLoadingState(true);

            /* Simulate authentication delay for the front-end demo. */
            setTimeout(function () {
                handleLoginSuccess();
            }, 1800);
        });
    }

    /* --------------------------------------------------------------------------
       Loading State Management
       -------------------------------------------------------------------------- */
    function setLoadingState(isLoading) {
        if (!DOM.loginBtn) return;
        DOM.loginBtn.classList.toggle('is-loading', isLoading);
        DOM.loginBtn.disabled = isLoading;
        DOM.emailInput.disabled = isLoading;
        if (DOM.roleInput) DOM.roleInput.disabled = isLoading;
        DOM.passwordInput.disabled = isLoading;

        if (DOM.togglePassword) {
            DOM.togglePassword.disabled = isLoading;
        }
    }

    /* --------------------------------------------------------------------------
       Login Success Handler
       -------------------------------------------------------------------------- */
    function handleLoginSuccess() {
        setLoadingState(false);
        showToast('success', 'Login successful! Redirecting to your dashboard...');

        /* Allow the dashboard auth check to recognize this demo login. */
        try {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('stackly_user_email', DOM.emailInput.value.trim());
            localStorage.setItem('stackly_user_role', DOM.roleInput.value);
        } catch (e) {
            /* localStorage not available */
        }

        /* Show success checkmark overlay */
        if (DOM.successOverlay) {
            DOM.successOverlay.classList.add('is-visible');
        }

        /* Save remember-me preference */
        if (DOM.rememberMe && DOM.rememberMe.checked) {
            try {
                localStorage.setItem('arjun_remember_email', DOM.emailInput.value.trim());
            } catch (e) {
                /* localStorage not available */
            }
        } else {
            try {
                localStorage.removeItem('arjun_remember_email');
            } catch (e) {
                /* localStorage not available */
            }
        }

        /* Redirect after animation */
        setTimeout(function () {
            window.location.href = 'dashboard.html';
        }, 2200);
    }

    /* --------------------------------------------------------------------------
       Login Failure Handler
       -------------------------------------------------------------------------- */
    function handleLoginFailure() {
        setLoadingState(false);
        shakeElement(DOM.loginForm);
        showToast('error', 'Please enter both your email and password.');
    }

    /* --------------------------------------------------------------------------
       Remember Me - Restore Saved Email
       -------------------------------------------------------------------------- */
    function restoreRememberedEmail() {
        try {
            var savedEmail = localStorage.getItem('arjun_remember_email');
            if (savedEmail && DOM.emailInput) {
                DOM.emailInput.value = savedEmail;
                if (DOM.rememberMe) {
                    DOM.rememberMe.checked = true;
                }
                if (isValidEmail(savedEmail)) {
                    setValid(DOM.emailGroup);
                }
            }
        } catch (e) {
            /* localStorage not available */
        }
    }

    restoreRememberedEmail();

    /* --------------------------------------------------------------------------
       Google Sign-In Button (Placeholder)
       -------------------------------------------------------------------------- */
    var googleBtn = document.querySelector('.login-google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            showToast('warning', 'Google Sign-In is not configured yet. Please use demo credentials.');
        });
    }

    /* --------------------------------------------------------------------------
       Forgot Password Link (Placeholder)
       -------------------------------------------------------------------------- */
    var forgotLink = document.querySelector('.login-forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function (e) {
            window.location.href = '404.html';
        });
    }

    /* --------------------------------------------------------------------------
       Keyboard Shortcuts
       -------------------------------------------------------------------------- */
    document.addEventListener('keydown', function (e) {
        /* Escape key clears focus */
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }

        /* Enter on password field submits form */
        if (e.key === 'Enter' && document.activeElement === DOM.passwordInput) {
            DOM.loginForm.dispatchEvent(new Event('submit'));
        }
    });

    /* --------------------------------------------------------------------------
       Remove shake animation class after it completes
       -------------------------------------------------------------------------- */
    document.addEventListener('animationend', function (e) {
        if (e.animationName === 'loginShake') {
            e.target.classList.remove('login-shake');
        }
    });

})();
