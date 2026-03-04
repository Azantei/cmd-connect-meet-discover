/* ==========================================
   C.M.D. - LOGIN/SIGNUP
   Tab switching between sign in and sign up forms
========================================== */

/**
 * Switch between sign in and sign up tabs
 * @param {string} tab - Tab identifier ('signin' or 'signup')
 */
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    const idx = tab === 'signin' ? 0 : 1;
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');
    
    // Clear all error messages when switching tabs
    clearAllErrors();
}

/**
 * Check URL hash on page load and switch to signup tab if needed
 */
window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#signup') {
        switchTab('signup');
    }
});

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show error message for a specific input
 * @param {string} inputId - ID of the input element
 * @param {string} errorId - ID of the error message element
 * @param {string} message - Error message to display
 */
function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    if (input) input.classList.add('error');
    if (errorElement) errorElement.textContent = message;
}

/**
 * Clear error message for a specific input
 * @param {string} inputId - ID of the input element
 * @param {string} errorId - ID of the error message element
 */
function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    if (input) input.classList.remove('error');
    if (errorElement) errorElement.textContent = '';
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input.error').forEach(el => el.classList.remove('error'));
}

/**
 * Validate sign in form
 * @param {Event} event - Click event
 */
function validateSignIn(event) {
    event.preventDefault();
    clearAllErrors();
    
    const email = document.getElementById('signin-email').value.trim();
    let isValid = true;
    
    // Validate email
    if (!email) {
        showError('signin-email', 'signin-email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signin-email', 'signin-email-error', 'Not a valid email address');
        isValid = false;
    }
    
    if (isValid) {
        // Form is valid, proceed with sign in (placeholder)
        console.log('Sign in form is valid');
        // Here you would normally submit the form or make an API call
    }
}

/**
 * Validate sign up form
 * @param {Event} event - Click event
 */
function validateSignUp(event) {
    event.preventDefault();
    clearAllErrors();
    
    const email = document.getElementById('signup-email').value.trim();
    let isValid = true;
    
    // Validate email
    if (!email) {
        showError('signup-email', 'signup-email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signup-email', 'signup-email-error', 'Not a valid email address');
        isValid = false;
    }
    
    if (isValid) {
        // Form is valid, proceed with sign up (placeholder)
        console.log('Sign up form is valid');
        // Here you would normally submit the form or make an API call
    }
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of the password input
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        // Change icon to "eye-off" when password is visible
        button.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        // Change icon back to "eye" when password is hidden
        button.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}
