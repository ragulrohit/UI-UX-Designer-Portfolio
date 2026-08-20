(function () {
    'use strict';
    var form = document.getElementById('signupForm');
    var fields = { name: document.getElementById('name'), role: document.getElementById('signupRole'), email: document.getElementById('signupEmail'), password: document.getElementById('signupPassword'), confirm: document.getElementById('confirmPassword') };
    var groups = { name: document.getElementById('nameGroup'), role: document.getElementById('signupRoleGroup'), email: document.getElementById('signupEmailGroup'), password: document.getElementById('signupPasswordGroup'), confirm: document.getElementById('confirmPasswordGroup') };
    var button = document.getElementById('signupBtn');
    var overlay = document.getElementById('successOverlay');
    var toast = document.getElementById('toastContainer');
    function setupPasswordToggle(input, toggle) {
        if (!input || !toggle) return;
        toggle.addEventListener('click', function () {
            var isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.classList.toggle('is-visible', isPassword);
            toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        });
    }
    setupPasswordToggle(fields.password, document.getElementById('toggleSignupPassword'));
    setupPasswordToggle(fields.confirm, document.getElementById('toggleConfirmPassword'));
    function mark(group, valid, message) { group.classList.toggle('is-valid', valid); group.classList.toggle('has-error', !valid); if (message) group.querySelector('.login-error-message').textContent = message; }
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var valid = true;
        Object.keys(fields).forEach(function (key) { if (!fields[key].value.trim()) { mark(groups[key], false); valid = false; } else mark(groups[key], true); });
        if (fields.password.value && fields.confirm.value && fields.password.value !== fields.confirm.value) { mark(groups.confirm, false, 'Passwords must match'); valid = false; }
        if (!valid) { form.classList.remove('login-shake'); void form.offsetWidth; form.classList.add('login-shake'); return; }
        button.classList.add('is-loading'); button.disabled = true;
        setTimeout(function () { button.classList.remove('is-loading'); try { localStorage.removeItem('isLoggedIn'); localStorage.setItem('stackly_pending_email', fields.email.value.trim()); localStorage.setItem('stackly_pending_role', fields.role.value); } catch (e) {} if (toast) toast.innerHTML = '<div class="login-toast login-toast--success"><span class="login-toast-message">Account created! Redirecting to sign in...</span></div>'; if (overlay) overlay.classList.add('is-visible'); setTimeout(function () { window.location.href = 'login.html'; }, 1800); }, 900);
    });
}());
