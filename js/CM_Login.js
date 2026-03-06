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
    
    // Initialize interest pills when switching to signup
    if (tab === 'signup') {
        initializeInterestPills();
    }
    
    // Clear all error messages when switching tabs
    clearAllErrors();
}

/**
 * Check URL hash on page load and switch to signup tab if needed
 */
window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#signup') {
        switchTab('signup');
    } else {
        // Initialize pills on page load if on signup tab
        initializeInterestPills();
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
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const location = document.getElementById('signup-location').value.trim();
    const interests = getSelectedInterests();
    let isValid = true;
    
    // Validate name
    if (!name) {
        showError('signup-name', 'signup-name-error', 'Full name is required');
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        showError('signup-email', 'signup-email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('signup-email', 'signup-email-error', 'Not a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showError('signup-password', 'signup-password-error', 'Password is required');
        isValid = false;
    } else if (!isPasswordStrong(password)) {
        showError('signup-password', 'signup-password-error', 'Password must be at least 8 characters with uppercase, lowercase, and a number');
        isValid = false;
    }
    
    // Validate interests
    if (interests.length === 0) {
        showError('', 'signup-interests-error', 'Please select at least one interest');
        isValid = false;
    }
    
    // Validate location
    if (!location) {
        showError('signup-location', 'signup-location-error', 'Location is required');
        isValid = false;
    }
    
    if (isValid) {
        // Form is valid, proceed with sign up (placeholder)
        console.log('Sign up form is valid');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Interests:', interests);
        console.log('Location:', location);
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

// Interest categories
var ALL_INTERESTS = ["Outdoors", "Running", "Coffee", "Music", "Sports", "Food", "Arts", "Tech", "Fitness", "Games", "Photography", "Travel"];

/**
 * Initialize interest pills when tab is shown
 */
function initializeInterestPills() {
    var pillsWrap = document.getElementById('interestPills');
    if (pillsWrap && pillsWrap.children.length === 0) {
        ALL_INTERESTS.forEach(function(interest) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pill';
            btn.textContent = interest;
            btn.onclick = function() {
                btn.classList.toggle('active');
                clearError('', 'signup-interests-error');
            };
            pillsWrap.appendChild(btn);
        });
    }
}

/**
 * Get selected interests
 * @returns {Array} Array of selected interest names
 */
function getSelectedInterests() {
    var activePills = document.querySelectorAll('#interestPills .pill.active');
    return Array.from(activePills).map(function(pill) { return pill.textContent; });
}

/**
 * Check password strength
 */
function checkPasswordStrength() {
    var password = document.getElementById('signup-password').value;
    var strengthDiv = document.getElementById('password-strength');
    var strengthFill = document.getElementById('strength-fill');
    var strengthText = document.getElementById('strength-text');
    
    if (password.length === 0) {
        strengthDiv.style.display = 'none';
        return;
    }
    
    strengthDiv.style.display = 'block';
    
    var strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    var percentage = (strength / 6) * 100;
    strengthFill.style.width = percentage + '%';
    
    if (strength <= 2) {
        strengthFill.style.backgroundColor = '#e74c3c';
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#e74c3c';
    } else if (strength <= 4) {
        strengthFill.style.backgroundColor = '#f39c12';
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#f39c12';
    } else {
        strengthFill.style.backgroundColor = '#27ae60';
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#27ae60';
    }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
function isPasswordStrong(password) {
    if (password.length < 8) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
}

/**
 * Request GPS location (placeholder for future implementation)
 */
function requestGPSLocation() {
    alert('GPS location feature is not yet available. Please enter your location manually.');
}
